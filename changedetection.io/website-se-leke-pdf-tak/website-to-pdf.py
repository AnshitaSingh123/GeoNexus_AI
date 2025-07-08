import asyncio
import os
import time
import shutil
import json
import requests
import pdfkit
import argparse
import hashlib
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
from pathlib import Path
from tqdm import tqdm
from pypdf import PdfWriter
from playwright.async_api import async_playwright

# === CONFIG ===
PATH_WKHTMLTOPDF = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
CONFIG = pdfkit.configuration(wkhtmltopdf=PATH_WKHTMLTOPDF)

PDFKIT_OPTIONS = {
    "orientation": "Portrait",
    "zoom": 1,
    "no-stop-slow-scripts": True,
    "disable-external-links": True,
    "disable-internal-links": True,
    "disable-forms": True,
    "no-outline": True,
    "print-media-type": True,
}

STOP_AFTER_FAILS = 10000
CACHE_FILE = "url_cache.json"

# === HELPERS ===
def normalize_url(url):
    url = url.split("#")[0]
    if url.endswith("/") and len(url) > 1:
        url = url[:-1]
    return url.rstrip("/")

# === CRAWLERS ===
# ... (rest of your crawler functions are fine, no changes needed there) ...
def get_url_list_from_site(homepage_url, max_depth=3):
    visited = set()
    to_visit = [(homepage_url, 0)]
    domain = urlparse(homepage_url).netloc
    all_urls = set()

    while to_visit:
        url, depth = to_visit.pop(0)
        url = normalize_url(url)
        if url in visited or depth > max_depth:
            continue

        visited.add(url)
        all_urls.add(url)

        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.text, "html.parser")
        except Exception as e:
            print(f"[SKIP] Failed to fetch {url}: {e}")
            continue

        for a_tag in soup.find_all("a", href=True):
            href = a_tag['href']
            full_url = normalize_url(urljoin(url, href))
            parsed_url = urlparse(full_url)
            if parsed_url.netloc == domain and full_url not in visited:
                to_visit.append((full_url, depth + 1))

    return list(all_urls)

async def get_urls_with_playwright(homepage_url, max_depth=2):
    visited = set()
    to_visit = [(homepage_url, 0)]
    domain = urlparse(homepage_url).netloc
    collected = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        while to_visit:
            url, depth = to_visit.pop(0)
            url = normalize_url(url)
            if url in visited or depth > max_depth:
                continue

            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                links = await page.eval_on_selector_all("a[href]", "els => els.map(el => el.href)")
                visited.add(url)
                collected.add(url)

                for link in links:
                    link = normalize_url(link)
                    parsed = urlparse(link)
                    if parsed.netloc == domain and link not in visited:
                        to_visit.append((link, depth + 1))
            except Exception as e:
                print(f"[SKIP] Playwright crawl failed for {url}: {e}")

        await browser.close()
    return list(collected)


# === PDF UTILS ===
# ... (other PDF utils are fine) ...
def rename_url_to_pdf(url):
    return url.replace("https://", "").replace("http://", "").replace("/", "-").replace("?", "_") + ".pdf"

def move_to_directory(file, path="output/"):
    if not os.path.exists(path):
        os.makedirs(path)
    return os.path.join(path, file)

def convert_xml_to_pdf(url, output_path):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "lxml-xml")
        html_content = "<html><body><h1>XML Content</h1><ul>"
        for tag in soup.find_all():
            html_content += f"<li><b>{tag.name}</b>: {tag.text.strip()}</li>"
        html_content += "</ul></body></html>"
        pdfkit.from_string(html_content, output_path, configuration=CONFIG, options=PDFKIT_OPTIONS)
        print(f"[✔] XML converted: {output_path}")
    except Exception as e:
        print(f"[✘] XML error: {url} → {e}")

content_hashes = set()

async def convert_js_page_to_pdf(url, output_path):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle")

            # Scroll to bottom to trigger lazy-load
            await page.evaluate("""
                async () => {
                    await new Promise(resolve => {
                        let totalHeight = 0;
                        const distance = 100;
                        const timer = setInterval(() => {
                            window.scrollBy(0, distance);
                            totalHeight += distance;
                            if (totalHeight >= document.body.scrollHeight) {
                                clearInterval(timer);
                                resolve();
                            }
                        }, 100);
                    });
                }
            """)
            await page.wait_for_timeout(1000)

            # Wait for images to load
            await page.evaluate("""
                () => Promise.all(Array.from(document.images).map(img =>
                    img.complete ? Promise.resolve() : new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    })
                ))
            """)

            # Deduplication check
            content = await page.content()
            content_hash = hashlib.md5(content.encode()).hexdigest()
            if content_hash in content_hashes:
                print(f"[⚠] Duplicate content detected, skipping PDF for {url}")
                await browser.close()
                return
            content_hashes.add(content_hash)

            page_height = await page.evaluate("() => document.body.scrollHeight")

            await page.pdf(
                path=output_path,
                print_background=True,
                width="8.27in",
                height=f"{page_height}px",
                margin={"top": "20px", "bottom": "20px", "left": "20px", "right": "20px"},
            )
            await browser.close()
            print(f"[✔] PDF saved: {output_path}")
    except Exception as e:
        print(f"[✘] Playwright PDF error: {url} → {e}")

def merge_pdfs(pdf_folder="output/temp/", output_file="output/combined.pdf"):
    writer = PdfWriter()
    pdf_files = [f for f in sorted(os.listdir(pdf_folder)) if f.endswith(".pdf")]
    
    if not pdf_files:
        print(f"[!] No PDF files found in {pdf_folder} to merge.")
        return

    for file in pdf_files:
        writer.append(os.path.join(pdf_folder, file))
    
    # Ensure the output directory exists
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, "wb") as f:
        writer.write(f)
    print(f"\n✅ Merged {len(pdf_files)} PDFs into: {output_file}")


def load_cached_urls():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            return json.load(f)
    return []

def save_cached_urls(urls):
    with open(CACHE_FILE, "w") as f:
        json.dump(urls, f)


# === MAIN ===
async def main(homepage_url=None, use_cache=False, output_pdf_path="output/combined.pdf"):

    print("=== Website to PDF Converter (Dynamic/Static Crawler) ===\n")

    if use_cache:
        urls_to_parse = load_cached_urls()
        if not urls_to_parse:
            print("[!] Cache is empty. Please run without --use-cache first.")
            return
    elif homepage_url:
        print(f"🔍 Trying dynamic crawl (Playwright) for: {homepage_url}\n")
        urls_to_parse = await get_urls_with_playwright(homepage_url, max_depth=2)


        if len(urls_to_parse) < 3:
            print("[!] Dynamic crawl found too few URLs. Falling back to static crawler.")
            urls_to_parse = get_url_list_from_site(homepage_url, max_depth=3)

        save_cached_urls(urls_to_parse)
    else:
        print("[⚠] No homepage URL provided. Exiting.")
        return

    print(f"✅ Loaded {len(urls_to_parse)} internal pages to process.\n")
    temp_dir = "output/temp/"
    os.makedirs(temp_dir, exist_ok=True)
    passes, fails = 0, 0

    # Create a list of tasks for asyncio
    tasks = []
    for url in urls_to_parse:
        url = normalize_url(url)
        filename = rename_url_to_pdf(url)
        output_path = move_to_directory(filename, path=temp_dir)
        
        # We'll use Playwright for all pages for consistency
        tasks.append(convert_js_page_to_pdf(url, output_path))

    # Run tasks concurrently
    for task in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Converting"):
        try:
            await task
            passes += 1
        except Exception as e:
            # The error is already printed inside the function
            fails += 1
        
        if fails >= STOP_AFTER_FAILS:
            print("Too many failures. Stopping.")
            break

    print(f"\n✅ Finished | Success: {passes} | Failed: {fails}")
    merge_pdfs(temp_dir, output_pdf_path)
    shutil.rmtree(temp_dir)
    print("🧹 Temporary PDFs removed.")

# CLI Entry
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert website to PDF")
    parser.add_argument("--url", type=str, help="Homepage URL to crawl.")
    parser.add_argument("--use-cache", action='store_true', help="Use cached URLs from previous run.")
    parser.add_argument("--output", type=str, default="output/combined.pdf", help="Path for the final combined PDF.")
    args = parser.parse_args()

    if not args.url and not args.use_cache:
        parser.error("Either --url or --use-cache must be provided.")

    asyncio.run(main(homepage_url=args.url, use_cache=args.use_cache, output_pdf_path=args.output))
