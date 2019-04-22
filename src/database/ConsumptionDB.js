class ConsumptionDB {
    static async save(consumption) {
        // Save
        await global.database.collection('consumption').findOneAndReplace(
            { "_id": consumption.id }, 
            consumption, 
            { upsert: true, new: true, returnOriginal: false });
    }
}   

module.exports = ConsumptionDB;
