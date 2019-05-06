var express = require('express');
var cors = require('cors');
var app = express();
const ChargingStationDB = require("../../database/ChargingStationDB")
const ConsumptionDB = require("../../database/ConsumptionDB")

class RestServer {
    constructor(jsonServer) {
        this.jsonServer = jsonServer;
    }

    async start() {
        console.log(`Starting Rest server...`);
        // Get the Request
        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded());
        app.use('/rest/api', async (req, res) => {
            // Check path
            switch (req.path) {
                // Get Chargers
                case "/GetChargingStations":
                    // Set Header
                    res.setHeader('Content-Type', 'application/json');
                    // Get Charging Stations
                    const chargingStations = await ChargingStationDB.getChargingStations();
                    // Respond
                    res.json(chargingStations);
                    break;  

                case "/GetConsumptions":    
                    // Set Header
                    res.setHeader('Content-Type', 'application/json');
                    // Get the transation ID
                    const transactionId = parseInt(req.query.TransactionId);
                    // Get Consumption
                    const consumptions = await ConsumptionDB.getConsumptions(transactionId);
                    // Respond
                    res.json(consumptions);
                    break;

                case "/RestartChargingStation":
                    try {
                        // Get ChargerID
                        const chargerID = req.body.ID;
                        // Call Json Server
                        const result = await this.jsonServer.requestRestartChargingStation(chargerID);
                        // Return response
                        if (result.status === "Accepted") {
                            // Ok
                            res.json({success: true});
                        } else {
                            // Ko
                            res.json({success: false});
                        }
                    } catch (error) {
                        // Send ChargerID to the server
                        res.json({success: false});
                        // Display error
                        console.log(error);                        
                    }
                    break;

                 case "/StartTransaction":
                     try {
                         // Get ChargerID
                         const chargerID = req.body.chargerID;
                         const connectorID = req.body.connectorID;
                         // Call Json Server
                         const result = await this.jsonServer.requestRemoteStartTransaction(connectorID, chargerID);
                         //Return Response
                         if (result.status === "Accepted") {
                            // Ok
                            res.json({success: true});
                        } else {
                            // Ko
                            res.json({success: false});
                        }
                    } catch (error) {
                         // Send ChargerID to the server
                        res.json({success: false});
                         // Display error
                         console.log(error);                        
                     }
                     break;
                     case "/StopTransaction":
                     try {
                         const transactionID = req.body.transactionID;
                         const chargerID = req.body.chargerID;
                         // Call Json Server
                         const result = await this.jsonServer.requestRemoteStopTransaction(transactionID, chargerID);
                         //Return Response
                         if (result.status === "Accepted") {
                            // Ok
                            res.json({success: true});
                        } else {
                            // Ko
                            res.json({success: false});
                        }
                    } catch (error) {
                         // Send ChargerID to the server
                        res.json({success: false});
                         // Display error
                         console.log(error);                        
                     }
                     break;                    
                          
                default:
                    res.status(500).send(`Action not supported '${req.path}'`);
                    break;
            }
        });
        // Listen
        app.listen(8888);
        // Ok
        console.log(`Rest server started successfully`);        
    }
}

module.exports = RestServer;

