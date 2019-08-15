# Mongo DB
import mongodb as DB

import json, requests
from App import app, api, mail, host

from flask_mail import Message
from flask import Flask
from flask_restful import Resource, Api, request, reqparse
import ast
import hashlib

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwiZW1haWwiOiJjYXJsb3MuMjU4OTZAZ21haWwuY29tIiwiaWQiOiI1YTZmMjcwYzFkNjEzNzA2MDkyMTUzNzQiLCJoYXNoIjoiMHhmMkJlYUUyNWIyM0YwY0NEZDIzNDQxMDM1NENiNDJEMDhlRDU0OTgxIiwiaWF0IjoxNTE3MjMzOTM4LCJleHAiOjE1MTc0MDY3Mzh9.XH54pYbFYSsRA1yYaqbVKjPcqI5N7i9ewQSOIWTmEvo'

def getToken():
  response = requests.post('http://0.0.0.0:3000/eventPromoter/authenticate', data = {
                  'email':'carlos.25896@gmail.com',
                  'password':'carlos2533'
                })
  print(response)
  data = response.json()
  if 'success' in data and data['success']:
    global token
    token = data['token']
    print(token)

def hash(str):
  unicodeStr = str.encode('utf-8')
  return hashlib.sha3_256(unicodeStr).hexdigest()

createParams = reqparse.RequestParser(bundle_errors=True)
createParams.add_argument('name',required=True, location='json')
createParams.add_argument('description', required=True, location='json')
createParams.add_argument('place',required=True, location='json')
createParams.add_argument('date',required=True, location='json')
createParams.add_argument('seatmap',required=True, location='json')
createParams.add_argument('resell',required=True, location='json')
createParams.add_argument('delegate',required=True, location='json')
createParams.add_argument('canReturn',required=True, location='json')
createParams.add_argument('image', location='json')
createParams.add_argument('wallpaper', location='json')
createParams.add_argument('thumbnail', location='json')
createParams.add_argument('owner',required=True, location='json')
createParams.add_argument('type',required=True, location='json')

getParams = reqparse.RequestParser(bundle_errors=True)
getParams.add_argument('id', required=True, location='args')

getEventsParams = reqparse.RequestParser(bundle_errors=True)
getEventsParams.add_argument('email', required=True, location='args')

buyTicket = reqparse.RequestParser(bundle_errors=True)
buyTicket.add_argument('id', required=True, location='json')
buyTicket.add_argument('zone', required=True, location='json')
buyTicket.add_argument('seat', required=True, location='json')
buyTicket.add_argument('price', required=True, location='json')
buyTicket.add_argument('email', required=True, location='json')

ticketController = reqparse.RequestParser(bundle_errors=True)
ticketController.add_argument('email', required=True, location='json')

eventName = reqparse.RequestParser(bundle_errors=True)
eventName.add_argument('id', required=True, location='args')

returnTicket = reqparse.RequestParser(bundle_errors=True)
returnTicket.add_argument('ticket', required=True, location='json')
returnTicket.add_argument('owner', required=True, location='json')

cancelTicketResell = reqparse.RequestParser(bundle_errors=True)
cancelTicketResell.add_argument('ticket', required=True, location='json')

resellTicket = reqparse.RequestParser(bundle_errors=True)
resellTicket.add_argument('ticket', required=True, location='json')
resellTicket.add_argument('owner', required=True, location='json')
resellTicket.add_argument('price', required=True, location='json')

buyConfirmation = reqparse.RequestParser(bundle_errors=True)
buyConfirmation.add_argument('email', required=True, location='json')
buyConfirmation.add_argument('tickets', required=True, location='json')
buyConfirmation.add_argument('event', required=True, location='json')

def eventType(t):
  if t == "0":
    return 'Feria'
  elif t == "1":
    return 'Cine'
  elif t == "2":
    return 'Deporte'
  elif t == "3":
    return 'Música'
  elif t == "4":
    return 'Teatro'

class eventController(Resource):
  def post(self):

    json = createParams.parse_args()

    body = {
      'name': json.name,
      'place': json.place,
      'date': json.date,
      'seatmap': json.seatmap,
      'resell': 1 if (json.resell == "True") else 0,
      'delegate': 1 if (json.delegate == "True") else 0,
      'canReturn': 1 if (json.canReturn == "True") else 0,
      'seatmap': json.seatmap,
      'token': token
    }
    print("Enviare el post")
    response = requests.post('http://0.0.0.0:3000/event', data = body)
    print("El post funciono", response.json())
    data = response.json()
    if not 'success' in data:
      print(data)
      return { 'success': False, 'message': data}, response.status_code
    if not data['success']:
      return data, response.status_code

    event = DB.Event.create(json['name'],
                            json['place'],
                            json['date'],
                            json['description'],
                            data['message']['_id'],
                            eventType(json['type']),
                            json['resell'],
                            json['delegate'],
                            json['canReturn'],
                            json['owner'],
                            json['image'],
                            json['wallpaper'],
                            json['thumbnail'])
    if not event:
      return {'success': False, 'message': "Couldn't create the event"}, 405
    else:
      return data['message']['_id'], 202

  def get(self):
    json = getParams.parse_args()
    event = DB.Event.get(json['id'])
    if not event:
      return {'success': False,'message': 'Event not found (id: ' + json['id'] + ')'}, 404
    params = {'id': json['id'], 'token': token}


    response = requests.get('http://0.0.0.0:3000/event', params = params)
    data = response.json()

    if not 'success' in data:
      return { 'success': False, 'message': data}, response.status_code
    if not data['success']:
      return data, response.status_code
    print(event['type'])
    data['message']['description'] = event['description']
    data['message']['image'] = event['image']
    data['message']['wallpaper'] = event['wallpaper']
    data['message']['thumbnail'] = event['thumbnail']
    data['message']['owner'] = event['owner']
    data['message']['type'] = event['type']
    return data, 202

class eventsController(Resource):
  def get(self):
    json = getEventsParams.parse_args()
    events = DB.Event.getEvents({'owner':json['email']})
    if not events:
      return {'success': True,'message': []}, 202
    return events

class buyController(Resource):
  def post(self):

    json = buyTicket.parse_args()
    json['idHash'] = json['email']
    json['token'] = token
    response = requests.post('http://0.0.0.0:3000/event/buyTicket', data = json)
    data = response.json()

    if not 'success' in data:
      return { 'success': False, 'message': data}, response.status_code
    if not data['success']:
      return data, response.status_code

    DB.Event.buyTicket(json['email'],
                       data["message"]["_id"],
                       json['id'],
                       json['zone'],
                       json['seat'],
                       json["price"],
                       data["message"]["ethereumHash"])

    return {'success':True, 'message': data["message"]}, 200


class returnController(Resource):
  def post(self):

    json = returnTicket.parse_args()
    print(json)
    json['token'] = token
    response = requests.post('http://0.0.0.0:3000/event/returnTicket', data = json)
    print(response)
    data = response.json()
    if not 'success' in data:
      return { 'success': False, 'message': data}, response.status_code
    if not data['success']:
      return data, response.status_code

    result = DB.Event.returnTicket(json['ticket'],json['owner'])
    print(result)
    return {'success':True, 'message': "Ticket returned successfully", "tx":data["tx"]}, 200

## Poner en reventa un ticket
class SetTicketResell(Resource):
  def post(self):
    json = resellTicket.parse_args()
    print(json)
    json['token'] = token
    response = requests.post('http://0.0.0.0:3000/event/setTicketResell',data = json)
    res = response.json()
    if not 'success' in res:
      return {'success': False, 'message': res}, res.status_code
    if not res['success']:
      return res, response.status_code
    ## Todo bien
    result = DB.Event.setTicketResell(json['ticket'],json['owner'],json['price'])
    return {}


class CancelTicketResell(Resource):
  def post(self):
    json = cancelTicketResell.parse_args()
    json['token'] = token
    response = requests.post('http://0.0.0.0:3000/event/cancelTicketResell',data = json)
    res = response.json()
    if not 'success' in res:
      return {'success': False, 'message': res}, res.status_code
    if not res['success']:
      return res, response.status_code
    ## Todo bien
    result = DB.Event.cancelTicketResell(json['ticket'])
    return {}

## Revender ticket
class ResellTicket(Resource):
  def post(self):
    json = resellTicket.parse_args()
    print(json)
    owner = DB.Event.resellTicket(json['ticket'], json['owner'])
    if owner == None:
      return {'success': False, 'message': "Ticket isn't being resold or doesn't exist"}, 404

    data = {
      'ticket':json['ticket'],
      'owner':owner,
      'newOwner':json['owner'],
      'token':token,
      'price':json['price']
    }

    response = requests.post('http://0.0.0.0:3000/event/resellTicket', data = data)

    res = response.json()
    if not 'success' in res:
      return {'success': False, 'message': res}, res.status_code
    if not res['success']:
      return res, response.status_code
    ## Todo bien
    return {'success': True, "message": "Ticket successfully sold"}

## Obtener los tickets comprados de un usuario
class TicketController(Resource):
  def post(self):
    json = ticketController.parse_args()
    result = DB.Event.showTickets(json['email'])
    if result == None:
      return []
    else:
      return result

## Obtener el nombre del evento dado un ID
class ReadEvent(Resource):
  def get(self):
    json = eventName.parse_args()
    res = DB.Event.get(json['id'])
    if not res:
      return { "success": False, "message": "Not event found"}, 400
    print (res["name"])
    return {"success": True, "name":res["name"], "resell":res["resell"], "delegate":res["delegate"], "canReturn":res["canReturn"]},200

class GetFirstEvent(Resource):
  def post(self):
    e = DB.Event.getFirstEvent()
    if not e:
      return {"success": False, "message": "Not event found"}, 200
    else:
      return {"success": True, "message": e["_id"]}, 200

class BuyConfirmation(Resource):
  def post(self):
    _json = buyConfirmation.parse_args()
    tickets = json.loads(_json["tickets"])
    event = DB.Event.get(_json["event"])

    print(event["thumbnail"])
    image = ast.literal_eval(event["thumbnail"])
    trs = ""
    for i in range(len(tickets)):
      trs +='<tr>\
            <td style="width: 25%;">\
              <a href="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+ tickets[i]["ethereumHash"] +'">\
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+ tickets[i]["ethereumHash"] +'" alt="">\
              </a>\
            </td>\
            <td>\
              <h4> <b>Zona</b> ' + tickets[i]["zone"] + '</h4>\
              <h4> <b>Asiento</b> ' + tickets[i]["seat"] + '</h4>\
              Hash: ' + tickets[i]["ethereumHash"] +'\
            </td>\
          </tr>'

    str = '\
<html lang="en">\
  <head>\
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">\
    <style>\
      #customers {font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;border-collapse: collapse;width: 100%;}\
      #customers td, #customers th { border: 1px solid #ddd;padding: 8px;}\
      #customers tr:nth-child(even){background-color: #f2f2f2;}\
      #customers tr:hover {background-color: #ddd;}\
      #customers th {padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #039be5;color: white;}\
    </style>\
  </head>\
  <body>\
    <table id="customers">\
        <tr>\
            <th><a href="'+host+ '"><h1 style="text-align: center;">SmarTicket</h1></a></th>\
        </tr>\
    </table>\
    <table>\
        <tr>\
          <td>\
            <div class="col s2" style="padding:30px;">\
              <a href="'+host+ '/MostrarEvento/"' + event["_id"] +'>\
                <img style="display:block; width:150px; height:150px" id="base64image"\
                src="data:'+ image["filetype"] +'+;base64,'+ image["value"] +'" />\
              </a>\
            </div>\
          </td>\
          <td>\
            <div class="col s8">\
              <h5>' + event["name"] + '</h5>\
              <h5> <b> Lugar: </b> ' + event["place"] + '</h5> <br> \
              <h5> <b> Fecha y hora: </b> ' + event["date"] + '</h5> <br>\
              <h5> <b> ID: </b> ' + event["_id"] + '</h5> <br>\
            </div>\
          </td>\
        </tr>\
    </table>\
      <table id="customers">' + trs +  '</table>\
    </div>\
  </body>\
</html>'

    msg = Message("Confirmación de pago", sender = 'smarticket.support', recipients = [_json["email"]])
    msg.html = str
    mail.send(msg)
    return {"success": True, "message": "sent"}, 200


## Rutas
api.add_resource(buyController, '/event/buyTicket')
api.add_resource(BuyConfirmation, '/event/confirmation')
api.add_resource(returnController,'/event/returnTicket')
api.add_resource(eventsController, '/events')
api.add_resource(eventController, '/event')
api.add_resource(TicketController,'/tickets')
api.add_resource(ReadEvent,'/event/name')
api.add_resource(GetFirstEvent,'/event/getfirst')
api.add_resource(ResellTicket,'/event/resellTicket')
api.add_resource(SetTicketResell,'/event/setTicketResell')
api.add_resource(CancelTicketResell,'/event/cancelTicketResell')