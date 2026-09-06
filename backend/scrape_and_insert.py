import datetime
from google_play_scraper import Sort, reviews
import requests

APPS = ['id.bni.wondr', 'id.bmri.livin']
THREE_MONTHS_AGO = datetime.datetime.now() - datetime.timedelta(days=90)

def main():
    for app_id in APPS:
        print(f"Scraping {app_id}...")
        try:
            result, _ = reviews(
                app_id,
                lang='id',
                country='id',
                sort=Sort.NEWEST,
                count=5000  # fetching a lot, we will filter by date
            )
            
            print(f"Found {len(result)} total reviews. Filtering for last 3 months...")
            filtered_reviews = []
            for r in result:
                # r['at'] is a datetime object
                if r['at'] >= THREE_MONTHS_AGO:
                    formatted = {
                        "id": r.get("reviewId", ""),
                        "username": r.get("userName", ""),
                        "content": r.get("content", ""),
                        "score": r.get("score", 0),
                        "date": r.get("at").isoformat(),
                        "thumbs_up": r.get("thumbsUpCount", 0)
                    }
                    filtered_reviews.append(formatted)
                    
            print(f"Filtered to {len(filtered_reviews)} reviews for {app_id}.")
            
            if filtered_reviews:
                payload = {
                    "app_id": app_id,
                    "reviews": filtered_reviews
                }
                res = requests.post("http://127.0.0.1:8000/api/reviews/save", json=payload)
                print(f"Server response for {app_id}: {res.json()}")
        except Exception as e:
            print(f"Error scraping {app_id}: {e}")

if __name__ == "__main__":
    main()
