var instance_skel = require('../../instance_skel');
const { temperatures } = require('./temperatures');
var debug;

const TEMP_MIN_ID = 143;
const TEMP_MAX_ID = 344;

const TEMP_MIN = 2900;
const TEMP_MAX = 7000;

const INTERVAL_MIN = 250;
const INTERVAL_DEFAULT = 500;

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

	self.data = {
		status: { 
			power: null,
			brightness: 0, 
			temperature: 0,
		},
		interval: null,
	}

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.updateVariableDefinitions();
	self.initPolling();
	self.status(self.STATE_OK);
}

instance.prototype.init = function() {
	var self = this;
	debug = self.debug;

	self.updateVariableDefinitions();
	self.initPolling();
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
		},
		{
			type: 'checkbox',
			id: 'polling',
			label: 'Enable Polling?',
			width: 6,
			default: true,
		},
		{
			type: 'number',
			id: 'interval',
			label: `Polling interval in milliseconds (default: ${INTERVAL_DEFAULT}, min: ${INTERVAL_MIN})`,
			width: 12,
			min: INTERVAL_MIN,
			default: INTERVAL_DEFAULT,
			required: true,
		},
	]
}

// variable definitions
instance.prototype.updateVariableDefinitions = function() {
	const self = this;
	self.data.variables = {};

	if (!self.config.polling) {
		self.setVariableDefinitions([]);
		return;
	}

	self.data.variables.on = {
		label: 'Light Power Status',
		name: 'power',
		getValue: (value) => POWER_VALUES[value],
	};

	self.data.variables.brightness = {
		label: 'Light Brightness',
        name: 'brightness',
        getValue: (value) => Number(value),
	};

	self.data.variables.temperature = {
		label: 'Light Temperature',
		name: 'temperature',
		getColorTemp: (value) => Number(convertToK(value)),
		getValue: (value) => `${convertToK(value)}K`,
	};

	self.setVariableDefinitions(Object.keys(self.data.variables).map(name => ({ 
		label: self.data.variables[name].label,
		name: self.data.variables[name].name,
	})));
}

// poll light api on an interval
instance.prototype.initPolling = function() {
	const self = this;

	if (self.data.interval) {
		clearInterval(self.data.interval);
		}

	if (self.config.ip && self.config.polling) {
		const url = `http://${self.config.ip}:9123/elgato/lights`;

		self.data.interval = setInterval(() => {
			self.system.emit('rest_get', url, function (err, result) {
				if (err !== null) {
					self.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
					self.status(self.STATUS_ERROR, result.error.code);
					return;
}
				self.updateLightStatus(result.data.lights[0]);
				self.status(self.STATUS_OK);
			});
		}, self.config.interval);
	}
}

// update data status and instance variables
instance.prototype.updateLightStatus = function(status) {
	const self = this;

	Object.keys(self.data.variables).forEach(id => {
		const value = status[id]
		const name = self.data.variables[id].name;

		if (self.data.status[name] !== value) {
			self.data.status[name] = value;
			if (typeof self.data.variables[id].getValue === 'function') {
				this.setVariable(name, self.data.variables[id].getValue(value));
			} else {
				this.setVariable(name, value);
            }
		}
	});
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.data.interval) {
		clearInterval(self.data.interval);
	}

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
					self.updateLightStatus(result.data.lights[0]);
				}
			});
		}
	}	
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
