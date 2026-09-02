import urllib.request
import json
import urllib.parse
import time

def get_wiki_image(page_title):
    try:
        url = "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=" + urllib.parse.quote(page_title)
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

def get_commons_image(page_title):
    try:
        url = "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=" + urllib.parse.quote(page_title)
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

print("Kaaba:", get_commons_image("File:Great_Mosque_of_Mecca.jpg"))
print("Arafat:", get_commons_image("File:Arafat_Makkah.jpg"))
print("Nabawi:", get_commons_image("File:Al-Masjid_an-Nabawi_202302.jpg"))
print("Qiblatayn:", get_commons_image("File:Masjid_al-Qiblatain.jpg"))
print("Khandaq:", get_commons_image("File:Khandaq_Mosque.jpg"))
print("Miqat:", get_commons_image("File:Masjid_Dhul_Hulayfah.jpg"))
print("Dates:", get_commons_image("File:Date_palms_in_Medina.jpg"))
