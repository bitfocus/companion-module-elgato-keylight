const { isFunction, getKelvin } = require('./utils')

module.exports = {
	updateVariableDefinitions() {
		this.data.variables = {}

		if (!this.config.polling) {
			this.setVariableDefinitions([])
			return
		}

		this.data.variables.on = {
			name: 'Light Power Status',
			variableId: 'power',
			getValue: (value) => this.POWER_VALUES[value],
		}

		this.data.variables.brightness = {
			name: 'Light Brightness',
			variableId: 'brightness',
			getValue: (value) => Number(value),
		}

		this.data.variables.temperature = {
			name: 'Light Temperature',
			variableId: 'temperature',
			getValue: (value) => `${getKelvin(value)}K`,
		}

		this.setVariableDefinitions(
			Object.keys(this.data.variables).map((name) => ({
				name: this.data.variables[name].name,
				variableId: this.data.variables[name].variableId,
			}))
		)
	},
	updateVariables(status) {
		Object.keys(this.data.variables).forEach((id) => {
			const variables = {}
			const value = status[id]
			const name = this.data.variables[id].variableId

			if (this.data.status[name] !== value) {
				this.data.status[name] = value
				if (isFunction(this.data.variables[id].getValue)) {
					variables[name] = this.data.variables[id].getValue(value)
				} else {
					variables[name] = value
				}
				this.setVariableValues(variables)
				this.checkFeedbacks(name)
			}
		})
	},
}
