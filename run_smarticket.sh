cd Back
node app.js eth &
node app.js server &

cd ../Front
cd pyserver
python3 main.py &
cd ..
ng serve --port 80 --host=0.0.0.0 --disable-host-check &
