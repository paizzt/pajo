import csv
import random
from datetime import datetime, timedelta

random.seed(42)

# === POSITIVE TEMPLATES ===
# These MUST contain standalone positive words WITHOUT negation
pos_templates = [
    # Standalone positive words (high frequency)
    "bagus", "bagus sekali", "bagus banget", "sangat bagus",
    "keren", "keren banget", "sangat keren", "keren sekali",
    "mantap", "mantap sekali", "mantap banget", "sangat mantap",
    "sempurna", "sangat sempurna", "sempurna sekali",
    "lancar", "sangat lancar", "lancar sekali", "lancar banget",
    "memuaskan", "sangat memuaskan", "memuaskan sekali",
    "hebat", "sangat hebat", "hebat sekali",
    "luar biasa", "sangat luar biasa",
    "puas", "sangat puas", "puas banget",
    "cepat", "sangat cepat", "cepat sekali",
    "mudah", "sangat mudah", "mudah banget",
    "oke", "oke banget", "sangat oke",
    "top", "top banget", "top markotop",
    "suka", "sangat suka", "suka banget",
    "recommended", "sangat recommended",
    "terbaik", "yang terbaik",
    
    # Full sentences with positive words
    "aplikasi bagus", "aplikasi ini bagus", "aplikasi yang bagus",
    "aplikasi bagus banget", "aplikasi sangat bagus",
    "aplikasi keren", "aplikasi ini keren", "aplikasi mantap",
    "aplikasi sempurna", "aplikasi lancar", "aplikasi hebat",
    "aplikasi memuaskan", "aplikasi terbaik",
    "fitur bagus", "fitur keren", "fitur mantap", "fitur lengkap",
    "tampilannya bagus", "tampilannya keren", "tampilannya mantap",
    "pelayanan bagus", "pelayanan memuaskan", "pelayanan cepat",
    
    # Longer positive sentences
    "aplikasi ini sangat bagus dan mudah digunakan",
    "saya sangat puas dengan aplikasi ini",
    "sangat membantu dan mudah dipakai",
    "bagus banget aplikasinya lancar",
    "keren abis fiturnya lengkap",
    "mantap jiwa aplikasinya sempurna",
    "aplikasi terbaik yang pernah saya pakai",
    "bagus dan cepat saya suka",
    "mudah digunakan dan sangat berguna",
    "tampilannya bagus fiturnya lengkap",
    "transfer cepat dan mudah",
    "tidak pernah error sangat lancar",
    "bintang lima untuk aplikasi ini",
    "luar biasa aplikasinya mantap sekali",
    "sangat berguna membantu sekali",
    "saya suka aplikasi ini bagus",
    "rekomendasi banget aplikasinya bagus",
    "top deh pokoknya bagus",
    "oke banget lancar dan cepat",
    "puas pakai aplikasi ini mantap",
    
    # Negated negative words (still positive)
    "tidak buruk", "sama sekali tidak buruk",
    "tidak mengecewakan", "tidak jelek", "gak jelek",
    "gak error", "tanpa masalah", "tidak ada masalah",
    "gak ada masalah", "tidak pernah error",
    "tidak lemot", "gak lemot", "tidak lambat",
    "tidak ribet", "gak ribet",
]

# === NEGATIVE TEMPLATES ===
neg_templates = [
    # Standalone negative words (high frequency)
    "jelek", "jelek sekali", "jelek banget", "sangat jelek",
    "buruk", "buruk sekali", "buruk banget", "sangat buruk",
    "hancur", "hancur sekali", "sangat hancur",
    "lambat", "sangat lambat", "lambat sekali", "lambat banget",
    "lemot", "sangat lemot", "lemot banget", "lemot sekali",
    "error", "banyak error", "sering error", "selalu error",
    "macet", "sering macet", "selalu macet",
    "parah", "sangat parah", "parah banget",
    "sampah", "sampah sekali",
    "payah", "sangat payah", "payah banget",
    "kecewa", "sangat kecewa", "kecewa berat", "kecewa banget",
    "susah", "sangat susah", "susah banget",
    "ribet", "sangat ribet", "ribet banget",
    "gagal", "selalu gagal", "sering gagal",
    
    # Full sentences with negative words
    "aplikasi jelek", "aplikasi ini jelek", "aplikasi yang jelek",
    "aplikasi buruk", "aplikasi ini buruk",
    "aplikasi lambat", "aplikasi lemot", "aplikasi error",
    "aplikasi sampah", "aplikasi payah", "aplikasi parah",
    "fitur jelek", "fitur buruk", "fitur payah",
    "tampilannya jelek", "tampilannya buruk",
    "pelayanan jelek", "pelayanan buruk", "pelayanan lambat",
    
    # Longer negative sentences
    "aplikasi ini sangat jelek dan lambat",
    "saya sangat kecewa dengan aplikasi ini",
    "sangat mengecewakan dan susah dipakai",
    "jelek banget aplikasinya error terus",
    "buruk sekali sering macet",
    "payah aplikasinya lemot banget",
    "aplikasi terburuk yang pernah saya pakai",
    "jelek dan lambat saya benci",
    "susah digunakan dan sering error",
    "tampilannya jelek fiturnya kurang",
    "transfer gagal terus dan lambat",
    "selalu error sangat lambat",
    "bintang satu untuk aplikasi ini",
    "parah aplikasinya payah sekali",
    "sangat mengecewakan bikin emosi",
    "saya benci aplikasi ini jelek",
    "jangan download aplikasinya jelek",
    "buang waktu aplikasinya sampah",
    "tolong perbaiki error terus",
    "kecewa pakai aplikasi ini payah",
    
    # Negated positive words (still negative)
    "tidak bagus", "sama sekali tidak bagus", "kurang bagus",
    "tidak keren", "kurang keren", "gak keren",
    "tidak memuaskan", "kurang memuaskan",
    "tidak mantap", "kurang mantap",
    "tidak lancar", "kurang lancar", "gak lancar",
    "tidak sempurna", "kurang sempurna",
    "tidak hebat", "kurang hebat",
    "bukan aplikasi bagus", "bukan yang terbaik",
    "tidak oke", "kurang oke", "gak oke",
    "tidak recommended", "kurang recommended",
    "tidak puas", "kurang puas",
]

# === NEUTRAL TEMPLATES ===
net_templates = [
    # Standalone neutral words
    "biasa", "biasa saja", "biasa aja",
    "lumayan", "lumayan lah", "lumayan sih",
    "standar", "standar saja", "standar lah",
    "cukup", "cukup lah", "cukup oke",
    "oke lah", "ya gitu deh", "b aja",
    "sedang", "tidak istimewa", "so so",
    
    # Full neutral sentences
    "aplikasi biasa saja", "aplikasi ini biasa aja",
    "aplikasi lumayan", "aplikasi standar",
    "aplikasi cukup oke", "aplikasi ya gitu deh",
    "fitur biasa", "fitur standar", "fitur lumayan",
    
    # Longer neutral sentences
    "aplikasi ini biasa saja tidak ada yang spesial",
    "lumayan lah untuk ukuran aplikasi gratis",
    "standar seperti aplikasi lainnya",
    "cukup oke tapi bisa ditingkatkan lagi",
    "tidak ada yang istimewa dari aplikasi ini",
    "ya begitulah biasa aja",
    
    # Conflicting sentiments (positive + negative = neutral)
    "tidak bagus namun lancar di pake",
    "jelek tapi cepat", "jelek tapi masih bisa dipakai",
    "bagus sih tapi kadang error", "bagus tapi sering lemot",
    "keren tapi berat", "keren tapi lambat",
    "kurang memuaskan tapi masih bisa dipakai",
    "tidak jelek tapi tidak bagus juga",
    "biasa aja tapi berguna",
    "sering error tapi fiturnya bagus",
    "lambat tapi tampilannya keren",
    "tidak keren tapi lancar",
    "bagus tapi kurang fitur", "mantap tapi kadang error",
    "cepat tapi tampilannya jelek",
    "fitur lengkap tapi lambat",
    "mudah dipakai tapi sering crash",
    "tampilannya bagus tapi fiturnya kurang",
    "ada kelebihan ada kekurangan",
    "satu sisi bagus satu sisi jelek",
]

reviews = []
base_date = datetime(2022, 1, 1)

# Generate 40000 Positive (Scores 4 and 5)
for i in range(40000):
    content = random.choice(pos_templates)
    reviews.append({
        'userName': f'U{i}',
        'content': content,
        'score': random.choice([4, 5]),
        'date': (base_date + timedelta(minutes=i*5)).isoformat(),
        'thumbsUpCount': random.randint(0, 15)
    })

# Generate 40000 Negative (Scores 1 and 2)
for i in range(40000):
    content = random.choice(neg_templates)
    reviews.append({
        'userName': f'U{i+40000}',
        'content': content,
        'score': random.choice([1, 2]),
        'date': (base_date + timedelta(minutes=(i+40000)*5)).isoformat(),
        'thumbsUpCount': random.randint(0, 25)
    })

# Generate 20000 Neutral (Score 3)
for i in range(20000):
    content = random.choice(net_templates)
    reviews.append({
        'userName': f'U{i+80000}',
        'content': content,
        'score': 3,
        'date': (base_date + timedelta(minutes=(i+80000)*5)).isoformat(),
        'thumbsUpCount': random.randint(0, 5)
    })

random.shuffle(reviews)

with open('dataset_sempurna.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['userName', 'content', 'score', 'date', 'thumbsUpCount'])
    writer.writeheader()
    writer.writerows(reviews)

print(f'dataset_sempurna.csv berhasil dibuat dengan {len(reviews)} baris data.')
print(f'  - Positif: 40000')
print(f'  - Negatif: 40000')
print(f'  - Netral:  20000')
