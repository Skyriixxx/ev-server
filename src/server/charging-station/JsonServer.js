const webSocketServer = require('websocket').server;
const http = require('http');
const ip = "192.168.1.169";
const webSocketsServerPort = 8010;

class JsonServer {
  start() {
    // Create Http Server
    const server = http.createServer((request, response) => {
      // Not important for us. We're writing WebSocket server
    });
    // Listen
    server.listen(webSocketsServerPort, () => {
      console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
    });
    // Create Websocket
    const wsServer = new webSocketServer({
      httpServer: server
    });
    // This callback function is called every time someone
    // tries to connect to the WebSocket server
    wsServer.on('request', (request) => {
      console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
      const connection = request.accept('ocpp1.6', request.origin);
      // Listen to messqge
      connection.on('message', (message) => {
        var serverMessage = message.utf8Data;
        console.log(serverMessage);
        // Respond to the Boot Notif
        // Current Time
        let date = new Date();

        //send intervall
        wsServer.on('message', function incoming(message) {
          returnData = message;
          bootNotification = {status: "Accepted", currentTime: date.toISOString(), "heartbeatInterval": 60}
      
          wsServer.send(JSON.stringify(heart_beat));
        });

      });
      // Error
      connection.on('error', () => {
        if (protocols === "ocpp 1.6") {
          return "ocpp1.6";
          
        } else {
          console.log("error protocol");
        }
      });
      // Close
      connection.on('close', () => {
        console.log("connexion closed");
      });
      
    });
  }
}

module.exports = JsonServer;

