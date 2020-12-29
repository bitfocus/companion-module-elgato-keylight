const { INTERVAL_DEFAULT, INTERVAL_MIN } = require('./utils');

module.exports = {
	config_fields() {
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
				regex: this.REGEX_IP,
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
				label: `Polling interval in milliseconds (default: ${this.INTERVAL_DEFAULT}, min: ${this.INTERVAL_MIN})`,
				width: 12,
				min: this.INTERVAL_MIN,
				default: this.INTERVAL_DEFAULT,
				required: true,
			},
		];
	}	
}
