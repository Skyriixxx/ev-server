

class ChargingStation {
    constructor(data) {
        this.id = data.chargingStationID;
        this.chargeBoxSerialNumber = data.chargeBoxSerialNumber;
    }

    save() {
    }
}

module.exports = ChargingStation;

