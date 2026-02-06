import type { CompanionStaticUpgradeResult, CompanionStaticUpgradeScript } from '@companion-module/base'
import { getKelvin, getMired } from './utils.js'
import { ModuleConfig } from './utils.js'

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

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [upgradeV1_2_0]
