import os
import httpx
from typing import List, Dict, Any
from urllib.parse import quote

async def search_google_shopping(product_title: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Search Google Shopping via SerpAPI and return offers with valid URLs."""
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        raise ValueError("SERPAPI_KEY not set")

    params = {
        "api_key": api_key,
        "engine": "google_shopping",
        "q": product_title,
        "gl": "in",
        "hl": "en",
        "num": max_results
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get("https://serpapi.com/search", params=params)
        response.raise_for_status()
        data = response.json()

    shopping_results = data.get("shopping_results", [])
    offers = []
    for item in shopping_results[:max_results]:
        # Extract store name
        store = item.get("source", "Unknown")
        # Extract price (already a string or None)
        price = item.get("price")
        # Extract direct product link
        direct_link = item.get("link")
        # If no direct link, create a search URL for that store
        if not direct_link:
            # Build a search URL for the store (example: amazon.in search)
            if "amazon" in store.lower():
                direct_link = f"https://www.amazon.in/s?k={quote(product_title)}"
            elif "flipkart" in store.lower():
                direct_link = f"https://www.flipkart.com/search?q={quote(product_title)}"
            elif "myntra" in store.lower():
                direct_link = f"https://www.myntra.com/{quote(product_title)}"
            else:
                direct_link = f"https://www.google.com/search?q={quote(product_title)}+{quote(store)}"
        offers.append({
            "platform": store,
            "price": price,
            "url": direct_link,
            "title": item.get("title", product_title)
        })
    return offers
