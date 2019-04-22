const ConsumptionDB = require("../database/ConsumptionDB")

class Consumption {
    constructor(data) {
        this.id = data.id;
        this.transactionId = data.transactionId;
        this.timestampBegin = data.timestampBegin;
        this.timestampEnd = data.timestampEnd;
        this.consumptionWh = data.consumptionWh;
        this.instantPowerWatt = data.instantPowerWatt;
        this.totalConsumptionWh = data.totalConsumptionWh;
    }
    
    async save() {
        await ConsumptionDB.save(this);
    }

}

module.exports = Consumption;