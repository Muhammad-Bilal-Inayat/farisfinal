import urllib.request
import urllib.parse
import json
import re

def search_images(query):
    url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}&t=h_&iax=images&ia=images"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        html = response.read().decode('utf-8')
        vqd_match = re.search(r'vqd=([\d-]+)', html)
        if not vqd_match:
            return []
        vqd = vqd_match.group(1)
        api_url = f"https://duckduckgo.com/i.js?l=us-en&o=json&q={urllib.parse.quote(query)}&vqd={vqd}&f=,,,&p=1"
        api_req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
        api_response = urllib.request.urlopen(api_req)
        data = json.loads(api_response.read().decode('utf-8'))
        return [res['image'] for res in data.get('results', [])[:3]]
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

print("Qiblatayn:", search_images("Masjid Al-Qiblatayn Madinah jpg"))
print("Seven Mosques:", search_images("The Seven Mosques Madinah jpg"))
print("Bir Ali:", search_images("Masjid Dhul Hulayfah Madinah jpg"))
print("Date Farms:", search_images("Madinah Date Farms Ajwa jpg"))
