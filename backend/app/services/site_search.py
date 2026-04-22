import asyncio
import re
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup
from curl_cffi.requests import AsyncSession

async def fetch_with_curl_cffi(url: str) -> str:
    """Fetch page content using curl_cffi to bypass bot detection."""
    async with AsyncSession() as s:
        response = await s.get(url, impersonate="chrome", timeout=30)
        response.raise_for_status()
        return response.text

async def search_amazon(product_title: str) -> tuple[Optional[str], Optional[float]]:
    """Search Amazon using curl_cffi and return first product URL and price."""
    search_url = f"https://www.amazon.in/s?k={product_title.replace(' ', '+')}"
    try:
        html = await fetch_with_curl_cffi(search_url)
        soup = BeautifulSoup(html, 'lxml')
        
        # Find first search result
        first_result = soup.select_one("div[data-component-type='s-search-result']")
        if first_result:
            link_elem = first_result.select_one("a.a-link-normal")
            url = link_elem.get("href") if link_elem else None
            if url and not url.startswith("http"):
                url = "https://www.amazon.in" + url
                
            price_elem = first_result.select_one("span.a-price-whole")
            price = None
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price = float(price_text.replace(',', '')) if price_text else None
            return url, price
    except Exception as e:
        print(f"Amazon search failed: {e}")
    return None, None

async def search_flipkart(product_title: str) -> tuple[Optional[str], Optional[float]]:
    """Search Flipkart using curl_cffi and return first product URL and price."""
    search_url = f"https://www.flipkart.com/search?q={product_title.replace(' ', '%20')}"
    try:
        html = await fetch_with_curl_cffi(search_url)
        soup = BeautifulSoup(html, 'lxml')
        
        # Find first search result
        # Flipkart's grid vs list view classes
        first_result = soup.select_one("div._1AtVbE") or soup.select_one("div._2kHMtA") or soup.select_one("div[data-id]")
        if first_result:
            link_elem = first_result.select_one("a")
            url = link_elem.get("href") if link_elem else None
            if url and not url.startswith("http"):
                url = "https://www.flipkart.com" + url
                
            price_elem = first_result.select_one("div.Nx9bqj") or first_result.select_one("div._30jeq3")
            price = None
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price = float(re.sub(r'[^\d.]', '', price_text)) if price_text else None
            return url, price
    except Exception as e:
        print(f"Flipkart search failed: {e}")
    return None, None

async def search_product_on_site(product_title: str, site: str) -> Dict[str, Any]:
    """Main dispatcher for site search."""
    if site == "amazon":
        url, price = await search_amazon(product_title)
    elif site == "flipkart":
        url, price = await search_flipkart(product_title)
    else:
        return {"platform": site, "price": None, "url": None}
    
    return {"platform": site, "price": price, "url": url}
