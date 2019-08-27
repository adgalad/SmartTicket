cd Back
node app.js eth &
node app.js server &

sleep 5
cd ../Front
cd pyserver
python3 main.py &
cd ..
sudo ng serve --port 80 --host=0.0.0.0 --disable-host-check &
