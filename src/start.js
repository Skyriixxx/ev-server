const JsonServer = require('./server/ocpp/JsonServer');
const DatabaseServer = require('./database/DatabaseServer');
const RestServer = require('./server/rest/RestServer');

class Bootstrap {
    static async start() {
        try {
            // Create DB
            const database = new DatabaseServer();
            // Start
            await database.start();
            // Keep it global
            global.database = database.getDatabase();
        
            // Create Json Server
            const jsonServer = new JsonServer();
            // Start
            await jsonServer.start();
            
            // Create Rest server
            const restServer = new RestServer();
            // Start
            restServer.start();
            
        } catch (error) {
            console.log(`Unexpected error at start-up : ${error}`);
        }
    }
}

// Start server
Bootstrap.start();
