"""Common text-processing helpers shared by ingest and query pipelines."""
from typing import List, Set, Tuple, Optional
import re
import logging

# Flag to track if we have proper NLP capabilities
NLP_AVAILABLE = False

# Add error handling for spaCy imports
try:
    from spacy.lang.en.stop_words import STOP_WORDS
    import spacy
    NLP_AVAILABLE = True
except ImportError:
    logging.warning("spaCy not found or not properly installed. Using basic text processing instead.")
    # Create fallback STOP_WORDS set with common English stop words
    STOP_WORDS = set([
        "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "by",
        "in", "of", "is", "are", "was", "were", "be", "been", "being", "have", "has",
        "had", "do", "does", "did", "can", "could", "shall", "should", "will", "would",
        "may", "might", "must", "that", "which", "who", "whom", "this", "these", "those",
        "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them"
    ])

try:
    from utils.ml_models import get_spacy_model
except ImportError:
    logging.warning("Could not import get_spacy_model, using fallback extraction")
    get_spacy_model = lambda: None


def clean_phrase(phrase: str) -> str:
    """Remove stop-words from a phrase and normalise whitespace."""
    tokens = [t for t in phrase.split() if t.lower() not in STOP_WORDS]
    return " ".join(tokens)


def fix_hyphenated_linebreaks(text: str) -> str:
    """Undo hyphen-newline line breaks that split words across lines.

    Example: "inter-\nnet" -> "internet"
    """
    # Removes hyphen + newline (optionally surrounded by whitespace)
    text = re.sub(r"-\s*\n\s*", "", text)
    # Replace remaining newlines with a single space for easier NLP parsing
    text = re.sub(r"\n+", " ", text)
    return text


def extract_keywords(text: str) -> List[str]:
    """Return a deduplicated list of key noun / verb phrases from *text*.

    Uses spaCy if available, falls back to simple word extraction if not.
    """
    # Clean and normalize the text first
    text = fix_hyphenated_linebreaks(text)

    # If spaCy is available, use NLP-based extraction
    if NLP_AVAILABLE:
        try:
            nlp = get_spacy_model()
            if nlp:
                doc = nlp(text)
                phrases = set()

                # 1. Cleaned noun chunks
                for chunk in doc.noun_chunks:
                    phrase = clean_phrase(chunk.text.strip()).lower()
                    if 1 <= len(phrase.split()) <= 5:
                        phrases.add(phrase)

                # 2. Cleaned verb + object phrases
                for token in doc:
                    if token.pos_ == "VERB":
                        for child in token.children:
                            if child.dep_ in {"dobj", "attr", "pobj"}:
                                phrase = clean_phrase(f"{token.text} {child.text}")
                                if 1 <= len(phrase.split()) <= 5:
                                    phrases.add(phrase)

                # Filter out phrases that are solely stop words and return
                keywords = [p.lower() for p in phrases if not all(w in STOP_WORDS for w in p.split())]
                return sorted(set(keywords))
        except Exception as e:
            logging.warning(f"Error using spaCy for keyword extraction: {e}")
            # Fall through to basic extraction if there's an error

    # Fallback to basic extraction
    # Split by common delimiters and filter out stop words and short tokens
    words = re.findall(r"\b\w+\b", text.lower())
    filtered_words = [word for word in words if word not in STOP_WORDS and len(word) > 3]

    # For multi-word phrases, use simple adjacent words as bigrams
    bigrams = []
    for i in range(len(filtered_words) - 1):
        bigram = f"{filtered_words[i]} {filtered_words[i+1]}"
        if len(bigram) > 7:  # Ensure reasonable length
            bigrams.append(bigram)

    # Combine words and bigrams, removing duplicates
    return sorted(set(filtered_words + bigrams))


def calculate_keyword_matches(
    main_keywords: List[str],
    related_keywords: List[str],
    excluded_keywords: List[str] | None = None,
):
    """Return (matching_keywords, count) after optional exclusion list."""
    main_set = {kw.lower() for kw in main_keywords} if main_keywords else set()
    related_set = {kw.lower() for kw in related_keywords} if related_keywords else set()

    if excluded_keywords:
        excl_set = {kw.lower() for kw in excluded_keywords}
        main_set -= excl_set

    matching = list(main_set & related_set)
    return matching, len(matching)
