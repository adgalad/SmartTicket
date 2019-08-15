
import json
from App import app, api, address
import User
import Event


serverAddress = "localhost"

if __name__ == '__main__':
  # server = json.load(open('config.json'))['flask']
  # User.app.run(debug=True,host=server['network'], port=int(server['port']))
  Event.getToken()
  app.run(debug=True,host=address, port=8000)
