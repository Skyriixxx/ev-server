const MongoClient = require('mongodb').MongoClient;

class DatabaseServer {
    async start() {
        // Connect to the DB
        this._mongoDBClient = await MongoClient.connect(
            "mongodb://localhost:27017",
            {
                useNewUrlParser: true,
                poolSize: 30,
                reconnectTries: 3,
                reconnectInterval: 1000,
                autoReconnect: true
            }
        );
        // Get the EVDB
        this._db = this._mongoDBClient.db("evdb");
        // Ok
        console.log((new Date()) + ` Connected to MongoDB successfully`);
    }

    getDatabase() {
        return this._db;
    }
}

module.exports = DatabaseServer;
