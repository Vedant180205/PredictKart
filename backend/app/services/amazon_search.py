import os
import re
import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict, Any
from urllib.parse import quote
from app.services.scraperapi import fetch_via_scraperapi

async def search_amazon(product_title: str) -> Optional[Dict[str, Any]]:
    """Search Amazon for the product title and return first result's URL and price."""
    # Clean title for better search results
    clean_title = re.split(r'\(|\-|\[', product_title)[0].strip()
    if not clean_title:
        clean_title = product_title[:40]
        
    search_url = f"https://www.amazon.in/s?k={quote(clean_title)}"
    print(f"Searching Amazon with cleaned title: {clean_title}")
    
    try:
        html = await fetch_via_scraperapi(search_url)
        soup = BeautifulSoup(html, 'lxml')
        
        # Amazon search result containers
        containers = soup.select('div[data-component-type="s-search-result"]')
        if not containers:
            print("No Amazon product containers found.")
            return None
            
        first_result = containers[0]
        
        # URL
        link_elem = first_result.select_one('h2 a.a-link-normal')
        if not link_elem:
            return None
        relative_url = link_elem.get('href')
        product_url = "https://www.amazon.in" + relative_url if relative_url.startswith('/') else relative_url
        
        # Price
        price_whole = first_result.select_one('.a-price-whole')
        price = None
        if price_whole:
            price_text = price_whole.get_text(strip=True).replace(',', '')
            try:
                price = float(price_text)
            except:
                pass
                
        # Title
        title_elem = first_result.select_one('h2 a.a-link-normal span')
        title = title_elem.get_text(strip=True) if title_elem else clean_title
        
        return {
            "url": product_url,
            "price": price,
            "title": title
        }
    except Exception as e:
        print(f"Error searching Amazon: {e}")
        return None
