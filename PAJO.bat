@echo off
setlocal
echo =======================================================
echo    MEMULAI SISTEM ANALISIS SENTIMEN PAJO
echo =======================================================
echo.

:: Pindah ke folder tempat PAJO.bat berada agar bisa dijalankan di komputer manapun
cd /d "%~dp0"

echo [1/5] Memeriksa Instalasi Software Dasar...

:: Cek Node.js
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js belum terinstal di komputer ini!
    echo Silakan download dan install Node.js dari https://nodejs.org/
    echo Tekan tombol apa saja untuk keluar...
    pause >nul
    exit /b
)

:: Cek Python (py launcher)
set PYTHON_CMD=py -3.12
where py >nul 2>nul
if errorlevel 1 (
    :: Cek python command biasa jika py tidak ada
    where python >nul 2>nul
    if errorlevel 1 (
        echo ERROR: Python belum terinstal di komputer ini!
        echo Silakan download dan install Python 3.12 dari https://www.python.org/
        echo Jangan lupa centang "Add Python to PATH" saat instalasi.
        echo Tekan tombol apa saja untuk keluar...
        pause >nul
        exit /b
    )
    set PYTHON_CMD=python
)
echo Software dasar (Node.js ^& Python) terdeteksi.
echo.

echo [2/5] Memeriksa Instalasi Dependensi Frontend (Node.js)...
cd /d "%~dp0"
if not exist "node_modules\" (
    echo node_modules tidak ditemukan! Sedang menginstal dependensi (ini butuh waktu beberapa menit)...
    call npm install
) else (
    echo Dependensi frontend sudah terinstal.
)
echo.

echo [3/5] Memeriksa Instalasi Dependensi Backend (Python)...
cd /d "%~dp0backend"
%PYTHON_CMD% -c "import fastapi, uvicorn, sqlalchemy, sklearn, Sastrawi, nltk, pandas, google_play_scraper" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Modul Python belum lengkap! Sedang menginstal dependensi...
    %PYTHON_CMD% -m pip install fastapi uvicorn sqlalchemy scikit-learn Sastrawi nltk pandas google-play-scraper joblib
) else (
    echo Dependensi backend sudah terinstal.
)
echo.

echo [4/5] Menjalankan Server Backend (FastAPI)...
start "PAJO Backend" cmd /k "cd /d ""%~dp0backend"" && %PYTHON_CMD% -m uvicorn main:app --reload --port 8000"

echo [5/5] Menjalankan Server Frontend (Vite/React)...
start "PAJO Frontend" cmd /k "cd /d ""%~dp0"" && npm run dev"

echo Menunggu sistem siap...
timeout /t 4 /nobreak > NUL

echo Membuka browser...
start http://localhost:5173/

echo.
echo Sistem berhasil dijalankan di latar belakang!
echo Anda bisa menutup jendela hitam ini, tapi biarkan jendela "PAJO Backend" dan "PAJO Frontend" tetap terbuka.
pause
