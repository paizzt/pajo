# Sistem Analisis Sentimen PAJO

PAJO (Sistem Analisis Sentimen PAJO) adalah sebuah aplikasi berbasis web untuk melakukan analisis sentimen terhadap ulasan atau data teks. Sistem ini dibangun dengan arsitektur *client-server*, menggunakan React untuk *frontend* dan FastAPI (Python) untuk *backend*, serta memanfaatkan model Machine Learning (Support Vector Machine / SVM) untuk proses analisis.

## 🚀 Fitur Utama
- **Scraping Data**: Mengambil data ulasan atau teks dari sumber eksternal untuk dianalisis.
- **Evaluasi Model**: Mengevaluasi kinerja model klasifikasi sentimen.
- **Visualisasi Data**: Menampilkan hasil analisis sentimen dalam bentuk grafik dan diagram yang interaktif.
- **Simpan Hasil**: Memungkinkan pengguna untuk menyimpan hasil analisis dan evaluasi.

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React.js** (dengan Vite)
- **TailwindCSS** untuk styling
- **Recharts** untuk visualisasi data
- **SweetAlert2** untuk notifikasi interaktif
- **React Router Dom** untuk navigasi halaman

### Backend
- **Python** & **FastAPI**
- **Uvicorn** sebagai ASGI server
- **SQLite** sebagai basis data
- **Scikit-learn** (SVM & Vectorizer) untuk pemrosesan teks dan Machine Learning

## 📂 Struktur Proyek
```text
pajo/
├── backend/                  # Kode backend (Python/FastAPI)
│   ├── main.py               # Entry point API
│   ├── models.py             # Definisi skema database/model
│   ├── database.py           # Konfigurasi koneksi SQLite
│   ├── ml_pipeline.py        # Pipeline Machine Learning
│   ├── scrape_and_insert.py  # Script untuk scraping data
│   └── *.pkl                 # Model ML dan Vectorizer tersimpan
├── src/                      # Kode frontend (React)
│   ├── pages/                # Halaman UI (Visualisasi, EvaluasiModel, dll)
│   └── ...
├── PAJO.bat                  # Script Windows untuk menjalankan aplikasi
├── package.json              # Konfigurasi dependensi frontend
└── README.md                 # Dokumentasi proyek
```

## ⚙️ Cara Instalasi dan Menjalankan Aplikasi

### Prasyarat
Pastikan sistem Anda telah terpasang:
- **Node.js** & **npm** (untuk frontend)
- **Python 3.8+** (untuk backend)

### Instalasi Dependensi
1. **Frontend**:
   Buka terminal di root direktori (`pajo/`) dan jalankan:
   ```bash
   npm install
   ```

2. **Backend**:
   Buka terminal di direktori `backend/` dan pastikan dependensi Python telah terinstall (misalnya `fastapi`, `uvicorn`, `scikit-learn`, `sqlalchemy`, dll).

### Menjalankan Aplikasi (Windows)
Proyek ini dilengkapi dengan skrip *batch* yang memudahkan Anda menjalankan seluruh sistem sekaligus.

Cukup jalankan file `PAJO.bat` yang berada di root direktori:
1. Klik ganda pada file `PAJO.bat`.
2. Skrip akan secara otomatis menjalankan server **Backend** (di port 8000) dan **Frontend** (di port 5173).
3. Browser akan terbuka otomatis mengarah ke `http://localhost:5173/`.

### Menjalankan Secara Manual
Jika Anda tidak menggunakan Windows atau ingin menjalankannya secara terpisah:

**1. Menjalankan Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**2. Menjalankan Frontend:**
Buka terminal baru di root direktori proyek, lalu jalankan:
```bash
npm run dev
```
Kemudian buka browser dan akses `http://localhost:5173/`.

## 📜 Lisensi
Sistem ini bersifat tertutup (private) seperti yang dikonfigurasi pada `package.json`.
