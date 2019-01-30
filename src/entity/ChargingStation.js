const ChargingStationDB = require("../database/ChargingStationDB")

class ChargingStation {
    constructor(data) {
        this.id = data.id;
        this.chargeBoxSerialNumber = data.chargeBoxSerialNumber;
        this.chargePointModel = data.chargePointModel;
        this.chargePointSerialNumber = data.chargePointSerialNumber;
        this.chargePointVendor = data.chargePointVendor;
        this.firmwareVersion = data.firmwareVersion;
        if (data.hasOwnProperty("connector1")) {
            this.connector1 = data.connector1;
        }

        if (data.hasOwnProperty("connector2")) {
            this.connector2 = data.connector2;
        }

    }

    async save() {
        await ChargingStationDB.save(this);
    }
}

module.exports = ChargingStation;

