import {
	combineRgb,
	type CompanionAdvancedFeedbackDefinition,
	type CompanionFeedbackDefinitions,
	type SomeCompanionFeedbackInputField,
	type CompanionFeedbackAdvancedEvent,
} from '@companion-module/base'
import { isFunction } from './utils.js'
import { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {}

	const foregroundColor = {
		type: 'colorpicker',
		label: 'Foreground color',
		id: 'fg',
		default: combineRgb(255, 255, 255),
	} satisfies SomeCompanionFeedbackInputField

	const backgroundColor = {
		type: 'colorpicker',
		label: 'Background color',
		id: 'bg',
		default: combineRgb(255, 0, 0),
	} satisfies SomeCompanionFeedbackInputField

	const selectPower = {
		type: 'dropdown',
		label: 'Power Status',
		id: 'on',
		default: 1,
		choices: self.POWER_VALUES.map((label, index) => ({ id: index, label })),
	} satisfies SomeCompanionFeedbackInputField

	const selectBrightness = {
		type: 'number',
		label: 'Brightness',
		id: 'brightness',
		min: self.BRIGHTNESS_MIN,
		max: self.BRIGHTNESS_MAX,
		default: 50,
	} satisfies SomeCompanionFeedbackInputField

	const selectTemperature = {
		type: 'dropdown',
		label: 'Temperature in Kelvin',
		id: 'temperature',
		default: self.MIRED_MIN,
		choices: self.TEMP_CHOICES,
	} satisfies SomeCompanionFeedbackInputField

	const buildValueFeedback = (
		name: string,
		description: string,
		options: SomeCompanionFeedbackInputField[],
	): CompanionAdvancedFeedbackDefinition => ({
		type: 'advanced',
		name,
		description,
		options,
		callback: (feedback: CompanionFeedbackAdvancedEvent) => {
			const variable = feedback.feedbackId === 'on' ? self.data.variables.on : self.data.variables[feedback.feedbackId]
			if (!variable) {
				return {}
			}

			const statusKey = variable.variableId
			const currentValue = isFunction(variable.getValue)
				? variable.getValue(self.data.status[statusKey])
				: self.data.status[statusKey]
			const optionValue = feedback.options[feedback.feedbackId]
			const feedbackValue = isFunction(variable.getValue) ? variable.getValue(Number(optionValue)) : optionValue

			if (currentValue === feedbackValue) {
				const fgValue = feedback.options.fg
				const bgValue = feedback.options.bg
				return { color: Number(fgValue), bgcolor: Number(bgValue) }
			}
			return {}
		},
	})

	feedbacks.on = buildValueFeedback('Power Status', 'When light power status changes, change colors of the bank', [
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
