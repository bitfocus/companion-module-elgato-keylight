import { InstanceStatus, CompanionActionEvent, CompanionActionDefinition } from '@companion-module/base'
import { getKelvin, getMired, toNumber } from './utils.js'
import { ModuleInstance } from './main.js'
import { KeyLightOptions, KeyLightStatus } from './api/types/KeyLight.js'

export enum ActionId {
	on = 'on',
	powercycle = 'powercycle',
	colortemp = 'colortemp',
	colortempchange = 'colortempchange',
	brightness = 'brightness',
	brightnesschange = 'brightnesschange',
}

export function SetActionDefinitions(self: ModuleInstance): void {
	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.on]: {
			name: 'Power',
			description: 'Tuirn the lights on or off',
			options: [
				{
					type: 'dropdown',
					label: 'Set Power To:',
					id: 'bool',
					choices: [
						{ id: 'off', label: 'off' },
						{ id: 'on', label: 'on' },
					],
					default: 'off',
				},
			],
			callback: async (action) => {
				await RunAction(self, action)
			},
		},

		[ActionId.powercycle]: {
			name: 'Power Cycle',
			description: 'Toggle the power state of the light',
			options: [],
			callback: async (action) => {
				await RunAction(self, action)
			},
		},

		[ActionId.colortemp]: {
			name: 'Color Temperature',
			description: 'Set the color temperature in Kelvin',
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
				await RunAction(self, action)
			},
		},

		[ActionId.colortempchange]: {
			name: 'Increase/Decrease Color Temperature (-200 to +200)',
			description: 'Adjust the color temperature by a specified delta value',
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
				await RunAction(self, action)
			},
		},

		[ActionId.brightness]: {
			name: 'Brightness',
			description: 'Set the brightness (3-100)',
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
				await RunAction(self, action)
			},
		},

		[ActionId.brightnesschange]: {
			name: 'Increase/Decrease Brightness (-25 to +25)',
			description: 'Adjust the brightness by a specified delta value',
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
				await RunAction(self, action)
			},
		},
	}

	self.setActionDefinitions(actions)
}

function getFreshLightStatus(self: ModuleInstance, actionId: string): KeyLightStatus | undefined {
	const lightStatus = self.getLightStatus()
	if (!lightStatus) {
		const message = `Cannot run ${actionId} without fresh light state`
		self.log('warn', message)
		self.updateStatus(InstanceStatus.UnknownWarning, message)
	}

	return lightStatus
}

export async function RunAction(self: ModuleInstance, action: CompanionActionEvent): Promise<void> {
	if (!self.config.ip) {
		return
	}

	const lightObj: Partial<KeyLightStatus> = {}

	switch (action.actionId) {
		case ActionId.on.toString(): {
			const boolValue = action.options.bool
			lightObj.on = boolValue === 'on' ? 1 : 0
			break
		}
		case ActionId.powercycle.toString(): {
			const lightStatus = getFreshLightStatus(self, action.actionId)
			if (!lightStatus) {
				return
			}
			lightObj.on = 1 - lightStatus.on
			break
		}
		case ActionId.colortemp.toString(): {
			const tempValue = Number.parseInt(String(action.options.temp), 10)
			lightObj.temperature = tempValue
			break
		}
		case ActionId.colortempchange.toString(): {
			const lightStatus = getFreshLightStatus(self, action.actionId)
			if (!lightStatus) {
				return
			}
			const delta = toNumber(action.options.delta)
			const newTemp = getKelvin(lightStatus.temperature) + delta
			if (newTemp > self.KELVIN_MAX) {
				self.log('info', `Attempted to increase temperature beyond max value. Type: ${action.actionId}`)
				return
			}
			if (newTemp < self.KELVIN_MIN) {
				self.log('info', `Attempted to decrease temperature below min value. Type: ${action.actionId}`)
				return
			}
			lightObj.temperature = getMired(newTemp)
			break
		}
		case ActionId.brightnesschange.toString(): {
			const lightStatus = getFreshLightStatus(self, action.actionId)
			if (!lightStatus) {
				return
			}
			const delta = toNumber(action.options.delta)
			lightObj.brightness = lightStatus.brightness + delta
			if (lightObj.brightness > self.BRIGHTNESS_MAX) {
				self.log('info', `Attempted to increase brightness beyond max value. Type: ${action.actionId}`)
				return
			}
			if (lightObj.brightness < self.BRIGHTNESS_MIN) {
				self.log('info', `Attempted to decrease brightness below min value. Type: ${action.actionId}`)
				return
			}
			break
		}
		case ActionId.brightness.toString(): {
			const brightnessValue = Number.parseInt(String(action.options.brightness), 10)
			lightObj.brightness = brightnessValue
			break
		}
	}

	if (Object.keys(lightObj).length > 0) {
		try {
			const keyLightOptions: KeyLightOptions = {
				lights: [lightObj as KeyLightStatus],
			}
			const data = await self.keyLightApi.updateLightOptions(keyLightOptions)
			self.data.keylight.options = data
			if (data.lights[0]) {
				self.markLightStatusUpdated()
			} else {
				self.invalidateLightStatus()
			}
			self.updateStatus(InstanceStatus.Ok)
			self.updateVariables()
		} catch (error) {
			self.invalidateLightStatus()
			self.updateVariables()
			self.log(
				'error',
				`Error updating light options: ${JSON.stringify(lightObj)}. Type: ${action.actionId}. Error: ${JSON.stringify}`,
			)
			const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
			self.log('error', `action error: ${errorMessage}`)
			if (error !== null) {
				self.log('error', `Keylight Change Request Failed. Type: ${action.actionId}`)
				self.updateStatus(InstanceStatus.UnknownError, `Keylight Change Request Failed. Type: ${action.actionId}`)
			}
		}
	}
}
