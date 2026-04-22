import os
import re
import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict, Any
from urllib.parse import quote
from app.services.scraperapi import fetch_via_scraperapi

async def search_flipkart(product_title: str) -> Optional[Dict[str, Any]]:
    """Search Flipkart for the product title and return first result's URL and price."""
    # Clean the title: remove brackets, extra specs often found in Amazon titles
    # e.g. "Apple iPhone 15 (128 GB) - Blue" -> "Apple iPhone 15"
    clean_title = re.split(r'\(|\-|\[', product_title)[0].strip()
    if not clean_title:
        clean_title = product_title[:40] # Fallback to first 40 chars
        
    search_url = f"https://www.flipkart.com/search?q={quote(clean_title)}"
    print(f"Searching Flipkart with cleaned title: {clean_title}")
    
    try:
        html = await fetch_via_scraperapi(search_url)
        soup = BeautifulSoup(html, 'lxml')
        
        # Broader search for product containers
        # Try both list and grid view containers
        containers = soup.select("div[data-id]") or soup.select("div._1AtVbE") or soup.select("div._2kHMtA")
        
        if not containers:
            print("No Flipkart product containers found.")
            return None
            
        first_result = containers[0]
        
        # Extract product URL - look for any link containing '/p/' (product page)
        link_elem = first_result.select_one("a[href*='/p/']")
        if not link_elem:
            print("No Flipkart product link found in container.")
            return None
            
        relative_url = link_elem.get('href')
        product_url = "https://www.flipkart.com" + relative_url if relative_url.startswith('/') else relative_url
        
        # Extract price - look for various price classes or text containing ₹
        price_elem = (
            first_result.select_one("div._30jeq3") or 
            first_result.select_one("div._25b18c") or
            first_result.find(text=re.compile(r'₹'))
        )
        
        price = None
        if price_elem:
            price_text = price_elem.get_text(strip=True).replace('₹', '').replace(',', '')
            # Clean non-digit characters except decimal
            price_text = re.sub(r'[^\d.]', '', price_text)
            try:
                price = float(price_text)
            except:
                pass
        
        # Extract title
        title_elem = (
            first_result.select_one("div._4rR01T") or 
            first_result.select_one("a.IRpwTa") or
            first_result.select_one("a.s1Q9rs")
        )
        title = title_elem.get_text(strip=True) if title_elem else clean_title
        
        return {
            "url": product_url,
            "price": price,
            "title": title
        }
    except Exception as e:
        print(f"Error searching Flipkart: {e}")
        return None
    except Exception as e:
        print(f"Error searching Flipkart: {e}")
        return None

async def get_flipkart_product_price(product_url: str) -> Optional[float]:
    """Fetch exact price from Flipkart product page."""
    try:
        html = await fetch_via_scraperapi(product_url)
        soup = BeautifulSoup(html, 'lxml')
        price_elem = soup.select_one("div._30jeq3") or soup.select_one("div._25b18c")
        if price_elem:
            price_text = price_elem.get_text(strip=True).replace('₹', '').replace(',', '')
            return float(price_text)
    except Exception as e:
        print(f"Error fetching Flipkart product price: {e}")
    return None
