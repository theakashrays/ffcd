from botasaurus.browser import browser, Driver
import time

@browser(headless=False, profile="ogu_session")
def scrape_xavs(driver: Driver, data):
    print("Navigating to xavs profile...")
    driver.get("https://www-oguser.com/xavs")
    
    print("Please solve Cloudflare and LOG IN to your OGU account if you haven't.")
    print("We need to be logged in to capture the profile dropdown, message button, and navbar accurately.")
    input("PRESS ENTER HERE IN THE TERMINAL once the page has fully loaded and you are logged in...")
    
    # Switch using javascript since get_elements isn't supported like I thought
    html = driver.evaluate("return document.querySelector('iframe').contentDocument.documentElement.outerHTML;")
    if html:
        with open("raw_xavs_iframe.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Saved xavs iframe HTML.")
    else:
        print("Could not get iframe contents.")
        
    print("Navigating to private.php...")
    driver.get("https://www-oguser.com/private.php?action=read&convid=995b5cd67fe14771e7b38698dd284b29")
    
    input("PRESS ENTER HERE IN THE TERMINAL once the private messages page has fully loaded...")
    
    html_msg = driver.page_html
    # Try iframe first, fallback to page
    html_msg_frame = driver.evaluate("return document.querySelector('iframe') ? document.querySelector('iframe').contentDocument.documentElement.outerHTML : null;")
    
    with open("raw_private_iframe.html", "w", encoding="utf-8") as f:
        f.write(html_msg_frame if html_msg_frame else html_msg)
    print("Saved private messages HTML.")

    return {"status": "success"}

if __name__ == "__main__":
    scrape_xavs()
