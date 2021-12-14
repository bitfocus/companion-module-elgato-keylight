const { isFunction, getKelvin } = require('./utils')

module.exports = {
	updateVariableDefinitions() {
		this.data.variables = {}

		if (!this.config.polling) {
			this.setVariableDefinitions([])
			return
		}

		this.data.variables.on = {
			label: 'Light Power Status',
			name: 'power',
			getValue: (value) => this.POWER_VALUES[value],
		}

		this.data.variables.brightness = {
			label: 'Light Brightness',
			name: 'brightness',
			getValue: (value) => Number(value),
		}

		this.data.variables.temperature = {
			label: 'Light Temperature',
			name: 'temperature',
			getValue: (value) => `${getKelvin(value)}K`,
		}

		this.setVariableDefinitions(
			Object.keys(this.data.variables).map((name) => ({
				label: this.data.variables[name].label,
				name: this.data.variables[name].name,
			}))
		)
	},

	updateVariables(status) {
		Object.keys(this.data.variables).forEach((id) => {
			const value = status[id]
			const name = this.data.variables[id].name

			if (this.data.status[name] !== value) {
				this.data.status[name] = value
				if (isFunction(this.data.variables[id].getValue)) {
					this.setVariable(name, this.data.variables[id].getValue(value))
				} else {
					this.setVariable(name, value)
				}
				this.checkFeedbacks(name)
			}
		})
	},
}
