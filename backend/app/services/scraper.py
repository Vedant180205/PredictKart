import asyncio
import re
import random
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup
from curl_cffi import requests as curl_requests
from .google_shopping import search_google_shopping

# Mobile Chrome headers that mimic a real Android browser
MOBILE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-ch-ua-platform-version": '"6.0"',
    "upgrade-insecure-requests": "1",
    "Cache-Control": "max-age=0",
}

# Available impersonation profiles to rotate through
IMPERSONATE_PROFILES = ["chrome120", "chrome110", "chrome107"]


def _get_amazon_html(url: str) -> str:
    """
    Fetch Amazon product page using a persistent session with cookie seeding.
    Uses mobile Chrome headers to avoid bot detection.
    """
    profile = random.choice(IMPERSONATE_PROFILES)
    
    # Build referer from a plausible search
    # e.g., extract slug from URL for a realistic search referer
    slug_match = re.search(r'amazon\.in/([^/]+)/dp/', url)
    search_term = slug_match.group(1).replace('-', '+') if slug_match else "product"
    referer = f"https://www.amazon.in/s?k={search_term}"

    headers = {**MOBILE_HEADERS, "Referer": referer}

    session = curl_requests.Session()

    # Step 1: Seed the session with homepage cookies
    try:
        session.get(
            "https://www.amazon.in",
            impersonate=profile,
            headers={**MOBILE_HEADERS, "Referer": "https://www.google.com/"},
            timeout=20,
        )
    except Exception:
        pass  # Cookie seeding is best-effort; continue anyway

    # Step 2: Small random delay to appear human
    import time
    time.sleep(random.uniform(1.0, 2.5))

    # Step 3: Fetch the actual product page
    response = session.get(url, impersonate=profile, headers=headers, timeout=30)
    return response.text


async def fetch_amazon_page(url: str) -> str:
    """Async wrapper for the synchronous Amazon fetch."""
    return await asyncio.to_thread(_get_amazon_html, url)


def extract_price_amazon(soup: BeautifulSoup) -> Optional[float]:
    """Extract price from Amazon product page with multiple fallback selectors."""
    price_selectors = [
        '#corePrice_desktop .a-price .a-offscreen',
        '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
        'span.a-price[data-a-size="xl"] span.a-offscreen',
        'span.a-price[data-a-size="b"] span.a-offscreen',
        '.a-price .a-offscreen',
        '.a-price-whole',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '#priceblock_saleprice',
    ]
    for selector in price_selectors:
        elem = soup.select_one(selector)
        if elem:
            text = elem.get_text(strip=True)
            match = re.search(r'[\d,]+\.?\d*', text.replace('₹', '').replace(',', ''))
            if match:
                try:
                    val = float(match.group())
                    if val > 5:
                        return val
                except ValueError:
                    continue

    # Regex fallback on raw HTML
    html_content = str(soup)
    patterns = [
        r'"priceAmount":\s*([\d.]+)',
        r'₹\s*([\d,]+)',
        r'priceBlockBuyingPriceString[^>]*>₹?\s*([\d,]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, html_content)
        if match:
            try:
                val = float(match.group(1).replace(',', ''))
                if val > 5:
                    return val
            except ValueError:
                continue
    return None


async def scrape_product(url: str) -> Dict[str, Any]:
    """
    Main scraping function. Tries direct fetch first, falls back to Google Shopping.
    """
    platform = identify_platform(url)

    # --- Strategy 1: Direct scrape with mobile Chrome session ---
    try:
        html = await fetch_amazon_page(url)
        soup = BeautifulSoup(html, 'lxml')

        is_captcha = "captcha" in html.lower() or "enter the characters" in html.lower()
        is_too_short = len(html) < 10000

        if not is_captcha and not is_too_short:
            title_elem = soup.select_one("#productTitle")
            if title_elem:
                title = title_elem.get_text(strip=True)
                price = extract_price_amazon(soup)

                # Extract image
                img_elem = soup.select_one("#landingImage") or soup.select_one("#imgBlkFront")
                image_url = img_elem.get("src") or img_elem.get("data-old-hires") if img_elem else None

                # Extract short description (feature bullets)
                bullets = soup.select("#feature-bullets li span.a-list-item")
                short_desc = "\n".join(b.get_text(strip=True) for b in bullets[:5]) if bullets else ""

                if title and price:
                    print(f"[scraper] Direct scrape SUCCESS: {title[:50]} @ ₹{price}")
                    return {
                        "url": url,
                        "title": title,
                        "current_price": price,
                        "platform": platform,
                        "image_url": image_url,
                        "short_description": short_desc,
                        "full_description": "",
                        "currency": "INR",
                    }
                else:
                    print(f"[scraper] Direct scrape got HTML but missing title/price. Title={bool(title_elem)}, Price={price}")
            else:
                print(f"[scraper] Direct scrape: productTitle not found in HTML (len={len(html)})")
        else:
            reason = "captcha" if is_captcha else "too short"
            print(f"[scraper] Direct scrape blocked ({reason}), falling back.")

    except Exception as e:
        print(f"[scraper] Direct scrape exception: {e}")

    # --- Strategy 2: Fallback to Google Shopping search ---
    print(f"[scraper] Falling back to Google Shopping for: {url}")
    search_query = _extract_search_query(url, platform)
    print(f"[scraper] Search query: {search_query}")

    results = await search_google_shopping(search_query, max_results=5)
    if results:
        best = results[0]
        print(f"[scraper] Google Shopping fallback SUCCESS: {best['title'][:50]} @ ₹{best['price']}")
        return {
            "url": url,
            "title": best["title"],
            "current_price": best["price"],
            "platform": platform,
            "image_url": None,
            "short_description": f"Price sourced from {best['store']} via Google Shopping.",
            "full_description": "",
            "currency": "INR",
        }

    raise ValueError(f"Could not extract product details from {url} (tried direct scrape + Google Shopping fallback).")


def _extract_search_query(url: str, platform: str) -> str:
    """Extract a human-readable search query from a product URL."""
    if platform == "amazon":
        # Prefer the slug (contains the product name)
        slug_match = re.search(r'amazon\.in/([^/]+)/dp/', url)
        if slug_match:
            return slug_match.group(1).replace('-', ' ')
        # Fallback: ASIN
        asin_match = re.search(r'/dp/([A-Z0-9]{10})', url)
        if asin_match:
            return asin_match.group(1)
    elif platform == "flipkart":
        slug_match = re.search(r'flipkart\.com/([^/]+)/', url)
        if slug_match:
            return slug_match.group(1).replace('-', ' ')
    return url


def identify_platform(url: str) -> str:
    url_lower = url.lower()
    if "amazon." in url_lower:
        return "amazon"
    elif "flipkart." in url_lower:
        return "flipkart"
    elif "myntra." in url_lower:
        return "myntra"
    else:
        return "unknown"