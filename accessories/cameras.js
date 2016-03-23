var wink = require('wink-js');
var inherits = require('util').inherits;

/*
 *   Generic Accessory
 */
var WinkAccessory, Accessory, Service, Characteristic, uuid;

/*
 *   Lock Accessory
 */

module.exports = function (oWinkAccessory, oAccessory, oService, oCharacteristic, ouuid) {
	if (oWinkAccessory) {
		WinkAccessory = oWinkAccessory;
		Accessory = oAccessory;
		Service = oService;
		Characteristic = oCharacteristic;
		uuid = ouuid;

		inherits(WinkCameraAccessory, WinkAccessory);
		WinkCameraAccessory.prototype.loadData = loadData;
		WinkCameraAccessory.prototype.deviceGroup = 'cameras';
	}
	return WinkCameraAccessory;
};
module.exports.WinkCameraAccessory = WinkCameraAccessory;

function WinkCameraAccessory(platform, device) {
	WinkAccessory.call(this, platform, device, device.camera_id);

	var that = this;

	//Items specific to Door Locks:
	this
		.addService(Service.LockMechanism)
		.getCharacteristic(Characteristic.LockCurrentState)
		.on('get', function (callback) {
			switch (that.device.last_reading.mode) {
				case "armed":
					callback(null, Characteristic.LockCurrentState.SECURED);
					break;
				case "privacy":
					callback(null, Characteristic.LockCurrentState.UNSECURED);
					break;
				default:
					callback(null, Characteristic.LockCurrentState.UNKNOWN);
					break;
			}
		});

	this
		.getService(Service.LockMechanism)
		.getCharacteristic(Characteristic.LockTargetState)
		.on('get', function (callback) {
			switch (that.device.desired_state.mode) {
				case "armed":
					callback(null, Characteristic.LockCurrentState.SECURED);
					break;
				case "privacy":
					callback(null, Characteristic.LockCurrentState.UNSECURED);
					break;
				default:
					callback(null, Characteristic.LockCurrentState.UNKNOWN);
					break;
			}
		})
		.on('set', function (value, callback) {
			switch (value) {
				case Characteristic.LockTargetState.SECURED:
					that.updateWinkProperty(callback, "mode", "armed");
					break;
				case Characteristic.LockTargetState.UNSECURED:
					that.updateWinkProperty(callback, "mode", "privacy");
					break;
			}
		});



	this.loadData();
}

var loadData = function () {
	this.getService(Service.LockMechanism)
		.getCharacteristic(Characteristic.LockCurrentState)
		.getValue();
	this.getService(Service.LockMechanism)
		.getCharacteristic(Characteristic.LockTargetState)
		.getValue();
};
