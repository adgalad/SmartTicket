from App import app, api, address
import Event

if __name__ == "__main__":
    Event.getToken()
    app.run()