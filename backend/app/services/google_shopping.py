import asyncio
import re
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from curl_cffi import requests

async def search_google_shopping(product_name: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Search Google Shopping and return product listings with title, price, store, and link.
    """
    def _sync_search():
        # Build search URL
        search_url = f"https://www.google.com/search?q={product_name.replace(' ', '+')}&tbm=shop"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        }
        try:
            # impersonate Chrome 120 to look like a real browser
            response = requests.get(search_url, impersonate="chrome120", headers=headers, timeout=30)
            if response.status_code != 200:
                print(f"Google Shopping search failed with status: {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            results = []
            
            # Google Shopping result containers
            containers = soup.select('div.sh-dgr__gr-auto') or \
                         soup.select('div.sh-dlr__list-result') or \
                         soup.select('div.i0X6df') or \
                         soup.select('div.sh-dgr__content') or \
                         soup.select('div.sh-dlr__content')
            
            if not containers:
                # Look for generic result blocks
                containers = soup.select('.sh-dgr__grid-result') or \
                             soup.select('.sh-dlr__list-result')

            for container in containers[:max_results]:
                # Extract title
                title_elem = container.select_one('h3') or \
                             container.select_one('h4') or \
                             container.select_one('.XjN31') or \
                             container.select_one('div[role="heading"]')
                title = title_elem.get_text(strip=True) if title_elem else "N/A"
                
                if title == "N/A" or "More information" in title:
                    continue

                # Extract price
                # Look for span containing currency symbol or aria-label with "Rupees"
                price_elem = container.select_one('span[aria-label*="Rupees"]') or \
                             container.select_one('span[aria-label*="INR"]') or \
                             container.find(string=re.compile(r'₹'))
                
                # If no specific price element, try to find text matching currency pattern
                if not price_elem:
                    price_text_elem = container.find(string=re.compile(r'₹\s?[\d,]+'))
                    price_text = price_text_elem if price_text_elem else ""
                else:
                    price_text = price_elem.get_text(strip=True)

                price = None
                if price_text:
                    match = re.search(r'[\d,]+\.?\d*', price_text)
                    if match:
                        try:
                            price = float(match.group().replace(',', ''))
                        except:
                            pass
                
                # Extract store name
                # Usually in a div with text containing "from" or in a specific store class
                store_elem = container.select_one('div.a8Pemb') or \
                             container.select_one('div.sh-dgr__offer-content span') or \
                             container.select_one('div[class*="store"]') or \
                             container.select_one('span[class*="source"]') or \
                             container.select_one('.IuY9Z') # Common store class
                
                store = store_elem.get_text(strip=True) if store_elem else "Unknown"
                # Clean store name (Google often adds "From " or "· " prefix)
                store = store.replace("From ", "").replace("· ", "").strip()
                
                # Extract link
                link_elem = container.select_one('a[href*="shopping/product"]') or \
                            container.select_one('a[href*="url?q="]') or \
                            container.select_one('a')
                
                link = link_elem.get('href') if link_elem else None
                if link:
                    if link.startswith('/url?q='):
                        # Extract real URL from Google redirect link
                        match = re.search(r'url\?q=(.*?)&', link)
                        if match:
                            link = match.group(1)
                    elif link.startswith('/'):
                        link = 'https://www.google.com' + link
                
                if title != "N/A" and price is not None:
                    results.append({
                        "title": title,
                        "price": price,
                        "store": store,
                        "url": link,
                        "platform": identify_platform_from_store(store)
                    })
            return results
        except Exception as e:
            print(f"Google Shopping search error: {e}")
            return []
            
    return await asyncio.to_thread(_sync_search)

def identify_platform_from_store(store: str) -> str:
    store_lower = store.lower()
    if "amazon" in store_lower:
        return "amazon"
    elif "flipkart" in store_lower:
        return "flipkart"
    elif "myntra" in store_lower:
        return "myntra"
    elif "ajio" in store_lower:
        return "ajio"
    elif "nykaa" in store_lower:
        return "nykaa"
    elif "reliance" in store_lower or "jiomart" in store_lower:
        return "jiomart"
    elif "tata" in store_lower:
        return "tata_cliq"
    else:
        return "other"
