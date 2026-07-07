@echo off
echo Packaging project for submission...

set ZIP_NAME=pathnovo_mto_generator.zip

powershell -Command "Compress-Archive -Path 'Backend', 'Frontend', 'README.md', 'docker-compose.yml', 'mto_api_postman_collection.json' -DestinationPath '%ZIP_NAME%' -Force"

echo Done! The zip file %ZIP_NAME% has been created.
echo Note: Ensure you have deleted 'node_modules', '.next', and 'venv' folders before running this to stay under the 10MB limit!
pause
