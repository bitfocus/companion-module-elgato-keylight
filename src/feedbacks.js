const { isFunction } = require('./utils')
const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks() {
		let self = this
		const feedbacks = {}

		const foregroundColor = {
			type: 'colorpicker',
			label: 'Foreground color',
			id: 'fg',
			default: combineRgb(255, 255, 255),
		}

		const backgroundColor = {
			type: 'colorpicker',
			label: 'Background color',
			id: 'bg',
			default: combineRgb(255, 0, 0),
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
			type: 'advanced',
			name: 'Power Status',
			description: 'When light power status changes, change colors of the bank',
			options: [selectPower, foregroundColor, backgroundColor],
			callback: (feedback) => {
				const variable =
					feedback.feedbackId === 'power' ? this.data.variables.on : this.data.variables[feedback.feedbackId]
				if (variable === undefined) {
					return
				}
				const currentValue = isFunction(variable.getValue)
					? variable.getValue(this.data.status[feedback.feedbackId])
					: this.data.status[feedback.feedbackId]
				const feedbackValue = isFunction(variable.getValue)
					? variable.getValue(feedback.options[feedback.feedbackId])
					: feedback.options[feedback.feedbackId]

				if (currentValue === feedbackValue) {
					return { color: feedback.options.fg, bgcolor: feedback.options.bg }
				}
			},
		}

		feedbacks.brightness = {
			type: 'advanced',
			name: 'Brightness',
			description: 'When light brightness changes, change colors of the bank',
			options: [selectBrightness, foregroundColor, backgroundColor],
			callback: (feedback) => {
				const variable =
					feedback.feedbackId === 'power' ? this.data.variables.on : this.data.variables[feedback.feedbackId]
				if (variable === undefined) {
					return
				}
				const currentValue = isFunction(variable.getValue)
					? variable.getValue(this.data.status[feedback.feedbackId])
					: this.data.status[feedback.feedbackId]
				const feedbackValue = isFunction(variable.getValue)
					? variable.getValue(feedback.options[feedback.feedbackId])
					: feedback.options[feedback.feedbackId]

				if (currentValue === feedbackValue) {
					return { color: feedback.options.fg, bgcolor: feedback.options.bg }
				}
			},
		}

		feedbacks.temperature = {
			type: 'advanced',
			name: 'Color temperature',
			description: 'When light color temperature changes, change colors of the bank',
			options: [selectTemperature, foregroundColor, backgroundColor],
			callback: (feedback) => {
				const variable =
					feedback.feedbackId === 'power' ? this.data.variables.on : this.data.variables[feedback.feedbackId]
				if (variable === undefined) {
					return
				}
				const currentValue = isFunction(variable.getValue)
					? variable.getValue(this.data.status[feedback.feedbackId])
					: this.data.status[feedback.feedbackId]
				const feedbackValue = isFunction(variable.getValue)
					? variable.getValue(feedback.options[feedback.feedbackId])
					: feedback.options[feedback.feedbackId]

				if (currentValue === feedbackValue) {
					return { color: feedback.options.fg, bgcolor: feedback.options.bg }
				}
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
