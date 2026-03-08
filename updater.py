import os
from bs4 import BeautifulSoup

new_nav_html = """
<div class="headertop" style="background-color: #131313; position: fixed; top: 0; left: 0; right: 0; z-index: 100000; padding: 10px 0; border-bottom: 1px solid #1a1a1a; box-sizing: border-box; width: 100%; margin: 0; animation: none !important; transition: none !important;">
    <div class="top-wrap" style="width: 75%; max-width: 1714px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
        <div style="display: flex; align-items: center; gap: 15px;">
            <a href="index.html" class="logo">
                <img src="favicon.png" onerror="this.src='./assets/ogu_favicon_15a80e3a.png';" alt="OGU" style="height: 32px;">
            </a>
            <a href="index.html" class="conversationnotification">
                <i class="fa fa-home" style="margin-right: 5px;"></i><span>Browse</span>
            </a>
            <a href="#" class="conversationnotification" id="activeupgrade">
                <i class="fa fa-bolt" style="margin-right: 5px;"></i><span>Upgrade</span>
            </a>
            <a href="credits.html" class="conversationnotification">
                <i class="fa fa-coins" style="margin-right: 5px;"></i><span>Credits</span>
            </a>
            <a href="#" class="conversationnotification hidemid">
                <i class="fa fa-trophy" style="margin-right: 5px;"></i><span>Awards</span>
            </a>
            <a href="#" class="conversationnotification">
                <i class="fa fa-ellipsis-h" style="margin-right: 5px;"></i><span>Extras</span>
            </a>
            <a href="search_threads.html" class="conversationnotification">
                <i class="fa fa-search"></i>
            </a>
        </div>
        <div style="display: flex; align-items: center; gap: 20px;">
            <a href="#" class="conversationnotification newposts">
                <span>Explore</span>
            </a>
            <a href="#" class="alertnav">
                <i class="fa fa-bell" style="font-size: 18px; color: #a4a4a4;"></i>
            </a>
            <a href="private.html" class="pmnav" id="msg-nav-link">
                <i class="fa fa-comments" style="font-size: 18px; color: #a4a4a4;"></i>
            </a>
            <button class="dropbtn responsivehide headermember" id="dropdown-profile-desktop" style="background: none; border: 2px solid #1a1919; border-radius: 50%; padding: 0; cursor: pointer;">
                <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" style="height: 32px; width: 32px; border-radius: 50%; display: block;">
            </button>
        </div>
    </div>
</div>
<!-- Space for fixed header -->
<div class="fixed-header-space" style="height: 60px;"></div>
"""

stabilizing_css = """
<style id="navbar-stability">
    html {
        scrollbar-gutter: stable;
        overflow-y: scroll;
    }
    body {
        margin: 0;
        padding: 0;
    }
    .headertop {
        animation: none !important;
        transition: none !important;
    }
</style>
"""

stabilizing_css = """
<style id="navbar-stability">
    html {
        scrollbar-gutter: stable !important;
        overflow-y: scroll !important;
        overflow-x: hidden !important;
    }
    body {
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
        width: 100% !important;
        position: relative !important;
    }
    .headertop {
        animation: none !important;
        transition: none !important;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
    }
</style>
"""

def process_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f, "html.parser")
        
        # Remove any existing 'fixed-header-space' divs
        for sp in soup.find_all("div", class_="fixed-header-space"):
            sp.decompose()
            
        # Remove redundant OGU spacers that cause jumps
        for div in soup.find_all("div", class_=["responsivehide", "responsiveshow"]):
            style = div.get("style", "")
            if "height:" in style and not div.contents: # Only if it's an empty spacer
                div.decompose()

        headertop = soup.find("div", class_="headertop")
        if headertop:
            # Overwrite or inject stabilizing CSS
            existing_stability = soup.find("style", id="navbar-stability")
            if existing_stability:
                existing_stability.decompose()
            
            css_soup = BeautifulSoup(stabilizing_css, "html.parser")
            if soup.head:
                soup.head.append(css_soup)
            else:
                soup.insert(0, css_soup)

            new_soup = BeautifulSoup(new_nav_html, "html.parser")
            headertop.replace_with(new_soup)
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(str(soup))
            print("Updated", filepath)
    except Exception as e:
        print("Error processing", filepath, ":", e)

html_files = []
for root, dirs, files in os.walk("."):
    for file in files:
        if file.endswith(".html"):
            if "admin" in file:
                continue
            if "node_modules" in root or ".git" in root:
                continue
            html_files.append(os.path.join(root, file))

for fp in html_files:
    process_file(fp)
