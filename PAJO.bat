@echo off
echo =======================================================
echo    MEMULAI SISTEM ANALISIS SENTIMEN PAJO
echo =======================================================
echo.

echo [1/4] Memeriksa Instalasi Dependensi Frontend (Node.js)...
cd /d c:\xampp\htdocs\pajo
if not exist "node_modules\" (
    echo node_modules tidak ditemukan! Sedang menginstal dependensi (ini butuh waktu beberapa menit)...
    npm install
) else (
    echo Dependensi frontend sudah terinstal.
)
echo.

echo [2/4] Memeriksa Instalasi Dependensi Backend (Python)...
cd /d c:\xampp\htdocs\pajo\backend
py -3.12 -c "import fastapi, uvicorn, sqlalchemy, sklearn, Sastrawi, nltk, pandas, google_play_scraper" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Modul Python belum lengkap! Sedang menginstal dependensi...
    py -3.12 -m pip install fastapi uvicorn sqlalchemy scikit-learn Sastrawi nltk pandas google-play-scraper joblib
) else (
    echo Dependensi backend sudah terinstal.
)
echo.

echo [3/4] Menjalankan Server Backend (FastAPI)...
start "PAJO Backend" cmd /k "cd /d c:\xampp\htdocs\pajo\backend && py -3.12 -m uvicorn main:app --reload --port 8000"

echo [4/4] Menjalankan Server Frontend (Vite/React)...
start "PAJO Frontend" cmd /k "cd /d c:\xampp\htdocs\pajo && npm run dev"

echo [5/5] Menunggu sistem siap...
timeout /t 4 /nobreak > NUL

echo Membuka browser...
start http://localhost:5173/

echo.
echo Sistem berhasil dijalankan di latar belakang!
echo Anda bisa menutup jendela hitam ini, tapi biarkan jendela "PAJO Backend" dan "PAJO Frontend" tetap terbuka.
pause
