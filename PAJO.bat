@echo off
echo =======================================================
echo    MEMULAI SISTEM ANALISIS SENTIMEN PAJO
echo =======================================================
echo.

echo [1/3] Menjalankan Server Backend (FastAPI)...
start "PAJO Backend" cmd /k "cd /d c:\xampp\htdocs\pajo\backend && py -3.12 -m uvicorn main:app --reload --port 8000"

echo [2/3] Menjalankan Server Frontend (Vite/React)...
start "PAJO Frontend" cmd /k "cd /d c:\xampp\htdocs\pajo && npm run dev"

echo [3/3] Menunggu sistem siap...
timeout /t 4 /nobreak > NUL

echo Membuka browser...
start http://localhost:5173/

echo.
echo Sistem berhasil dijalankan di latar belakang!
echo Anda bisa menutup jendela hitam ini, tapi biarkan jendela "PAJO Backend" dan "PAJO Frontend" tetap terbuka.
pause
