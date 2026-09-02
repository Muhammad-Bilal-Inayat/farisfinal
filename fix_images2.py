import urllib.request
import json
import urllib.parse
import time

def get_commons_search(query):
    try:
        url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" + urllib.parse.quote("filetype:bitmap " + query) + "&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        time.sleep(0.5)
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        pages = data['query']['pages']
        for page_id in pages:
            if 'imageinfo' in pages[page_id]:
                return pages[page_id]['imageinfo'][0]['url']
    except Exception as e:
        pass
    return None

stops = [
    "Kaaba Mecca",
    "Jabal al-Nour",
    "Jabal Thawr",
    "Mina Saudi Arabia",
    "Muzdalifah",
    "Mount Arafat",
    "Masjid Aisha",
    "Jannat al-Mu'alla",
    "Masjid Nabawi",
    "Masjid Quba",
    "Mount Uhud",
    "Masjid al-Qiblatayn",
    "Seven Mosques Khandaq",
    "Dhul Hulayfah Miqat",
    "Date Palm Madinah"
]

for stop in stops:
    print(f"{stop}: {get_commons_search(stop)}")
