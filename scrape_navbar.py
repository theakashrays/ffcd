from botasaurus.browser import browser, Driver
from bs4 import BeautifulSoup
import time

@browser(headless=False)
def scrape_xavs(driver: Driver, data):
    print("Navigating to xavs profile...")
    driver.get("https://www-oguser.com/xavs")
    
    # Wait for Cloudflare
    print("Waiting for page load / Cloudflare...")
    try:
        driver.wait_for_element("nav, header, .headertop, .menu", wait=25)
    except:
        print("Could not find nav elements within 25s. Continuing anyway...")
        driver.sleep(5)
        
    html = driver.page_html
    with open("xavs_page.html", "w", encoding="utf-8") as f:
        f.write(html)
        
    print("Navigating to private.php...")
    driver.get("https://www-oguser.com/private.php?action=read&convid=995b5cd67fe14771e7b38698dd284b29")
    try:
        driver.wait_for_element("nav, header, .headertop, .menu", wait=25)
    except:
        driver.sleep(5)
        
    html_msg = driver.page_html
    with open("private_message_page.html", "w", encoding="utf-8") as f:
        f.write(html_msg)

    return {"status": "success"}

if __name__ == "__main__":
    scrape_xavs()
