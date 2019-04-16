const webSocketServer = require('websocket').server;
const http = require('http');
const webSocketsServerPort = 8010;
const ChargingStation = require("../../entity/ChargingStation")
const ChargingStationDB = require("../../database/ChargingStationDB")
const Transaction = require("../../entity/Transaction")
const uuid = require('uuid');
const Promise = require('promise');

const JSON_REQUEST = 2;
const JSON_RESPONSE = 3;
const JSON_ERROR = 4;

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
        // Error?
        } else if (serverMessageParsed[0] === JSON_ERROR) {
          console.log(`Error received: ${serverMessageParsed[3]}`);
          // Delete
          delete this.requests[serverMessageParsed[1]];
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
      // StartTransaction
      case "StartTransaction":
        console.log(">> StartTransaction received");
        await this.handleStartTransaction(connection.chargingStationID, connection, serverMessageParsed[1], serverMessageParsed[3]);
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
      const response = [JSON_RESPONSE, messageID, bootNotificationResponse];
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
      const response = [JSON_RESPONSE, messageID, bootNotificationResponse];
      // Send
      connection.send(JSON.stringify(response));
    }
  }

  async handleStartTransaction(chargingStationID, connection, messageID, data) {
    try {
      // Get Charging Station
      const chargingStation = await ChargingStationDB.getChargingStation(chargingStationID);
      if (!chargingStation) {
        // Error
        throw new Error(`Charging Station ${chargingStationID} does not exist!`);  
      }
      // Set
      data.id = new Date().getTime() % 2000000000;
      data.chargingStationID = chargingStationID;
      // Build a Transaction
      const transaction = new Transaction(data);
      // Save
      await transaction.save();
      // Set Connector
      chargingStation[`connector${data.connectorId}`].transactionID = data.id;
      // Save
      await chargingStation.save();
      // Build Response
      const startTransactionResponse = {
        idTagInfo: {        
          status: "Accepted"
        },
        transactionId: data.id 
      }
      // Build Response
      const response = [JSON_RESPONSE, messageID, startTransactionResponse];
      // Send Response
      connection.send(JSON.stringify(response));
      // Log
      console.log(`<< Response sent: ${JSON.stringify(response)}`);
    } catch (error) {
      console.log(`## Error : ${error}`);
      const startTransactionResponse = {
        idTagInfo: {        
          status: "Rejected"
        },
        transactionId: data.connectorId
      }
      // Get the id of the bootnotif
      const response = [JSON_RESPONSE, messageID, startTransactionResponse];
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
      const response = [JSON_RESPONSE, messageID, {}];
      // Send
      connection.send(JSON.stringify(response));
      // Log
      console.log(`<< Response sent: ${JSON.stringify(response)}`);
    } catch (error) {
      // TODO: Send error message to the charger
      console.log(`## Error : ${error}`);
      // Get the id of the bootnotif
      const response = [JSON_RESPONSE, messageID, {}];
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
      const response = [JSON_RESPONSE, messageID, {"currentTime": currentDateTime.toISOString()}];
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
      const response = [JSON_RESPONSE, messageID, {"currentTime": currentDateTime.toISOString()}];
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
      // Handle request
      promiseMethods[0](serverMessageParsed[2]);
      // Delete
      delete this.requests[serverMessageParsed[1]];
    }
  }

  async restartChargingStation(chargingStationID) {
    return new Promise(async (resolve, reject) => {
      // Get the connection
      const connection = this._getChargingStationConnection(chargingStationID);
      // Creer la requete
      const rebootChargingStationRequest = {
        type : "Hard"
      }
      // Envoyer la requete
      // [JSON_REQUEST, uuid(), "Reset", {type: "Hard"}];
      const request = [JSON_REQUEST, uuid(), "Reset", rebootChargingStationRequest];
      // Send Request
      await this._sendRequest(connection, request, resolve, reject);
    });
  }

  async _sendRequest(connection, request, resolve, reject) {
    const req = JSON.stringify(request);
    // Send
    await connection.send(req);
    // Log
    console.log(`>> Message sent: ${req}`);
    // Keep the promise
    this.requests[request[1]] = [resolve, reject];
    // Timout
    setTimeout(() => {
      // No response received?
      if (this.requests[request[1]]) {
        // No reponse
        reject(new Error(`Timeout on request: ${req}`))
      }
    }, 5000);
  }

  _getChargingStationConnection(chargingStationID) {
      // Get the connection
      const connection = this.connections[chargingStationID];
      // Check
      if (!connection) {
        throw new Error(`No connection for charging station ${chargingStationID}`);
      }
      return connection;
  }

  async startTransaction(connectorID, chargingStationID) {
    return new Promise(async (resolve, reject) => {
      // Get the connection
      const connection = this._getChargingStationConnection(chargingStationID);
      // Creer la requete
      const startTransactionRequest = {
        connectorId: connectorID,
        idTag: "10ZE35RT67" 
      }
      // Envoyer la requete
      // [JSON_REQUEST, uuid(), "Reset", {type: "Hard"}];
      const request = [JSON_REQUEST, uuid(), "RemoteStartTransaction", startTransactionRequest];
      
      // Send Request
      await this._sendRequest(connection, request, resolve, reject);
    });
  }
 }


module.exports = JsonServer;

