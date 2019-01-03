const ChargingStationDB = require("../database/ChargingStationDB")

class ChargingStation {
    constructor(data) {
        this.id = data.id;
        this.chargeBoxSerialNumber = data.chargeBoxSerialNumber;
        this.chargePointVendor = data.chargePointVendor;
    }

    async save() {
        await ChargingStationDB.save(this);
    }
}

module.exports = ChargingStation;

