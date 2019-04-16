class TransactionDB {
    static async save(transaction) {
        // Save
        await global.database.collection('transaction').findOneAndUpdate(
            { "_id": transaction.id }, 
            { $set: transaction }, 
            { upsert: true, new: true, returnOriginal: false });
    }
}
module.exports = TransactionDB;
