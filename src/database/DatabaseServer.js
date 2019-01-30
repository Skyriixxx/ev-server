const MongoClient = require('mongodb').MongoClient;

class DatabaseServer {
    async start() {
        console.log(`Starting Database server...`);
        // Connect to the DB
        this._mongoDBClient = await MongoClient.connect("mongodb://127.0.0.1:27017", {});
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
