
class ChargingStationDB {
    static async save(chargingStation) {
        // Save
        await global.database.collection('chargingstation').findOneAndUpdate(
            { "_id": chargingStation.id }, 
            { $set: chargingStation }, 
            { upsert: true, new: true, returnOriginal: false });
    }

    static async getChargingStation(id) {
        const ChargingStation = require("../entity/ChargingStation");
        // Get charger with ID
        const result = await global.database.collection('chargingstation').findOne({"_id": id});
        // Found?
        if (result) {
            // Yes: Create the charger
            return new ChargingStation(result);
        }   
    }

    static async getChargingStations() {
        const ChargingStation = require("../entity/ChargingStation");
        // Get charger with ID
        const results = await global.database.collection('chargingstation').find({}).toArray();
        // Create objects
        const chargingStations = [];
        for (const result of results) {
            // Create object
            const chargingStation = new ChargingStation(result);
            // Add
            chargingStations.push(chargingStation);
        }
        // Return
        return chargingStations;
    }
}

module.exports = ChargingStationDB;
