const { isFunction, getKelvin } = require('./utils')

const updateVariableDefinitions = function (self) {
	self.data.variables = {}

	if (!self.config.polling) {
		self.setVariableDefinitions([])
		return
	}

	self.data.variables.on = {
		name: 'Light Power Status',
		variableId: 'power',
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

const updateVariables = function (self, status) {
	Object.keys(self.data.variables).forEach((id) => {
		const variables = {}
		const value = status[id]
		const name = self.data.variables[id].variableId

		if (self.data.status[name] !== value) {
			self.data.status[name] = value
			if (isFunction(self.data.variables[id].getValue)) {
				variables[name] = self.data.variables[id].getValue(value)
			} else {
				variables[name] = value
			}
			self.setVariableValues(variables)
			self.checkFeedbacks(name)
		}
	})
}

module.exports = {
	updateVariableDefinitions,
	updateVariables,
}
