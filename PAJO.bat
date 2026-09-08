@echo off
setlocal
echo =======================================================
echo    MEMULAI SISTEM ANALISIS SENTIMEN PAJO
echo =======================================================
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
