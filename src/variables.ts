import { KeyLightOptions } from './api/types/KeyLight.js'
import { ModuleInstance } from './main.js'
import { getKelvin, isFunction } from './utils.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.data.variables = {}

	if (!self.config.polling) {
		self.setVariableDefinitions([])
		return
	}

	self.data.variables.on = {
		name: 'Light Power Status',
		variableId: 'on',
		getValue: (value) => self.POWER_VALUES[value],
	}

	self.data.variables.brightness = {
		name: 'Light Brightness',
		variableId: 'brightness',
		getValue: (value) => Number(value),
	}

	self.data.variables.temperature = {
		name: 'Light Temperature',
		variableId: 'temperature',
		getValue: (value) => `${getKelvin(value)}K`,
	}

	self.setVariableDefinitions(
		Object.keys(self.data.variables).map((name) => ({
			name: self.data.variables[name].name,
			variableId: self.data.variables[name].variableId,
		})),
	)
}

export function UpdateVariables(self: ModuleInstance, lights: KeyLightOptions): void {
	for (const id of Object.keys(self.data.variables)) {
		const variable = self.data.variables[id]
		if (!variable) {
			continue
		}

		const value = lights.lights[0][id as keyof KeyLightOptions['lights'][0]]
		if (value === undefined || value === null) {
			continue
		}

		const name = variable.variableId
		if (self.data.status[name] !== value) {
			self.data.status[name] = value
			const variables: Record<string, string | number> = {}
			if (isFunction(variable.getValue)) {
				variables[name] = variable.getValue(value)
			} else {
				variables[name] = value
			}
			self.setVariableValues(variables)
			self.checkFeedbacks(name)
		}
	}
}
