

class ChargingStationDB {
    static async save(chargingStation) {
        // Save
        const result = await global.database.collection('chargingstation').findOneAndUpdate(
            { "_id": chargingStation.id }, 
            { $set: chargingStation }, 
            { upsert: true, new: true, returnOriginal: false });
      }
}

module.exports = ChargingStationDB;
