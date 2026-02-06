const { isFunction } = require('./utils')
const { combineRgb } = require('@companion-module/base')

const updateFeedbacks = function (self) {
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
		choices: self.POWER_VALUES.map((label, index) => ({ id: index, label })),
	}

	const selectBrightness = {
		type: 'number',
		label: 'Brightness',
		id: 'brightness',
		min: self.BRIGHTNESS_MIN,
		max: self.BRIGHTNESS_MAX,
		default: 50,
	}

	const selectTemperature = {
		type: 'dropdown',
		label: 'Temperature in Kelvin',
		id: 'temperature',
		default: self.MIRED_MIN,
		choices: self.TEMP_CHOICES,
	}

	const buildValueFeedback = (name, description, options) => ({
		type: 'advanced',
		name,
		description,
		options,
		callback: (feedback) => {
			const variable =
				feedback.feedbackId === 'power' ? self.data.variables.on : self.data.variables[feedback.feedbackId]
			if (variable === undefined) {
				return
			}
			const currentValue = isFunction(variable.getValue)
				? variable.getValue(self.data.status[feedback.feedbackId])
				: self.data.status[feedback.feedbackId]
			const feedbackValue = isFunction(variable.getValue)
				? variable.getValue(feedback.options[feedback.feedbackId])
				: feedback.options[feedback.feedbackId]

			if (currentValue === feedbackValue) {
				return { color: feedback.options.fg, bgcolor: feedback.options.bg }
			}
		},
	})

	feedbacks.power = buildValueFeedback('Power Status', 'When light power status changes, change colors of the bank', [
		selectPower,
		foregroundColor,
		backgroundColor,
	])

	feedbacks.brightness = buildValueFeedback('Brightness', 'When light brightness changes, change colors of the bank', [
		selectBrightness,
		foregroundColor,
		backgroundColor,
	])

	feedbacks.temperature = buildValueFeedback(
		'Color temperature',
		'When light color temperature changes, change colors of the bank',
		[selectTemperature, foregroundColor, backgroundColor],
	)

	self.setFeedbackDefinitions(feedbacks)
}

module.exports = {
	updateFeedbacks,
}
