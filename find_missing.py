import urllib.request
import json
import urllib.parse
import time

def get_wiki_image(page_title):
    try:
        url = "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=" + urllib.parse.quote(page_title)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        time.sleep(1)
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        pages = data['query']['pages']
        for page_id in pages:
            if 'imageinfo' in pages[page_id]:
                return pages[page_id]['imageinfo'][0]['url']
    except Exception as e:
        print(f"Error for {page_title}: {e}")
    return None

titles = [
    "File:Masjid Aisha Taneem Makkah.jpg",
    "File:Masjid Dzulhulaifah (Umroh Ramadhan 2023)-1.jpg",
    "File:Al-Masjid an-Nabawi 202302.jpg"
]

for title in titles:
    print(f"{title}: {get_wiki_image(title)}")
