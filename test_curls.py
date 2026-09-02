import urllib.request

def check(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=3)
        print(f"OK: {url}")
    except Exception as e:
        print(f"Fail: {url} - {e}")

check("https://www.islamiclandmarks.com/wp-content/uploads/2015/12/Masjid-Qiblatain-1.jpg")
check("https://www.islamiclandmarks.com/wp-content/uploads/2015/12/Site-of-the-Battle-of-Ahzab-Khandaq.jpg")
check("https://www.islamiclandmarks.com/wp-content/uploads/2015/12/Masjid-Dhul-Hulaifah.jpg")
check("https://www.islamiclandmarks.com/wp-content/uploads/2015/12/Dates-in-Madinah.jpg")
