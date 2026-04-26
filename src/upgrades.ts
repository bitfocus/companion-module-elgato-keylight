import {
	CreateConvertToBooleanFeedbackUpgradeScript,
	type CompanionStaticUpgradeResult,
	type CompanionStaticUpgradeScript,
} from '@companion-module/base'
import { getKelvin, getMired, normalizeTemperatureSelection, type TemperatureValueBounds } from './utils.js'
import { ModuleConfig } from './utils.js'

const temperatureValueBounds: TemperatureValueBounds = {
	miredMin: 143,
	miredMax: 344,
	kelvinMin: 2900,
	kelvinMax: 7000,
	kelvinStep: 50,
}

const upgradeV1_2_0: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	const result: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.actionId === 'colortemp') {
			const tempValue = Number.parseInt(String(action.options.temp), 10)
			const kelvin = getKelvin(tempValue)
			const mired = getMired(kelvin)

			if (action.options.temp !== mired) {
				action.options.temp = mired
				result.updatedActions.push(action)
			}
		}
	}

	return result
}

const upgradeV1_3_0: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	const result: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId !== 'temperature') {
			continue
		}

		const normalizedTemperature = normalizeTemperatureSelection(feedback.options.temperature, temperatureValueBounds)
		if (normalizedTemperature !== null && feedback.options.temperature !== normalizedTemperature) {
			feedback.options.temperature = normalizedTemperature
			result.updatedFeedbacks.push(feedback)
		}
	}

	return result
}

const upgradeBooleanFeedbackStyles = CreateConvertToBooleanFeedbackUpgradeScript<ModuleConfig>({
	on: {
		fg: 'color',
		bg: 'bgcolor',
	},
	brightness: {
		fg: 'color',
		bg: 'bgcolor',
	},
	temperature: {
		fg: 'color',
		bg: 'bgcolor',
	},
})

const upgradeV1_4_0: CompanionStaticUpgradeScript<ModuleConfig> = (context, props) => {
	const result = upgradeBooleanFeedbackStyles(context, props)
	const markUpdated = (feedback: (typeof props.feedbacks)[number]) => {
		if (!result.updatedFeedbacks.includes(feedback)) {
			result.updatedFeedbacks.push(feedback)
		}
	}

	for (const feedback of props.feedbacks) {
		if (!BOOLEAN_FEEDBACK_IDS.has(feedback.feedbackId)) {
			continue
		}

		const legacyText = feedback.options.text
		if (legacyText === undefined) {
			continue
		}

		delete feedback.options.text
		markUpdated(feedback)

		if (typeof legacyText !== 'string' || legacyText === '') {
			continue
		}

		if (!feedback.style) {
			feedback.style = {}
		}

		feedback.style.text = legacyText
		markUpdated(feedback)
	}

	return result
}

const BOOLEAN_FEEDBACK_IDS = new Set(['on', 'brightness', 'temperature'])

const upgradeV1_4_1: CompanionStaticUpgradeScript<ModuleConfig> = (_context, props) => {
	const result: CompanionStaticUpgradeResult<ModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const feedback of props.feedbacks) {
		if (
			!BOOLEAN_FEEDBACK_IDS.has(feedback.feedbackId) ||
			feedback.style?.text === undefined ||
			feedback.style.text === ''
		) {
			continue
		}

		if (feedback.style.textExpression !== true) {
			feedback.style.textExpression = true
			result.updatedFeedbacks.push(feedback)
		}
	}

	return result
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	upgradeV1_2_0,
	upgradeV1_3_0,
	upgradeV1_4_0,
	upgradeV1_4_1,
]
