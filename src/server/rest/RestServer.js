var express = require('express');
var app = express();
const ChargingStationDB = require("../../database/ChargingStationDB")

class RestServer {
    start() {
        console.log(`Starting Rest server...`);
        // Get the Request
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

