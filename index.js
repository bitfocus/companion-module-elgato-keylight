var instance_skel = require('../../instance_skel');
const { temperatures } = require('./temperatures');
var debug;

const TEMP_MIN_ID = 143;
const TEMP_MAX_ID = 344;

const TEMP_MIN = 2900;
const TEMP_MAX = 7000;

const createTemperatureLookupTable = () => {
	const lookupTable = {};

	temperatures.forEach((value, index, list) => {
		if ((index === 0) || (value !== list[index - 1])) {
			lookupTable[`${value}K`] = index + TEMP_MIN_ID;
		}
	});
	return lookupTable;
}

const convertToK = (value) => temperatures[value - TEMP_MIN_ID];

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.status(self.STATE_OK);
}

instance.prototype.init = function() {
	var self = this;
	debug = self.debug;

	self.status(self.STATE_OK);
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module allows you to control the Elgato Keylight and Ringlight family with Companion.'
		},
		{
			type: 'textinput',
			id: 'ip',
			label: 'IP',
			width: 12,
			regex: self.REGEX_IP,
			default: '192.168.1.1',
			required: true
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({
		'power': {
			label: 'Power',
			options: [
				{
				type: 'dropdown',
				label: 'Power on/off',
				id: 'bool',
				choices: [{ id: 'off', label:'off'},{ id: 'on', label:'on'}],
				default: 'off'
				}
			]
		},
		'colortemp': {
			label: 'Color Temperature',
			options: [
				{
				type: 'number',
				label: 'Color Temperature',
				id: 'temp',
				min: 143,
				max: 344,
				default: 143,
				required: true,
				range: true
				}
			]
		},
		'brightness': {
			label: 'Brightness',
			options: [
				{
				type: 'number',
				label: 'Brightness',
				id: 'brightness',
				min: 0,
				max: 100,
				default: 50,
				required: true,
				range: true
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;

	if (self.config.ip) {
		//create the url for the request
		var cmd = "http://" + self.config.ip + ":9123/elgato/lights";

		let lights = [];
		let lightObj = {};

		switch (action.action) {
			case 'power':
				lightObj.on = (action.options.bool === 'on' ? 1 : 0);
				break;
			case 'colortemp':
				let colorTemperature = action.options.temp;
				let colorTemperatureString = colorTemperature.toString();
				lightObj.temperature = parseInt(colorTemperatureString);
				break;
			case 'brightness':
				let brightness = action.options.brightness;
				lightObj.brightness = parseInt(brightness);
				break;
		}

		lights[0] = lightObj;

		if (Object.keys(lightObj).length > 0) {
			console.log(lights);
			let command = {};
			command.lights = lights;
			let strCommand = JSON.stringify(command);
			console.log(strCommand);

			self.system.emit('rest_put', cmd, strCommand, function (err, result) {
				if (err !== null) {
					self.status(self.STATUS_ERROR, 'Keylight Change Request Failed. Type: ' + action.action);
					self.log('error', 'Keylight Change Request Failed. Type: ' + action.action);
				}
				else {
					self.status(self.STATUS_OK);
				}
			});
		}
	}	
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
