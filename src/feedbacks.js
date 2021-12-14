const { isFunction } = require('./utils')

module.exports = {
	initFeedbacks() {
		const feedbacks = {}

		const foregroundColor = {
			type: 'colorpicker',
			label: 'Foreground color',
			id: 'fg',
			default: this.rgb(255, 255, 255),
		}

		const backgroundColor = {
			type: 'colorpicker',
			label: 'Background color',
			id: 'bg',
			default: this.rgb(255, 0, 0),
		}

		const selectPower = {
			type: 'dropdown',
			label: 'Power Status',
			id: 'power',
			default: 1,
			choices: this.POWER_VALUES.map((label, index) => ({ id: index, label })),
		}

		const selectBrightness = {
			type: 'number',
			label: 'Brightness',
			id: 'brightness',
			min: this.BRIGHTNESS_MIN,
			max: this.BRIGHTNESS_MAX,
			default: 50,
		}

		const selectTemperature = {
			type: 'dropdown',
			label: 'Temperature in Kelvin',
			id: 'temperature',
			default: this.MIRED_MIN,
			choices: this.TEMP_CHOICES,
		}

		feedbacks.power = {
			label: 'Power Status',
			description: 'When light power status changes, change colors of the bank',
			options: [selectPower, foregroundColor, backgroundColor],
		}

		feedbacks.brightness = {
			label: 'Brightness',
			description: 'When light brightness changes, change colors of the bank',
			options: [selectBrightness, foregroundColor, backgroundColor],
		}

		feedbacks.temperature = {
			label: 'Color temperature',
			description: 'When light color temperature changes, change colors of the bank',
			options: [selectTemperature, foregroundColor, backgroundColor],
		}

		this.setFeedbackDefinitions(feedbacks)
	},

	feedback(feedback) {
		const variable = feedback.type === 'power' ? this.data.variables.on : this.data.variables[feedback.type]
		const currentValue = isFunction(variable.getValue)
			? variable.getValue(this.data.status[feedback.type])
			: this.data.status[feedback.type]
		const feedbackValue = isFunction(variable.getValue)
			? variable.getValue(feedback.options[feedback.type])
			: feedback.options[feedback.type]

		if (currentValue === feedbackValue) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg }
		}
	},
}
