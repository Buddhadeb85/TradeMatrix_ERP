@echo off
FOR /F "tokens=1,2,3 delims=/ " %%a in ("%DATE%") do (
    set MYDATE=%%c-%%a-%%b
)
set BACKUP_DIR=D:\Projects\Grocery-Shop-POS\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Use full path to mysqldump.exe
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -pBuddha@1985 grocery_pos > "%BACKUP_DIR%\grocery_pos_%MYDATE%.sql"
echo Backup completed successfully: grocery_pos_%MYDATE%.sql
