"""Shared helpers for working with Google's Gemini API."""
from __future__ import annotations

import os
import json
import logging
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv
import google.generativeai as genai

# Import Neo4j driver for knowledge graph operations
try:
    from neo4j import GraphDatabase, Driver
except ImportError:
    # If neo4j is not installed, provide a helpful error message
    print("Error: Neo4j Python driver not found. Please install with: pip install neo4j==5.15.0")
    # Create a placeholder for type hints if the import fails
    class Driver:
        pass

# Set up logger
logger = logging.getLogger(__name__)

# Define available models for fallback
AVAILABLE_GEMINI_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]

# ---------------------------------------------------------------------------
# Client helper
# ---------------------------------------------------------------------------

def get_gemini_client(api_key: Optional[str] = None) -> bool:
    """Configure Gemini API and return True if successful."""
    if not api_key:
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return False

    genai.configure(api_key=api_key)
    return True


def get_available_model(preferred_model: str) -> str:
    """Check if the preferred model is available, otherwise return a fallback model.

    Parameters
    ----------
    preferred_model : str
        The model name that the user prefers to use

    Returns
    -------
    str
        Available model name to use (either preferred or fallback)
    """
    try:
        # Try to list available models to validate
        models = genai.list_models()
        available_models = [model.name for model in models]

        # Extract just the model name from full paths like 'models/gemini-1.5-flash'
        model_names = [m.split('/')[-1] for m in available_models]

        # Check if preferred model is available
        if preferred_model in model_names or f"models/{preferred_model}" in available_models:
            return preferred_model

        # Find the first available fallback model
        for fallback_model in AVAILABLE_GEMINI_MODELS:
            if fallback_model in model_names or f"models/{fallback_model}" in available_models:
                logger.warning(f"Preferred model '{preferred_model}' not available, using '{fallback_model}' instead")
                return fallback_model

        # If no models from our list are available, use the first available model
        if available_models:
            model_name = available_models[0].split('/')[-1]
            logger.warning(f"Using available model: {model_name}")
            return model_name

        return "gemini-1.5-flash"  # Default fallback
    except Exception as e:
        logger.warning(f"Error checking available models: {e}. Using default model.")
        return "gemini-1.5-flash"  # Default if we can't check


# ---------------------------------------------------------------------------
# Chat completion helper
# ---------------------------------------------------------------------------

def call_chat_completion(
    client_configured: bool,
    prompt: str,
    model: str = "gemini-1.5-flash",
    max_tokens: int = 1500,
    temperature: float = 0.7,
    system_message: str = """You are an expert assistant for the MOSDAC (Meteorological and Oceanographic Satellite Data Archival Centre) portal.
    - Always structure your responses in clear sections with headings.
    - Prioritize relevant meteorological and oceanographic information.
    - If you're unsure, state this clearly rather than providing potentially incorrect information.
    - Provide concise answers focused only on the user's specific question.
    - Format technical data in tables when appropriate.
    """,
) -> str:
    """Send a single-prompt chat completion request and return the text.

    A lightweight wrapper that gracefully handles the case where the client
    is not configured and captures exceptions so callers can surface the error
    message while keeping the original logging semantics.
    """
    if not client_configured:
        return "Gemini client not available. Please check your API key configuration."

    try:
        # Check for model availability and get a valid model
        available_model = get_available_model(model)
        if available_model != model:
            logger.info(f"Using {available_model} instead of {model}")

        # Create a GenerativeModel object
        model_obj = genai.GenerativeModel(model_name=available_model)

        # Generate content with system message + prompt
        chat = model_obj.start_chat(history=[])
        response = chat.send_message(
            f"{system_message}\n\n{prompt}",
            generation_config={
                "max_output_tokens": max_tokens,
                "temperature": temperature
            }
        )

        return response.text
    except Exception as exc:  # Broad except to propagate the error string
        logger.error(f"Error in call_chat_completion: {exc}")
        return f"Error generating LLM response: {exc}"


# ---------------------------------------------------------------------------
# Enhanced chat completion with two-stage approach
# ---------------------------------------------------------------------------

def enhanced_chat_completion(
    client_configured: bool,
    user_query: str,
    knowledge_context: str = None,
    model: str = "gemini-1.5-flash"
) -> str:
    """Two-stage approach: first analyze the query, then answer with context."""
    if not client_configured:
        return "Gemini client not available. Please check your API key configuration."

    try:
        # Check for model availability and get a valid model
        available_model = get_available_model(model)
        if available_model != model:
            logger.info(f"Using {available_model} instead of {model}")

        model_obj = genai.GenerativeModel(model_name=available_model)

        # Stage 1: Analyze the query to identify entities and intent
        analysis_prompt = f"""Analyze this user query about MOSDAC data.
        Identify: 1) Main intent, 2) Key entities, 3) Required knowledge context.
        Query: {user_query}"""

        analysis = model_obj.generate_content(analysis_prompt).text

        # Stage 2: Answer the query with relevant context
        answer_prompt = f"""Based on this analysis: {analysis}

        And this knowledge context: {knowledge_context if knowledge_context else 'No specific context provided'}

        Now provide a structured answer to the original query: {user_query}"""

        response = model_obj.generate_content(answer_prompt)
        return response.text
    except Exception as exc:
        logger.error(f"Error in enhanced_chat_completion: {exc}")
        return f"Error generating LLM response: {exc}"


# ---------------------------------------------------------------------------
# Knowledge Graph integration
# ---------------------------------------------------------------------------

def get_kg_context(query: str, kg_client: Driver) -> str:
    """Extract relevant context from knowledge graph based on query.

    Parameters
    ----------
    query : str
        The natural language query from the user
    kg_client : neo4j.Driver
        Active Neo4j driver instance to execute Cypher queries

    Returns
    -------
    str
        Context extracted from knowledge graph as a formatted string
    """
    # First use Gemini to convert natural language to a structured query
    try:
        if kg_client is None:
            return "No knowledge graph connection available."

        # Check for model availability and get a valid model
        available_model = get_available_model("gemini-1.5-pro")
        if available_model != "gemini-1.5-pro":
            logger.info(f"Using {available_model} instead of gemini-1.5-pro for Cypher query generation")

        model_obj = genai.GenerativeModel(model_name=available_model)
        cypher_prompt = f"""Convert this natural language query to a Cypher query for a Neo4j knowledge graph
        about meteorological and oceanographic data:
        Query: {query}

        The knowledge graph has nodes like: Satellite, Product, Dataset, Parameter
        And relationships like: PROVIDES, CONTAINS, MEASURES

        Return ONLY the Cypher query without any explanation."""

        cypher_query = model_obj.generate_content(cypher_prompt).text.strip()
        logger.info(f"Generated Cypher query: {cypher_query}")

        # Execute the Cypher query against the knowledge graph
        results = []
        with kg_client.session() as session:
            result = session.run(cypher_query)
            # Process the results into a usable format
            for record in result:
                results.append(dict(record))

        # Format the results as a string to be used as context
        if not results:
            return "No relevant information found in the knowledge graph."

        # Format the results as a JSON string for easy parsing
        context = json.dumps(results, indent=2)
        return f"Knowledge graph results: {context}"
    except Exception as exc:
        logger.error(f"Error in get_kg_context: {exc}")
        return f"Error retrieving KG context: {exc}"


# ---------------------------------------------------------------------------
# Complete workflow function
# ---------------------------------------------------------------------------

def answer_mosdac_query(query: str, api_key: Optional[str] = None, kg_client=None) -> str:
    """Complete workflow to answer a MOSDAC query using Gemini and the knowledge graph."""
    # Initialize the Gemini client
    client_configured = get_gemini_client(api_key)
    if not client_configured:
        return "Gemini client not available. Please check your API key configuration."

    # Get knowledge graph context
    kg_context = get_kg_context(query, kg_client)

    # Generate structured response
    response = enhanced_chat_completion(
        client_configured=True,
        user_query=query,
        knowledge_context=kg_context
    )

    return response
