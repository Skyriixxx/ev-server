const TransactionDB = require("../database/TransactionDB")
class Transaction {
    constructor(data) {
        this.chargingStationID = data.chargingStationID;
        this.id = data.id;
        this.connectorId = data.connectorId;
        this.idTag = data.idTag;
        this.meterStart = data.meterStart;
        this.timestamp = data.timestamp;
    }
    
    async save() {
        await TransactionDB.save(this);
    }

}

module.exports = Transaction;