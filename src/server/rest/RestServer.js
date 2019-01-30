var express = require('express');
var app = express();

class RestServer {
    start() {
        console.log(`Starting Rest server...`);
        // Get the Request
        app.use('/rest/api', (req, res) => {
          res.send('Hello World!');
        });
        // Listen
        app.listen(8888);
        // Ok
        console.log(`Rest server started successfully`);        
    }
}

module.exports = RestServer;

