from functools import lru_cache
import logging

# Suppress warnings from thinc/spaCy about deprecated torch.cuda.amp.autocast
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, message=".*torch*")

# Lazy, cached loading of heavy ML models used across the application
# ---------------------------------------------------------------
# We centralise this here so that ingest.py, query.py and any other
# modules only import the models once.  Subsequent calls just return the
# cached singleton, eliminating redundant initialisation and memory use.

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMER_AVAILABLE = True
except ImportError:
    logging.warning("SentenceTransformer not available. Embedding functionality will be limited.")
    SENTENCE_TRANSFORMER_AVAILABLE = False

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    logging.warning("spaCy not available. NLP functionality will be limited.")
    SPACY_AVAILABLE = False


@lru_cache(maxsize=1)
def get_spacy_model():
    """Return a cached spaCy model.

    Tries to load models in order of preference:
    1. en_core_web_sm (small model)
    2. en_core_web_md (medium model, if small not available)
    3. en (basic model, if others not available)
    4. None (if no models available)
    """
    if not SPACY_AVAILABLE:
        logging.warning("spaCy not installed. NLP features will be limited.")
        return None

    try:
        # Try to load the small model first
        try:
            logging.info("Loading spaCy model: en_core_web_sm")
            return spacy.load("en_core_web_sm")
        except OSError:
            # Try medium model
            try:
                logging.warning("Small spaCy model not found, trying medium model...")
                return spacy.load("en_core_web_md")
            except OSError:
                # Last resort: basic English model
                logging.warning("No specific models found, loading basic English model...")
                return spacy.load("en")
    except Exception as e:
        logging.error(f"Failed to load any spaCy model: {str(e)}")
        logging.warning("Install a spaCy model with: python -m spacy download en_core_web_sm")
        return None


@lru_cache(maxsize=1)
def get_embedding_model():
    """Return a cached SentenceTransformer model for embeddings."""
    if not SENTENCE_TRANSFORMER_AVAILABLE:
        logging.warning("SentenceTransformer not available. Embeddings will not work.")
        return None

    try:
        logging.info("Loading SentenceTransformer model: all-MiniLM-L6-v2")
        return SentenceTransformer("all-MiniLM-L6-v2")
    except Exception as e:
        logging.error(f"Failed to load SentenceTransformer: {str(e)}")
        return None
