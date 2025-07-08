#!/usr/bin/env python3
"""
GraphRAG Ingestion Pipeline - Supports both full ingestion and incremental updates.
"""

# Suppress warnings
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, message=".*torch*")

import json
from neo4j import GraphDatabase
from typing import List, Dict
from tqdm import tqdm
from utils.custom_logger import get_logger
from utils.text_processing import extract_keywords
from utils.ml_models import get_embedding_model
from utils.neo4j_utils import clear_database as util_clear_db, create_basic_indexes

logger = get_logger()

class GraphRAGIngestion:
    def __init__(self, uri: str = "bolt://localhost:7687", username: str = "neo4j", password: str = "987654321"):
        """Initialize Neo4j connection and ML models."""
        try:
            self.driver = GraphDatabase.driver(uri, auth=(username, password))
            print("✓ Connected to Neo4j")
        except Exception as e:
            logger.error(f"❌ Error connecting to Neo4j: {e}")
            raise e
        
        print("🤖 Loading ML models...")
        self.embedding_model = get_embedding_model()
        if self.embedding_model is None:
            print("⚠️ Warning: Embedding model could not be loaded.")

    def close(self):
        """Close Neo4j connection."""
        self.driver.close()
        print("✓ Connection closed")

    def load_json_data(self, json_file_path: str) -> List[Dict]:
        """Load section data from a JSON file."""
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data.get('sections', [])
        except FileNotFoundError:
            logger.error(f"❌ JSON file not found at {json_file_path}")
            return []

    def upsert_section_nodes(self, sections: List[Dict]):
        """
        Create or update section nodes in Neo4j using MERGE.
        This is idempotent and safe to run multiple times.
        """
        print("--- Upserting Section Nodes ---")
        query = """
        UNWIND $sections as section
        MERGE (n:Section {id: section.id})
        ON CREATE SET
            n.title = section.title,
            n.text = section.text,
            n.level = section.level,
            n.page_number = section.page_number,
            n.parent_id = section.parent_id,
            n.word_count = size(split(section.text, ' ')),
            n.keywords = section.keywords,
            n.embedding = section.embedding,
            n.created_at = timestamp()
        ON MATCH SET
            n.title = section.title,
            n.text = section.text,
            n.level = section.level,
            n.page_number = section.page_number,
            n.parent_id = section.parent_id,
            n.word_count = size(split(section.text, ' ')),
            n.keywords = section.keywords,
            n.embedding = section.embedding,
            n.updated_at = timestamp()
        """
        # Pre-process sections to add keywords and embeddings
        processed_sections = []
        for section in tqdm(sections, desc="Generating keywords and embeddings"):
            section['keywords'] = extract_keywords(section['text'])
            if self.embedding_model:
                section['embedding'] = self.embedding_model.encode(section['text']).tolist()
            else:
                section['embedding'] = []
            processed_sections.append(section)

        with self.driver.session() as session:
            session.run(query, sections=processed_sections)
        print(f"✓ Upserted {len(sections)} nodes.")

    def refresh_relationships(self):
        """
        Deletes all existing relationships and recreates them in batches
        to avoid out-of-memory errors. Requires APOC plugin.
        """
        print("--- Refreshing All Relationships (in Batches) ---")
        with self.driver.session() as session:
            # Step 1: Delete all existing relationships in batches using APOC
            print("✓ Deleting existing relationships in batches...")
            delete_query = """
            CALL apoc.periodic.iterate(
                "MATCH ()-[r]-() RETURN id(r) AS id",
                "MATCH ()-[r]-() WHERE id(r) = id DELETE r",
                {batchSize: 1000}
            )
            """
            try:
                session.run(delete_query)
                print("✓ Batch deletion complete.")
            except Exception as e:
                print(f"❌ Error during batch deletion: {e}")
                print("⚠️ Make sure the APOC plugin is installed in your Neo4j database.")
                raise e

            # Step 2: Recreate hierarchical relationships (usually safe as-is, but can be batched if needed)
            print("✓ Recreating HAS_SUBSECTION/PARENT relationships...")
            session.run("""
                MATCH (parent:Section), (child:Section)
                WHERE parent.id = child.parent_id
                MERGE (parent)-[:HAS_SUBSECTION]->(child)
                MERGE (child)-[:PARENT]->(parent)
            """)
            print("✓ HAS_SUBSECTION/PARENT relationships recreated.")

            # Step 3: Recreate sibling relationships (usually safe as-is)
            print("✓ Recreating NEXT relationships...")
            session.run("""
                MATCH (s1:Section)-[:PARENT]->(p)<-[:PARENT]-(s2:Section)
                WHERE s1.id < s2.id AND NOT EXISTS {
                    MATCH (s1)-[:PARENT]->(p)<-[:PARENT]-(s3:Section)
                    WHERE s1.id < s3.id AND s3.id < s2.id
                }
                MERGE (s1)-[:NEXT]->(s2)
            """)
            print("✓ NEXT relationships recreated.")
        # Note: Semantic relationships (KEYWORD_MENTIONS, SEMANTIC_SIMILAR_TO)
        # would also be recreated here. For simplicity, this example focuses
        # on the structural relationships.

    def ingest_data(self, json_file_path: str):
        """Full ingestion process: clears the DB and loads everything."""
        print("🚀 Starting FULL GraphRAG Ingestion Process")
        util_clear_db(self.driver)
        create_basic_indexes(self.driver)
        
        sections = self.load_json_data(json_file_path)
        if not sections:
            print("❌ No data to ingest")
            return
        
        self.upsert_section_nodes(sections)
        self.refresh_relationships()
        print("\n✅ Full ingestion completed successfully!")

    def update_graph(self, json_file_path: str):
        """Incremental update process: upserts nodes and refreshes relationships."""
        print("🚀 Starting INCREMENTAL Graph Update Process")
        
        sections = self.load_json_data(json_file_path)
        if not sections:
            print("❌ No data for update")
            return
        
        self.upsert_section_nodes(sections)
        self.refresh_relationships()
        print("\n✅ Graph update completed successfully!")


def main():
    """Main function for command-line execution (full ingestion)."""
    JSON_FILE_PATH = "data/structured_content.json"
    ingestion = GraphRAGIngestion()
    try:
        ingestion.ingest_data(JSON_FILE_PATH)
    except Exception as e:
        logger.error(f"❌ Error during ingestion: {e}")
    finally:
        ingestion.close()

if __name__ == "__main__":
    main()
