const { getKelvin, getMired } = require('./utils')

module.exports = [
	function upgradeV1_2_0(context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		for (const action of props.actions) {
			if (action.actionId === 'colortemp') {
				const kelvin = getKelvin(parseInt(action.options.temp, 10))
				const mired = getMired(kelvin)

				if (action.options.temp !== mired) {
					action.options.temp = mired
					result.updatedActions.push(action)
				}
			}
		}

		return result
	},
]
