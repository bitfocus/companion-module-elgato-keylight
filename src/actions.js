const { getMired, getKelvin } = require('./utils')

const { InstanceStatus } = require('@companion-module/base')
const { got } = require('got-cjs')

module.exports = {
	initActions() {
		let self = this
		let actions = {}

		actions.power = {
			name: 'Power',
			options: [
				{
					type: 'dropdown',
					label: 'Set Power to:',
					id: 'bool',
					choices: [
						{ id: 'off', label: 'off' },
                        { id: 'on', label: 'on' },
                        { id: 'toggle', label: 'toggle' },
					],
					default: 'off',
				},
			],
			callback: async (action) => {
				await self.runAction(action)
			},
		}

		actions.colortemp = {
			name: 'Color Temperature',
			options: [
                {
                    type: 'dropdown',
                    label: 'Mode:',
                    id: 'mode',
                    choices: [
                        { id: 'Set', label: 'Set to value' },
                        { id: 'AddSub', label: 'Increase/Decrease by value' }
                    ],
                    default: 'Set'
                },
				{
					type: 'dropdown',
					label: 'Color Temperature:',
					id: 'temp',
					choices: this.TEMP_CHOICES,
					default: this.MIRED_MIN,
                    range: true,
                    isVisible: (options) => options.mode === 'Set'
				},
                {
                    type: 'number',
                    label: 'Color Temperature Delta:',
                    id: 'delta',
                    min: -200,
                    max: 200,
                    default: 100,
                    required: true,
                    range: true,
                    isVisible: (options) => options.mode === 'AddSub'
                },
			],
			callback: async (action) => {
				await self.runAction(action)
			},
		}
		actions.brightness = {
			name: 'Brightness',
			options: [
                {
                    type: 'dropdown',
                    label: 'Mode:',
                    id: 'mode',
                    choices: [
                        { id: 'Set', label: 'Set to value' },
                        { id: 'AddSub', label: 'Increase/Decrease by value' }
                    ],
                    default: 'Set'
                },
				{
					type: 'number',
					label: 'Brightness',
					id: 'brightness',
					min: this.BRIGHTNESS_MIN,
					max: this.BRIGHTNESS_MAX,
					default: 50,
					required: true,
					range: true,
                    isVisible: (options) => options.mode === 'Set'
				},
                {
                    type: 'number',
                    label: 'Brightness Delta:',
                    id: 'delta',
                    min: -25,
                    max: 25,
                    default: 10,
                    required: true,
                    range: true,
                    isVisible: (options) => options.mode === 'AddSub'
                },
			],
			callback: async (action) => {
				await self.runAction(action)
			},
		}

		this.setActionDefinitions(actions)
	},
	async runAction(action) {
		let self = this
		if (self.config.ip) {
			let lightObj = {}

			switch (action.actionId) {
				case 'power': {
                    if (action.options.bool === 'toggle') {
                        lightObj.on = 1 - this.data.status.power
                        break
                    }
					lightObj.on = action.options.bool === 'on' ? 1 : 0
					break
				}
				case 'colortemp': {
                    if (action.options.mode === 'Set') {
                        lightObj.temperature = parseInt(action.options.temp)
                        break;
                    }
                    let newTemp = getKelvin(this.data.status.temperature) + action.options.delta
                    if (newTemp > this.KELVIN_MAX) {
                        self.log('info', `Attempted to increase temperature beyond max value. Type: ${action.actionId}`)
                        return
                    }
                    if (newTemp < this.KELVIN_MIN) {
                        self.log('info', `Attempted to decrease temperature below max value. Type: ${action.actionId}`)
                        return
                    }
                    lightObj.temperature = getMired(newTemp)
                    break
				}
				case 'brightness': {
                    if (action.options.mode === 'Set') {
                        lightObj.brightness = parseInt(action.options.brightness)
                        break;
                    }
					lightObj.brightness = this.data.status.brightness + action.options.delta
					if (lightObj.brightness > this.BRIGHTNESS_MAX) {
						self.log('info', `Attempted to increase brightness beyond max value. Type: ${action.actionId}`)
						return
					}
					if (lightObj.brightness < this.BRIGHTNESS_MIN) {
						self.log('info', `Attempted to decrease brightness below max value. Type: ${action.actionId}`)
						return
					}
					break
				}
			}

			if (Object.keys(lightObj).length > 0) {
				let cmd = { lights: [lightObj] }
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
					const data = await got.put(this.getUrl(), options).json()
					self.updateStatus(InstanceStatus.Ok)
					this.updateVariables(data.lights[0])
				} catch (error) {
					this.log('error', `action error: ${JSON.stringify(error)}`)
					if (error !== null) {
						self.log('error', `Keylight Change Request Failed. Type: ${action.actionId}`)
						self.updateStatus(InstanceStatus.UnknownError, `Keylight Change Request Failed. Type: ${action.actionId}`)
					}
				}
			}
		}
	},
}
