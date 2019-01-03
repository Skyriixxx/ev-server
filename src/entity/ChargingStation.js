const ChargingStationDB = require("../database/ChargingStationDB")

class ChargingStation {
    constructor(data) {
        this.id = data.chargingStationID;
        this.chargeBoxSerialNumber = data.chargeBoxSerialNumber;
        this.chargePointVendor = data.chargePointVendor;
    }

    async save() {
        try {
            await ChargingStationDB.save(this);
        } catch (error) {
            console.log(`DB Error : ${error}`);
        }
    }
}

module.exports = ChargingStation;

