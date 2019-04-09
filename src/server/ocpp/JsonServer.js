const webSocketServer = require('websocket').server;
const http = require('http');
const webSocketsServerPort = 8010;
const ChargingStation = require("../../entity/ChargingStation")
const ChargingStationDB = require("../../database/ChargingStationDB")
const uuid = require('uuid');
const   Promise = require('promise');

const JSON_REQUEST = 2;
const JSON_RESPONSE = 3;

class JsonServer {
  constructor() {
    this.connections = {};
    this.requests = {};
  }

  async start() {
    console.log(`Starting Charging Station server...`);
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
      // Get the charger ID
      const chargingStationID = request.httpRequest.url.substring(1);
      // Charger connected
      console.log((new Date()) + ' Connection of charger ' + chargingStationID + '.');
      // Get connection
      const connection = request.accept('ocpp1.6', request.origin);
      // Get the Charger ID
      connection.chargingStationID = chargingStationID;
      // Keep the connection
      this.connections[chargingStationID] = connection; 
      // Listen to error
      connection.on('error', (error) => {
        console.log(`## Error ${error}`);
      });
      // Listen to message
      connection.on('message', async (message) => {
        // Get message
        const serverMessage = message.utf8Data;
        // Log
        console.log(`>> Message received: ${serverMessage}`);
        // Parse
        const serverMessageParsed = JSON.parse(serverMessage);
        // Response?
        if (serverMessageParsed[0] === JSON_RESPONSE) {
          // Handle response
          await this.handleJsonResponse(connection, serverMessageParsed);
        // Request?
        } else if (serverMessageParsed[0] === JSON_REQUEST) {
          // Handle requests
          await this.handleJsonRequests(connection, serverMessageParsed);
        } else {
          console.log(`Message is neither a request nor a response ${serverMessageParsed[0]}`);
        }
      });
      // Close
      connection.on('close', () => {
        console.log("Connexion closed");
      });
    });
  }

  async handleJsonRequests(connection, serverMessageParsed) {
    // Get the command
    const command = serverMessageParsed[2]; 
    // Check Command
    switch (command) {
      // Boot Notification
      case "BootNotification":
        console.log(">> Bootnotif received");
        await this.handleBootNotification(connection.chargingStationID, connection, serverMessageParsed[1], serverMessageParsed[3]);
        break;
      // Heartbeat
      case "Heartbeat":
        // TODO: implement Heartbeat
        console.log(">> Heartbeat received");
        await this.handleHeartbeat(connection.chargingStationID, connection, serverMessageParsed[1], serverMessageParsed[3]);
        break;
      // StatusNotification
      case "StatusNotification":
        console.log(">> StatusNotification received");
        await this.handleStatusNotification(connection.chargingStationID, connection, serverMessageParsed[1], serverMessageParsed[3]);
        break;
      // Command Unknown
      default:
        console.log(`## Command unknown '${command}' for charging Station '${connection.chargingStationID}'`);
        break;
    }
  }

  async handleBootNotification(chargingStationID, connection, messageID, data) {
    try {
      // Set
      data.id = chargingStationID;
      // Build Charging Station
      const chargingStation = new ChargingStation(data);
      // Save
      await chargingStation.save();
      // Build Response
      const bootNotificationResponse = {
        status: "Accepted", 
        currentTime: new Date().toISOString(), 
        interval: 60
      }
      // Get the id of the bootnotif
      const response = [3, messageID, bootNotificationResponse];
      // Send
      connection.send(JSON.stringify(response));
      // Log
      console.log(`<< Response sent: ${JSON.stringify(response)}`);
    } catch (error) {
      // TODO: Send error message to the charger
      console.log(`## Error : ${error}`);
      // Build Response
      const bootNotificationResponse = {
        status: "Rejected", 
        currentTime: new Date().toISOString(), 
        interval: 60
      }
      // Get the id of the bootnotif
      const response = [3, messageID, bootNotificationResponse];
      // Send
      connection.send(JSON.stringify(response));
    }
  }

  async handleStatusNotification(chargingStationID, connection, messageID, data) {
    try {
      // Get Charging Station
      const chargingStation = await ChargingStationDB.getChargingStation(chargingStationID);
      if (!chargingStation) {
        // Error
        throw new Error(`Charging Station ${chargingStationID} does not exist!`);  
      }
      // Set Connector
      chargingStation[`connector${data.connectorId}`] = {
        "connectorId": data.connectorId,
        "errorCode": data.errorCode,
        "status": data.status,
        "timestamp": data.timestamp
      };
      // Save
      await chargingStation.save();
      // Get the id of the bootnotif
      const response = [3, messageID, {}];
      // Send
      connection.send(JSON.stringify(response));
      // Log
      console.log(`<< Response sent: ${JSON.stringify(response)}`);
    } catch (error) {
      // TODO: Send error message to the charger
      console.log(`## Error : ${error}`);
      // Get the id of the bootnotif
      const response = [3, messageID, {}];
      // Send
      connection.send(JSON.stringify(response));
    }
  }

  async handleHeartbeat(chargingStationID, connection, messageID, data) {
    try {
      // Get Charging Station
      const chargingStation = await ChargingStationDB.getChargingStation(chargingStationID);
      if (!chargingStation) {
        // Error
        throw new Error(`Charging Station ${chargingStationID} does not exist!`);  
      }
      const currentDateTime = new Date();
      // Code Heartbeat
      chargingStation.heartbeat = currentDateTime;
      // Save
      await chargingStation.save();
      // response of the heartbeat
      const response = [3, messageID, {"currentTime": currentDateTime.toISOString()}];
      // Send
      connection.send(JSON.stringify(response));
      // Log
      console.log(`<< Response sent: ${JSON.stringify(response)}`);
    } catch (error) {
      // TODO: Send error message to the charger
      console.log(`## Error : ${error}`);
      // Save
      await chargingStation.save();
      // response of the heartbeat
      const response = [3, messageID, {"currentTime": currentDateTime.toISOString()}];
      // Send
      connection.send(JSON.stringify(response));
    }
  }

  async handleJsonResponse(connection, serverMessageParsed) {
    // Get the Promise's methods
    const promiseMethods = this.requests[serverMessageParsed[1]];
    if (!promiseMethods) {
      console.log("Message response does not correspond to a request");      
    } else {
      console.log("PROMISE OK");
      // Handle request
      promiseMethods[0](serverMessageParsed[2]);
      // Delete
      delete this.requests[serverMessageParsed[1]];
    }
  }

  async restartChargingStation(chargingStationID) {
    return new Promise(async (resolve, reject) => {
      // Get the connection
      const connection = this.connections[chargingStationID];
      // Check
      if (!connection) {
        throw new Error(`No connection for charging station ${chargingStationID}`);
      }
      // Creer la requete
      const rebootChargingStationRequest = {
        type : "Hard"
      }
      // Envoyer la requete
      // [2, uuid(), "Reset", {type: "Hard"}];
      const request = [2, uuid(), "Reset", rebootChargingStationRequest];
      // Send
      await connection.send(JSON.stringify(request));
      // Log
      console.log(`>> Message sent: ${JSON.stringify(request)}`);
      // Keep the promise
      this.requests[request[1]] = [resolve, reject];
      // Timout
      setTimeout(() => {
        console.log("TIMEOUT");
        // No response received?
        if (this.requests[request[1]]) {
          console.log("TIMEOUT SENT EXCEPTION");
          // No reponse
          reject(new Error(`Timeout on request: ${JSON.stringify(request)}`))
        }
      }, 5000);
    });
  }

//   async startTransaction(connectionID) {
//     // Get the connection
//     const connection = this.connections[`connector${data.connectorId}`];
//     // Check
//     if (!connection) {
//       throw new Error(`No connection for connector ${data.connectorId}`);
//     }
//     // Creer la requete
//     const startTransactionRequest = {
//       connectorId: data.connectorId,
//       idTag: 
//       meterStart: 
//       timestamp: new Date().toISOString() 
//     }
//     // Envoyer la requete
//     // [2, uuid(), "Reset", {type: "Hard"}];

//     // Send

//     // Renvoyer la reponse
//     return true;
//   }
 }


module.exports = JsonServer;

