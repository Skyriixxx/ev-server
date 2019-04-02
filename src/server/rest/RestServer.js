var express = require('express');
var cors = require('cors');
var app = express();
const ChargingStationDB = require("../../database/ChargingStationDB")

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
                case "/RestartChargingStation":
                    try {
                        // Get ChargerID
                        const chargerID = req.body.ID;
                        // Cqll Json Server
                        const result = await this.jsonServer.restartChargingStation(chargerID);
                        // Call Restart
                        res.json({success: result});
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

