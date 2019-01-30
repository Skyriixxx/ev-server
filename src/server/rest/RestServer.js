var express = require('express');
var app = express();

class RestServer {
    start() {
        console.log(`Starting Rest server...`);
        // Get the Request
        app.use('/rest/api', (req, res) => {
            // Check path
            switch (req.path) {
                // Get Chargers
                case "/GetChargingStations":
                    // Set Header
                    res.setHeader('Content-Type', 'application/json');
                    // Get Chargers

                    // Respond
                    res.json({ a: 1 });
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

