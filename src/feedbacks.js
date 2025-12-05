const { isFunction } = require('./utils')
const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks() {
		let self = this
		const feedbacks = {}

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
			type: 'boolean',
			name: 'Power Status',
			description: 'When light power status changes',
			options: [selectPower],
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

				return currentValue === feedbackValue;
			},
		}

		feedbacks.brightness = {
			type: 'boolean',
			name: 'Brightness',
			description: 'When light brightness changes',
			options: [selectBrightness],
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

				return currentValue === feedbackValue;
			},
		}

		feedbacks.temperature = {
			type: 'boolean',
			name: 'Color temperature',
			description: 'When light color temperature changes',
			options: [selectTemperature],
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

				return currentValue === feedbackValue;
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
