@echo off
setlocal
color 0A
echo =======================================================
echo    MEMULAI SISTEM ANALISIS SENTIMEN PAJO
echo =======================================================
echo.

:: 1. Cek Node.js
echo [1/6] Mengecek instalasi Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js tidak ditemukan!
    echo Aplikasi ini membutuhkan Node.js untuk menjalankan frontend.
    echo Silakan download dan install Node.js secara manual dari: https://nodejs.org/
    echo Setelah diinstall, buka kembali file PAJO.bat.
    pause
    exit /b
)
echo - Node.js terdeteksi.

:: 2. Cek Python
echo.
echo [2/6] Mengecek instalasi Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python tidak ditemukan!
    echo Aplikasi ini membutuhkan Python untuk menjalankan backend.
    echo Silakan download dan install Python secara manual dari: https://www.python.org/downloads/
    echo PENTING: Pastikan Anda mencentang opsi "Add Python to PATH" saat proses instalasi!
    echo Setelah diinstall, buka kembali file PAJO.bat.
    pause
    exit /b
)
echo - Python terdeteksi.

:: 3. Instalasi Dependensi Frontend
echo.
echo [3/6] Menyiapkan dependensi Frontend (React/Vite)...
if not exist "node_modules\" (
    echo - node_modules tidak ditemukan. Mulai menginstal paket NPM...
    echo - (Proses ini membutuhkan koneksi internet dan waktu beberapa menit)
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Gagal menginstal dependensi frontend.
        echo Pastikan Anda memiliki koneksi internet yang stabil atau coba jalankan "npm install" secara manual di terminal.
        pause
        exit /b
    )
) else (
    echo - Dependensi frontend (node_modules) sudah ada.
)

:: 4. Instalasi Dependensi Backend
echo.
echo [4/6] Menyiapkan dependensi Backend (Python)...
cd backend
echo - Menginstal paket Python yang dibutuhkan...
echo - (Proses ini membutuhkan koneksi internet)
python -m pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Gagal menginstal dependensi backend Python.
    echo Coba jalankan secara manual: buka terminal, masuk ke folder "backend", lalu ketik "python -m pip install -r requirements.txt"
    cd ..
    pause
    exit /b
)
cd ..
echo - Dependensi Python berhasil disiapkan.

:: 5. Menjalankan Backend
echo.
echo [5/6] Menjalankan Server Backend (FastAPI)...
echo CATATAN: Jika muncul error "Gagal memuat data dari database" di browser,
echo jangan khawatir, database akan dibuat otomatis oleh sistem saat pertama kali dijalankan.
start "PAJO Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

:: 6. Menjalankan Frontend
echo.
echo [6/6] Menjalankan Server Frontend (Vite/React)...
start "PAJO Frontend" cmd /k "npm run dev"

echo.
echo Menunggu sistem siap (sekitar 5 detik)...
timeout /t 5 /nobreak > NUL

echo Membuka browser...
start http://localhost:5173/

echo.
color 0B
echo =======================================================
echo STATUS: BERHASIL!
echo Sistem sedang berjalan di latar belakang.
echo.
echo INFO PENTING:
echo - Anda bisa menutup jendela hitam (launcher) ini.
echo - TAPI, biarkan jendela "PAJO Backend" dan "PAJO Frontend" 
echo   tetap TERBUKA agar aplikasi bisa digunakan.
echo =======================================================
pause
