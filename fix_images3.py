import urllib.request
import json
import urllib.parse
import time

def search(query):
    try:
        url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" + urllib.parse.quote(query) + "&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        time.sleep(0.5)
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        pages = data['query']['pages']
        print(f"Results for {query}:")
        for page_id in pages:
            if 'imageinfo' in pages[page_id]:
                print(pages[page_id]['imageinfo'][0]['url'])
    except Exception as e:
        pass

search("Masjid Qiblatayn")
search("Khandaq Mosque")
search("Dhul Hulayfah")
search("Dates Madinah")
