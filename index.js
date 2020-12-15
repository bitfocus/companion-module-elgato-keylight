var instance_skel = require('../../instance_skel');
const { temperatures } = require('./temperatures');
var debug;

const TEMP_MIN_ID = 143;
const TEMP_MAX_ID = 344;

const TEMP_MIN = 2900;
const TEMP_MAX = 7000;

const BRIGHTNESS_MIN = 3;
const BRIGHTNESS_MAX = 100;

const INTERVAL_MIN = 250;
const INTERVAL_DEFAULT = 500;

const POWER_ON = 'ON';
const POWER_OFF = 'OFF';
const POWER_VALUES = [POWER_OFF, POWER_ON];

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

	self.data.temperatureLookupTable = createTemperatureLookupTable();
	self.data.choicesTemperature = Object.keys(self.data.temperatureLookupTable).map(k => (
		{
			id: self.data.temperatureLookupTable[k],
			label: k,
		}
	));
	self.data.choicesPower = POWER_VALUES.map((label, index) => ({ id: index, label }));

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.initFeedback();
	self.updateVariableDefinitions();
	self.initPolling();
	self.status(self.STATE_OK);
}

instance.prototype.init = function() {
	var self = this;
	debug = self.debug;

	self.initFeedback();
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
			self.checkFeedbacks(name);
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
		'powercycle': {
			label: 'Power Cycle',
		},
		'colortemp': {
			label: 'Color Temperature',
			options: [
				{
				type: 'number',
				label: 'Color Temperature',
				id: 'temp',
				min: TEMP_MIN_ID,
				max: TEMP_MAX_ID,
				default: TEMP_MIN_ID,
				required: true,
				range: true
				}
			]
		},
		'colortempk': {
			label: 'Color Temperature in Kelvin',
			options: [
				{
					type: 'dropdown',
					label: 'Color Temperature',
					id: 'tempK',
					choices: self.data.choicesTemperature,
					default: TEMP_MIN_ID,
				}
			]
        },
        'colortempchange': {
            label: 'Increase/Decrease Color Temperature (-200 to +200)',
            options: [
                {
                        type: 'number',
                        label: 'Color Temperature Delta',
                        id: 'delta',
                        min: -200,
                        max: 200,
                        default: 100,
                        required: true,
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
				min: BRIGHTNESS_MIN,
				max: BRIGHTNESS_MAX,
				default: 50,
				required: true,
				range: true
				}
			]
		},
        'brightnesschange': {
            label: 'Increase/Decrease Brightness (-25 to +25)',
            options: [
                {
                        type: 'number',
                        label: 'Brightness Delta',
                        id: 'delta',
                        min: -25,
                        max: 25,
                        default: 10,
                        required: true,
                }
            ]
        },
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
            case 'powercycle':
                lightObj.on = 1 - self.data.status.power;
                break;
            case 'colortemp':
			case 'colortempk':
				let colorTemperature = action.options.temp ? action.options.temp : action.options.tempK;
				let colorTemperatureString = colorTemperature.toString();
				lightObj.temperature = parseInt(colorTemperatureString);
                break;
            case 'colortempchange':
                let newTemp = self.data.variables.temperature.getColorTemp(self.data.status.temperature) + action.options.delta;
                if (newTemp > TEMP_MAX) {
                    self.log('info', 'Attempted to increase temperature beyond max value. Type: ' + action.action);
                    return;
                }
                if (newTemp < TEMP_MIN) {
                    self.log('info', 'Attempted to decrease temperature below max value. Type: ' + action.action);
                    return;
                }
                lightObj.temperature = self.data.temperatureLookupTable[`${newTemp}K`];
				break;
			case 'brightnesschange':
				lightObj.brightness = self.data.status.brightness + action.options.delta;
                if (lightObj.brightness  > BRIGHTNESS_MAX) {
                    self.log('info', 'Attempted to increase brightness beyond max value. Type: ' + action.action);
                    return;
                }
                if (lightObj.brightness  < BRIGHTNESS_MIN) {
                    self.log('info', 'Attempted to decrease brightness below max value. Type: ' + action.action);
                    return;
                }
				break;
            case 'brightness':
				let brightness = action.options.brightness;
				lightObj.brightness = parseInt(brightness);
				break;
		}

		lights[0] = lightObj;

		if (Object.keys(lightObj).length > 0) {
			let command = {};
			command.lights = lights;
			let strCommand = JSON.stringify(command);

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

// defines available feedbacks
instance.prototype.initFeedback = function() {
	const self = this;
	const feedbacks = {};

	const foregroundColor = {
		type: 'colorpicker',
		label: 'Foreground color',
		id: 'fg',
		default: this.rgb(255, 255, 255),
	};

	const backgroundColor = {
		type: 'colorpicker',
		label: 'Background color',
		id: 'bg',
		default: this.rgb(255, 0, 0),
	};
	
	const selectPower = {
		type: 'dropdown',
		label: 'Power Status',
		id: 'power',
		default: 1,
		choices: self.data.choicesPower,
    };
    
    const selectBrightness = {
        type: 'number',
        label: 'Brightness',
        id: 'brightness',
        min: BRIGHTNESS_MIN,
        max: BRIGHTNESS_MAX,
        default: 50,
    }

	const selectTemperature = {
		type: 'dropdown',
		label: 'Temperature in Kelvin',
		id: 'temperature',
		default: TEMP_MIN_ID,
		choices: self.data.choicesTemperature,
	};

	feedbacks.power = {
		label: 'Power Status',
		description: 'When light power status changes, change colors of the bank',
		options: [selectPower, foregroundColor, backgroundColor],
	};

    feedbacks.brightness = {
        label: 'Brightness',
		description: 'When light brightness changes, change colors of the bank',
		options: [selectBrightness, foregroundColor, backgroundColor],
    }

    feedbacks.temperature = {
		label: 'Color temperature',
		description: 'When light color temperature changes, change colors of the bank',
		options: [selectTemperature, foregroundColor, backgroundColor],
    };
    
	self.setFeedbackDefinitions(feedbacks);
}

// executes whenever feedback is checked 
instance.prototype.feedback = function(feedback, bank) {
    const self = this;
    let variable;
    let currentValue;
    let feedbackValue;

	switch (feedback.type) {
		case 'temperature':
        case 'brightness':
            variable = self.data.variables[feedback.type];
			break;
		case 'power':
            variable = self.data.variables.on;
			break;
	}

    currentValue = typeof variable.getValue === 'function' ? variable.getValue(self.data.status[feedback.type]) : self.data.status[feedback.type];
    feedbackValue = typeof variable.getValue === 'function' ? variable.getValue(feedback.options[feedback.type]) : feedback.options[feedback.type];

    if (currentValue === feedbackValue) {
        return { color: feedback.options.fg, bgcolor: feedback.options.bg }
    }
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
