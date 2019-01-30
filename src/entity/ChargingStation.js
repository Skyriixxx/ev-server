const ChargingStationDB = require("../database/ChargingStationDB")

class ChargingStation {
    constructor(data) {
        this.id = data.id;
        this.chargeBoxSerialNumber = data.chargeBoxSerialNumber;
        this.chargePointModel = data.chargePointModel;
        this.chargePointSerialNumber = data.chargePointSerialNumber;
        this.chargePointVendor = data.chargePointVendor;
        this.firmwareVersion = data.firmwareVersion;
    }

    async save() {
        await ChargingStationDB.save(this);
    }
}

module.exports = ChargingStation;

