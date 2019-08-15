# Mongo DB
import mongodb as DB
# Flask
from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from App import app, api

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('operation',required=True, location='json')
parser.add_argument('email', required=True, location='json')
parser.add_argument('password', location='json')
parser.add_argument('name', location='json')
parser.add_argument('lastname', location='json')
parser.add_argument('eventID', location='json')
parser.add_argument('zone', location='json')
parser.add_argument('seat', location='json')
parser.add_argument('social', location='json')



class userController(Resource):
  def post(self):
    json = parser.parse_args()
    print(json)
    # Iniciar Sesion
    if json['operation'] == 'login':
      user = DB.User.logIn(json['email'].lower(), json['password'])
      if not user:
        return {'success':False, 'message':'Wrong email or password'}, 405
      else:
        return {'success':True, 'name': user['name'], 'message': 'Login successful', 'balance': user['balance']}, 202
    
    # Registrarse
    elif json['operation'] == 'signup':
      if not (json['lastname'] and json['name']):
        r = {}
        if not json['lastname']:
          r['lastname'] = 'Missing argument'    
        if not json['name']:
          r['name'] = 'Missing argument'    
        
        return {'success': False, 'message': r}, 400

      success = DB.User.signUp(json['name'],json['lastname'],json['email'].lower(),json['password'], json['social'])
       
      if not success:
        return {'success':False, 'message':'User exists'}, 405
      else:
        return {'success':True, 'message': 'User created'}, 202

    # Editar Usuario
    elif json['operation'] == 'update':
      if (json['lastname'] and json['name'] and json['email'] and json['password']):
        DB.User.editUser(json['name'],json['lastname'],json['email'].lower(),json['password'])
        return {'success': True, 'message': 'Update successful'}, 200
      else:
        return {'success':False, 'message':'Wrong arguments'}, 405

    # Mostrar Usuario
    elif json['operation'] == 'show':
      if json['email']:
        success = DB.User.showUser(json['email'])
        return { 'success':True, 'name':success['name'], 'lastname':success['lastname'], 'balance': success['balance'] }, 200
      else:
        return {'success':False, 'message':'Wrong arguments'}, 405

    # Operacion incorrecta
    else:
      return {'success':False, 'message': 'Wrong operation'}, 405
    
    return {'success':True, 'message':'OK'}, 200

api.add_resource(userController, '/User')

