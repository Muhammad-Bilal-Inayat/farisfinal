import urllib.request
import json
import urllib.parse
import time

def get_wiki_image(page_title):
    try:
        url = "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=" + urllib.parse.quote(page_title)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        time.sleep(1.5)
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        pages = data['query']['pages']
        for page_id in pages:
            if 'original' in pages[page_id]:
                return pages[page_id]['original']['source']
    except Exception as e:
        print(f"Error for {page_title}: {e}")
    return None

titles = [
    "Al-Masjid an-Nabawi",
    "Mount Uhud",
    "Masjid al-Qiblatayn",
    "The Seven Mosques",
    "Dhul Hulayfah Miqat Mosque",
    "Aisha Mosque",
    "Date palm"
]

for title in titles:
    print(f"{title}: {get_wiki_image(title)}")
