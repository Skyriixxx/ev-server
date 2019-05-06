class ConsumptionDB {
    static async save(consumption) {
        // Save
        await global.database.collection('consumption').findOneAndReplace(
            { "_id": consumption.id }, 
            consumption, 
            { upsert: true, new: true, returnOriginal: false });
    }

    static async getConsumptions(transactionId) {
        const Consumption = require("../entity/Consumption");
        // Get charger with ID
        const results = await global.database.collection('consumption').find({
            transactionId: transactionId
        }).toArray();
        // Create objects
        const consumptions = [];
        for (const result of results) {
            // Create object
            const consumption = new Consumption(result);
            // Add
            consumptions.push(consumption);
        }
        // Return
        return consumptions;
    }
}
   

module.exports = ConsumptionDB;
