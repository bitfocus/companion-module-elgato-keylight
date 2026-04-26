import {
	combineRgb,
	CompanionBooleanFeedbackDefinition,
	CompanionFeedbackDefinition,
	SomeCompanionFeedbackInputField,
} from '@companion-module/base'
import { ModuleStatusKey, normalizeTemperatureSelection, type TemperatureValueBounds } from './utils.js'
import { ModuleInstance } from './main.js'

export enum FeedbackId {
	on = 'on',
	brightness = 'brightness',
	temperature = 'temperature',
}

function getTemperatureValueBounds(self: ModuleInstance): TemperatureValueBounds {
	return {
		miredMin: self.MIRED_MIN,
		miredMax: self.MIRED_MAX,
		kelvinMin: self.KELVIN_MIN,
		kelvinMax: self.KELVIN_MAX,
		kelvinStep: self.KELVIN_STEP,
	}
}

function getComparableFeedbackValue(self: ModuleInstance, feedbackId: FeedbackId, value: unknown): number | null {
	if (feedbackId !== FeedbackId.temperature) {
		const parsedValue = Number(value)
		return Number.isFinite(parsedValue) ? parsedValue : null
	}

	return normalizeTemperatureSelection(value, getTemperatureValueBounds(self))
}

function getComparableLightValue(self: ModuleInstance, feedbackId: FeedbackId, value: number | null): number | null {
	if (feedbackId !== FeedbackId.temperature || value === null) {
		return value
	}

	return normalizeTemperatureSelection(value, getTemperatureValueBounds(self))
}

const FEEDBACK_STATUS_KEYS: Record<FeedbackId, ModuleStatusKey> = {
	[FeedbackId.on]: 'on',
	[FeedbackId.brightness]: 'brightness',
	[FeedbackId.temperature]: 'temperature',
}

export function UpdateFeedbacks(self: ModuleInstance): void {
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
		default: self.KELVIN_MAX,
		choices: self.KELVIN_LIST.map((kelvin) => ({ id: kelvin, label: `${kelvin}K` })),
	} satisfies SomeCompanionFeedbackInputField

	const buildValueFeedback = (
		name: string,
		description: string,
		options: SomeCompanionFeedbackInputField[],
	): CompanionBooleanFeedbackDefinition => ({
		type: 'boolean',
		name,
		description,
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
			textExpression: true,
		},
		showInvert: false,
		options,
		callback: (feedback) => {
			const feedbackId = feedback.feedbackId as FeedbackId
			const statusKey = FEEDBACK_STATUS_KEYS[feedbackId]
			if (!statusKey) {
				return false
			}

			const lightStatus = self.getLightStatus()
			if (!lightStatus) {
				return false
			}

			const currentValue = getComparableLightValue(self, feedbackId, lightStatus[statusKey])
			const feedbackValue = getComparableFeedbackValue(self, feedbackId, feedback.options[feedbackId])

			return feedbackValue !== null && currentValue === feedbackValue
		},
	})
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
		[FeedbackId.on]: buildValueFeedback(
			'Power Status',
			'When light power status changes, change the button text/colors',
			[selectPower],
		),
		[FeedbackId.brightness]: buildValueFeedback(
			'Brightness',
			'When light brightness changes, change the button text/colors',
			[selectBrightness],
		),
		[FeedbackId.temperature]: buildValueFeedback(
			'Color temperature',
			'When light color temperature changes, change the button text/colors',
			[selectTemperature],
		),
	}

	self.setFeedbackDefinitions(feedbacks)
}
