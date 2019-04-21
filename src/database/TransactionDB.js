class TransactionDB {
    static async save(transaction) {
        // Save
        await global.database.collection('transaction').findOneAndUpdate(
            { "_id": transaction.id }, 
            { $set: transaction }, 
            { upsert: true, new: true, returnOriginal: false });
    }

    static async getTransaction(id) {
        const Transaction = require("../entity/Transaction");
        // Get transaction with ID
        const result = await global.database.collection('transaction').findOne({"_id": id});
        // Found?
        if (result) {
            // Yes: Create the transaction
            return new Transaction(result);
        }   
    }

    static async getTransactions() {
        const Transaction = require("../entity/Transaction");
        // Get charger with ID
        const results = await global.database.collection('transaction').find({}).toArray();
        // Create objects
        const transactions = [];
        for (const result of results) {
            // Create object
            const transaction = new Transaction(result);
            // Add
            transactions.push(transaction);
        }
        // Return
        return transactions;
    }

}
module.exports = TransactionDB;
