
# Flask
from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from flask_mail import Mail


address = "0.0.0.0"
host = "http://" + address

app = Flask('application/json')
app.config['BUNDLE_ERRORS'] = True
CORS(app)

api = Api(app)

app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'smarticket.suport@gmail.com'
app.config['MAIL_PASSWORD'] = 'asd123asd'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True

mail = Mail(app)
