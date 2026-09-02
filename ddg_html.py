import urllib.request
import re
import urllib.parse

def search(query):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        res = urllib.request.urlopen(req)
        html = res.read().decode('utf-8')
        links = re.findall(r'href="([^"]+)"', html)
        for link in links:
            if 'islamiclandmarks.com' in link and 'wp-content/uploads' in link:
                print(link)
    except Exception as e:
        print(f"Error: {e}")

search("site:islamiclandmarks.com masjid qiblatain jpg")
search("site:islamiclandmarks.com khandaq jpg")
search("site:islamiclandmarks.com dhul hulaifah jpg")
search("site:islamiclandmarks.com date market madinah jpg")
search("site:islamiclandmarks.com jabal uhud jpg")
search("site:islamiclandmarks.com masjid quba jpg")
