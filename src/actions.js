const { getMired, getKelvin } = require('./utils');

module.exports = {
	initActions() {
		const actions = {
			'power': {
				label: 'Power',
				options: [
					{
						type: 'dropdown',
						label: 'Power on/off',
						id: 'bool',
						choices: [
							{ id: 'off', label: 'off' },
							{ id: 'on', label: 'on' }
						],
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
						type: 'dropdown',
						label: 'Color Temperature',
						id: 'temp',
						choices: this.TEMP_CHOICES,
						default: this.MIRED_MIN,
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
						min: this.BRIGHTNESS_MIN,
						max: this.BRIGHTNESS_MAX,
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
		};
	
		this.setActions(actions);
	},
	
	action(action) {
		console.log(action);
		if (this.config.ip) {
			let lightObj = {};
	
			switch (action.action) {
				case 'power':
					lightObj.on = (action.options.bool === 'on' ? 1 : 0);
					break;
				case 'powercycle':
					lightObj.on = 1 - this.data.status.power;
					break;
				case 'colortemp':
					lightObj.temperature = parseInt(action.options.temp);
					break;
				case 'colortempchange':
					let newTemp = getKelvin(this.data.status.temperature) + action.options.delta;
					if (newTemp > this.KELVIN_MAX) {
						this.log('info', `Attempted to increase temperature beyond max value. Type: ${action.action}`);
						return;
					}
					if (newTemp < this.KELVIN_MIN) {
						this.log('info', `Attempted to decrease temperature below max value. Type: ${action.action}`);
						return;
					}
					lightObj.temperature = getMired(newTemp);
					break;
				case 'brightnesschange':
					lightObj.brightness = this.data.status.brightness + action.options.delta;
					if (lightObj.brightness > this.BRIGHTNESS_MAX) {
						this.log('info', `Attempted to increase brightness beyond max value. Type: ${action.action}`);
						return;
					}
					if (lightObj.brightness < this.BRIGHTNESS_MIN) {
						this.log('info', `Attempted to decrease brightness below max value. Type: ${action.action}`);
						return;
					}
					break;
				case 'brightness':
					let brightness = action.options.brightness;
					lightObj.brightness = parseInt(brightness);
					break;
			}
	
			if (Object.keys(lightObj).length > 0) {
				let cmd = JSON.stringify({ lights: [lightObj] });
	
				this.system.emit('rest_put', this.getUrl(), cmd, (err, { data }) => {
					if (err !== null) {
						this.status(this.STATUS_ERROR, `Keylight Change Request Failed. Type: ${action.action}`);
						this.log('error', `Keylight Change Request Failed. Type: ${action.action}`);
					}
					else {
						this.status(this.STATUS_OK);
						this.updateVariables(data.lights[0]);
					}
				});
			}
		}
	}	
}
