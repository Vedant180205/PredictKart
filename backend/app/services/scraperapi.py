import os
import re
import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict, Any, List

async def fetch_via_scraperapi(url: str) -> str:
    """Fetch HTML using ScraperAPI."""
    api_key = os.getenv("SCRAPERAPI_KEY")
    if not api_key:
        raise ValueError("SCRAPERAPI_KEY not set")
    scraper_url = f"http://api.scraperapi.com?api_key={api_key}&url={url}&render=false"
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(scraper_url)
        response.raise_for_status()
        return response.text

def extract_price(soup: BeautifulSoup, platform: str = "amazon") -> Optional[float]:
    if platform == "amazon":
        selectors = [
            '.a-price-whole', '.a-price .a-offscreen', '#priceblock_ourprice',
            '#priceblock_dealprice', 'span.a-price span.a-offscreen'
        ]
    else: # flipkart
        selectors = ['div._30jeq3', 'div._25b18c', 'div._16Jk6d']
        
    for sel in selectors:
        elem = soup.select_one(sel)
        if elem:
            text = elem.get_text(strip=True)
            match = re.search(r'[\d,]+\.?\d*', text)
            if match:
                return float(match.group().replace(',', ''))
    return None

def extract_title(soup: BeautifulSoup, platform: str = "amazon") -> str:
    if platform == "amazon":
        elem = soup.select_one("#productTitle")
    else: # flipkart
        elem = soup.select_one("span.B_NuCI") or soup.select_one("h1.yhB1nd")
    return elem.text.strip() if elem else "N/A"

def extract_image(soup: BeautifulSoup, platform: str = "amazon") -> Optional[str]:
    if platform == "amazon":
        elem = soup.select_one("#landingImage")
        return elem.get('src') if elem else None
    else: # flipkart
        elem = soup.select_one("img._396cs4") or soup.select_one("img._2r_T1_")
        return elem.get('src') if elem else None

def extract_short_description(soup: BeautifulSoup, platform: str = "amazon") -> str:
    if platform == "amazon":
        bullets = []
        feature_div = soup.find('div', id='feature-bullets')
        if feature_div:
            for li in feature_div.find_all('li'):
                span = li.find('span')
                if span:
                    bullets.append(span.get_text(strip=True))
        return "\n".join(bullets) if bullets else ""
    else: # flipkart
        highlights = []
        highlight_div = soup.select_one("div._2418kt")
        if highlight_div:
            for li in highlight_div.find_all('li'):
                highlights.append(li.get_text(strip=True))
        return "\n".join(highlights) if highlights else ""

def extract_full_description(soup: BeautifulSoup, platform: str = "amazon") -> str:
    if platform == "amazon":
        desc_div = soup.find('div', id='productDescription')
        if desc_div:
            p = desc_div.find('p')
            if p:
                return p.get_text(strip=True)
    else: # flipkart
        desc_div = soup.select_one("div._1AN7u2")
        if desc_div:
            return desc_div.get_text(strip=True)
    return ""

def extract_specifications(soup: BeautifulSoup, platform: str = "amazon") -> Dict[str, str]:
    specs = {}
    if platform == "amazon":
        table = soup.select_one('#productDetails_detailBullets_sections1')
        if not table:
            table = soup.select_one('#productDetails_expanderTables')
        if table:
            rows = table.find_all('tr')
            for row in rows:
                th = row.find('th')
                td = row.find('td')
                if th and td:
                    key = th.get_text(strip=True).rstrip(':')
                    value = td.get_text(strip=True)
                    specs[key] = value
    else: # flipkart
        rows = soup.select("tr._1s_Z6B")
        for row in rows:
            tds = row.find_all('td')
            if len(tds) >= 2:
                key = tds[0].get_text(strip=True)
                value = tds[1].get_text(strip=True)
                specs[key] = value
    return specs

def extract_rating(soup: BeautifulSoup, platform: str = "amazon") -> tuple[Optional[float], Optional[int]]:
    if platform == "amazon":
        rating_elem = soup.select_one('span[data-hook="rating-out-of-text"]')
        stars = None
        if rating_elem:
            match = re.search(r'([\d\.]+)', rating_elem.text)
            if match:
                stars = float(match.group(1))
        review_elem = soup.select_one('span[data-hook="total-review-count"]')
        reviews = None
        if review_elem:
            match = re.search(r'[\d,]+', review_elem.text)
            if match:
                reviews = int(match.group().replace(',', ''))
        return stars, reviews
    else: # flipkart
        rating_elem = soup.select_one("div._3LWZlK")
        stars = float(rating_elem.text) if rating_elem else None
        review_elem = soup.select_one("span._2_R_DZ")
        reviews = None
        if review_elem:
            match = re.search(r'([\d,]+)\s*Ratings', review_elem.text)
            if match:
                reviews = int(match.group(1).replace(',', ''))
        return stars, reviews

async def scrape_and_parse_product(url: str) -> Dict[str, Any]:
    """Fetch Amazon or Flipkart page via ScraperAPI and parse all details."""
    platform = "amazon" if "amazon" in url.lower() else "flipkart"
    html = await fetch_via_scraperapi(url)
    soup = BeautifulSoup(html, 'lxml')
    
    title = extract_title(soup, platform)
    price = extract_price(soup, platform)
    if price is None:
        raise ValueError("Price not found")
    image_url = extract_image(soup, platform)
    short_desc = extract_short_description(soup, platform)
    full_desc = extract_full_description(soup, platform)
    specs = extract_specifications(soup, platform)
    rating, reviews = extract_rating(soup, platform)
    
    return {
        "url": url,
        "title": title,
        "current_price": price,
        "platform": platform,
        "image_url": image_url,
        "short_description": short_desc,
        "full_description": full_desc,
        "specifications": specs,
        "rating": rating,
        "reviews_count": reviews,
        "currency": "INR"
    }
