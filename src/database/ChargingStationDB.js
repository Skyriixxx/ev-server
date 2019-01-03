
class ChargingStationDB {
    static async save(chargingStation) {
        // Save
        const result = await global.database.collection('chargingstation').findOneAndUpdate(
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
}

module.exports = ChargingStationDB;
