import os
import groq
from typing import Dict, Any, Optional, List

# Load API key
groq_client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

def format_offers_table(offers: List[Dict[str, Any]], original_price: Optional[float] = None) -> str:
    """Create a markdown-like table of price comparisons."""
    if not offers:
        return ""
    table = "Price Comparison:\n| Store | Price |\n|-------|-------|\n"
    if original_price:
        table += f"| Amazon (current) | ₹{original_price:.2f} |\n"
    for offer in offers:
        price = offer.get('price', 'N/A')
        platform = offer.get('platform', 'Unknown')
        table += f"| {platform} | {price} |\n"
    return table

def build_context(product: Optional[Dict[str, Any]] = None, offers: Optional[List[Dict[str, Any]]] = None) -> str:
    context = ""
    if product:
        context += f"Product: {product.get('title', 'Unknown')}\n"
        context += f"Current Price (Amazon): ₹{product.get('current_price', 'N/A')}\n"
        specs = product.get('specifications', {})
        if specs:
            context += "Key Specifications:\n"
            # Include top 10 specs for better context
            for key, value in list(specs.items())[:10]:
                context += f"- {key}: {value}\n"
    if offers:
        context += "\n" + format_offers_table(offers, product.get('current_price') if product else None)
    return context

async def get_ai_answer(query: str, product: Optional[Dict[str, Any]] = None, offers: Optional[List[Dict[str, Any]]] = None) -> str:
    if not groq_client.api_key:
        raise ValueError("GROQ_API_KEY not set")

    context = build_context(product, offers)
    system_prompt = (
        "You are a savvy shopping advisor. Use the product details and price comparison table to answer the user's question. "
        "Be concise, practical, and recommend the best store to buy from if asked. If the user asks about waiting for a better price, "
        "consider the current prices and typical market trends. Do not mention that you are an AI; just give advice."
    )
    user_prompt = f"Context:\n{context}\n\nUser Question: {query}\nAnswer:"

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            model=MODEL,
            temperature=0.7,
            max_tokens=500,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")
