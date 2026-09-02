import urllib.request
import json
import urllib.parse

def search_unsplash(query):
    # Using a public unsplash API endpoint or scraping
    url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(query)}&per_page=3"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        return [res['urls']['regular'] for res in data.get('results', [])]
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

print("Kaaba:", search_unsplash("Kaaba Mecca"))
print("Arafat:", search_unsplash("Mount Arafat Mecca"))
print("Nabawi:", search_unsplash("Masjid Nabawi Medina"))
print("Mosque:", search_unsplash("Mosque Medina"))
