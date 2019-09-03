# Mongo DB
from pymongo import MongoClient
# client = MongoClient()
client = MongoClient('localhost', 27017)
DB = client.users



## Clase usuario, validamos, creamos y obtenemos los datos correspondientes de cada usuario
class User:
  def signUp (name, lastname, email, hashPass, social ):
    if social or not DB.Users.find_one({"email":email, "password": hashPass}):
      new = {"name": name, "lastname": lastname, "email": email, "password": hashPass, "balance": 0}
      DB.Users.insert_one(new)
      return True
    else:
      return False

  def logIn (email, hashPass):
    return DB.Users.find_one({"email":email, "password":hashPass})

  def editUser(name,lastname,email,hashPass):
    var = {"email":email}
    DB.Users.update(var, {"$set":{'name':name,'lastname':lastname,'password':hashPass}})
    return True

  def showUser(email):
    var = {"email":email}
    return DB.Users.find_one(var)


class Event:
  def create(name, place, date, description, id, t, resell, delegate, canReturn, owner, image, wallpaper, thumbnail):
    return DB.Events.insert_one({
      "name": name,
      "place": place,
      "date": date,
      "description": description,
      "owner": owner,
      "resell": resell, "delegate": delegate, "canReturn": canReturn,
      "_id": id,
      "type": t,
      "image": image,
      "wallpaper": wallpaper,
      "thumbnail": thumbnail
     })

  def delete(event):
    e = DB.Event.find_one({"_id":event})
    if e == None:
      return False
    else:
      DB.Event.delete_many({"_id":event})
      return True
  ## Comprar Ticket
  def buyTicket(email, id, eventID, zone, seat,price,Hash):
    new = { "eventID": eventID, "status":"Sold", "zone":zone, "seat":seat, "price":price, "hash": Hash, "_id": id }
    var = { "email":email }
    DB.Users.update(var, { "$push": { "tickets": new }  } )
    return True
  ## Mostrar tickets comprados de un usuario
  def showTickets(email):
    var = {"email":email}
    result = DB.Users.find_one(var)

    if "tickets" in result:
      return result["tickets"]
    else:
      return None

  def returnTicket(ticket,email):
    var = {"email":email}
    newArray = []
    result = DB.Users.find_one(var)
    for i in range(0,len(result['tickets'])):
      if result['tickets'][i]['_id'] == ticket:
        DB.Users.update(var, { "$inc": { "balance": int(result['tickets'][i]['price'])}})
        del result['tickets'][i]
        DB.Users.update(var, { "$set": { "tickets": result['tickets'] }  } )
        return
    return

  ## Tabla de tickets a la venta
  def setTicketResell(ticket,email,price):
    var = {"email":email}
    result = DB.Users.find_one({"email":email})
    for i in range(0,len(result['tickets'])):
      if result['tickets'][i]['_id'] == ticket:
        result['tickets'][i]['status'] = "Resell"
        DB.ResellTickets.insert_one({"_id": ticket, "email": email, "price": price })
        DB.Users.update(var, { "$set": { "tickets": result['tickets']}})
        break
    return True

  def cancelTicketResell(ticket):
    t = DB.ResellTickets.find_one({"_id":ticket})
    if t == None:
      return None
    else:
      DB.ResellTickets.delete_many({"_id":ticket})
      owner = {"email":t["email"]}
      result = DB.Users.find_one(owner)
      for i in range(0,len(result['tickets'])):
        if result['tickets'][i]['_id'] == ticket:
          result['tickets'][i]["status"] = "Sold"
          DB.Users.update(owner, { "$set": { "tickets": result['tickets'] }  } )
          break
    return True

  def resellTicket(ticket, newOwner):
    t = DB.ResellTickets.find_one({"_id":ticket})
    print(t)
    if t == None:
      return None
    else:
      DB.ResellTickets.delete_many({"_id":ticket})
      owner = {"email":t["email"]}
      newOwner = {"email": newOwner}
      result = DB.Users.find_one(owner)
      for i in range(0,len(result['tickets'])):
        if result['tickets'][i]['_id'] == ticket:
          result['tickets'][i]["status"] = "Sold"
          DB.Users.update(newOwner, { "$push": { "tickets": result['tickets'][i] }  } )
          DB.Users.update(owner, { "$inc": { "balance": int(t['price'])}})
          del result['tickets'][i]
          DB.Users.update(owner, { "$set": { "tickets": result['tickets'] }  } )
          break
    return t["email"]



  def get(id):
    return DB.Events.find_one({"_id": id})

  def getEvents(filter):
    res = []
    for event in DB.Events.find(filter):
      res.append({
        'name':event['name'],
        'place':event['place'],
        'date':event['date'],
        'id':event['_id']
      })
    return res

  def getFirstEvent():
    e = DB.Events.find()
    return e[e.count-1]





