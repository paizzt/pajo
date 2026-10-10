import sqlite3
import json

conn = sqlite3.connect('backend/pajo.db')
c = conn.cursor()
c.execute("SELECT id, title, report_data FROM saved_results")
for row in c.fetchall():
    try:
        data = json.loads(row[2])
        stats = data.get('stats', {})
        print(f"--- Report {row[0]}: {row[1]} ---")
        print(f"Stats inside JSON: Pos:{stats.get('positif')}, Neg:{stats.get('negatif')}, Net:{stats.get('netral')}")
        
        # Calculate from trend_data
        pos, neg, net = 0, 0, 0
        for t in data.get('trend_data', []):
            pos += t.get('Positif', 0)
            neg += t.get('Negatif', 0)
            net += t.get('Netral', 0)
        print(f"Sum from trend_data: Pos:{pos}, Neg:{neg}, Net:{net}")
    except Exception as e:
        print("Error on row", row[0], e)
