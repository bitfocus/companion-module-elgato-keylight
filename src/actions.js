const { getMired, getKelvin } = require('./utils')

const { InstanceStatus } = require('@companion-module/base')
const { got } = require('got-cjs')

const updateActions = function (self) {
	const actions = {}

	actions.power = {
		name: 'Power',
		options: [
			{
				type: 'dropdown',
				label: 'Power on/off',
				id: 'bool',
				choices: [
					{ id: 'off', label: 'off' },
					{ id: 'on', label: 'on' },
				],
				default: 'off',
			},
		],
		callback: async (action) => {
			await runAction(self, action)
		},
	}
	actions.powercycle = {
		name: 'Power Cycle',
		options: [],
		callback: async (action) => {
			await runAction(self, action)
		},
	}

	actions.colortemp = {
		name: 'Color Temperature',
		options: [
			{
				type: 'dropdown',
				label: 'Color Temperature',
				id: 'temp',
				choices: self.TEMP_CHOICES,
				default: self.MIRED_MIN,
			},
		],
		callback: async (action) => {
			await runAction(self, action)
		},
	}
	actions.colortempchange = {
		name: 'Increase/Decrease Color Temperature (-200 to +200)',
		options: [
			{
				type: 'number',
				label: 'Color Temperature Delta',
				id: 'delta',
				min: -200,
				max: 200,
				default: 100,
				required: true,
			},
		],
		callback: async (action) => {
			await runAction(self, action)
		},
	}
	actions.brightness = {
		name: 'Brightness',
		options: [
			{
				type: 'number',
				label: 'Brightness',
				id: 'brightness',
				min: self.BRIGHTNESS_MIN,
				max: self.BRIGHTNESS_MAX,
				default: 50,
				required: true,
				range: true,
			},
		],
		callback: async (action) => {
			await runAction(self, action)
		},
	}
	actions.brightnesschange = {
		name: 'Increase/Decrease Brightness (-25 to +25)',
		options: [
			{
				type: 'number',
				label: 'Brightness Delta',
				id: 'delta',
				min: -25,
				max: 25,
				default: 10,
				required: true,
			},
		],
		callback: async (action) => {
			await runAction(self, action)
		},
	}

	self.setActionDefinitions(actions)
}

const runAction = async function (self, action) {
	if (self.config.ip) {
		const lightObj = {}

		switch (action.actionId) {
			case 'power': {
				lightObj.on = action.options.bool === 'on' ? 1 : 0
				break
			}
			case 'powercycle': {
				lightObj.on = 1 - self.data.status.power
				break
			}
			case 'colortemp': {
				lightObj.temperature = parseInt(action.options.temp, 10)
				break
			}
			case 'colortempchange': {
				const newTemp = getKelvin(self.data.status.temperature) + action.options.delta
				if (newTemp > self.KELVIN_MAX) {
					self.log('info', `Attempted to increase temperature beyond max value. Type: ${action.actionId}`)
					return
				}
				if (newTemp < self.KELVIN_MIN) {
					self.log('info', `Attempted to decrease temperature below max value. Type: ${action.actionId}`)
					return
				}
				lightObj.temperature = getMired(newTemp)
				break
			}
			case 'brightnesschange': {
				lightObj.brightness = self.data.status.brightness + action.options.delta
				if (lightObj.brightness > self.BRIGHTNESS_MAX) {
					self.log('info', `Attempted to increase brightness beyond max value. Type: ${action.actionId}`)
					return
				}
				if (lightObj.brightness < self.BRIGHTNESS_MIN) {
					self.log('info', `Attempted to decrease brightness below max value. Type: ${action.actionId}`)
					return
				}
				break
			}
			case 'brightness': {
				lightObj.brightness = parseInt(action.options.brightness, 10)
				break
			}
		}

		if (Object.keys(lightObj).length > 0) {
			const cmd = { lights: [lightObj] }
			const options = {
				json: cmd,
				headers: {
					'Content-Type': 'application/json',
				},
				timeout: {
					request: 10000,
				},
			}

			try {
				const data = await got.put(self.getUrl(), options).json()
				self.updateStatus(InstanceStatus.Ok)
				self.updateVariables(data.lights[0])
			} catch (error) {
				self.log('error', `action error: ${JSON.stringify(error)}`)
				if (error !== null) {
					self.log('error', `Keylight Change Request Failed. Type: ${action.actionId}`)
					self.updateStatus(InstanceStatus.UnknownError, `Keylight Change Request Failed. Type: ${action.actionId}`)
				}
			}
		}
	}
}

module.exports = {
	updateActions,
	runAction,
}
