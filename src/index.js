const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const polling = require('./polling')
const actions = require('./actions')
const variables = require('./variables')
const feedbacks = require('./feedbacks')
const configFields = require('./configFields')
const upgradeScripts = require('./upgrades')
const { getMired } = require('./utils')

class ElgatoKeylightInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		Object.assign(this, {
			...configFields,
			...actions,
			...variables,
			...feedbacks,
			...polling,
		})

		this.data = {
			status: {
				power: null,
				brightness: 0,
				temperature: 0,
			},
			interval: null,
			variables: {},
		}

		this.INTERVAL_MIN = 250
		this.INTERVAL_DEFAULT = 500

		this.POWER_VALUES = ['OFF', 'ON']

		this.MIRED_MIN = 143
		this.MIRED_MAX = 344

		this.BRIGHTNESS_MIN = 3
		this.BRIGHTNESS_MAX = 100

		this.KELVIN_MAX = 7000
		this.KELVIN_MIN = 2900
		this.KELVIN_STEP = 50

		this.KELVIN_LIST = Array.from(Array((this.KELVIN_MAX - this.KELVIN_MIN) / this.KELVIN_STEP + 1).keys())
			.map((n) => (n + this.KELVIN_MIN / this.KELVIN_STEP) * this.KELVIN_STEP)
			.reverse()

		this.TEMP_CHOICES = this.KELVIN_LIST.map((kelvin) => ({
			id: getMired(kelvin),
			label: `${kelvin}K`,
		}))
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting)
		this.configUpdated(config)
	}

	async destroy() {
		this.log('info', 'destroying')
		if (this.data.interval) {
			clearInterval(this.data.interval)
		}
		this.log('debug', 'destroyed')
		this.debug('info', this.id)
	}

	async configUpdated(config) {
		this.log('info', 'config updating')
		if (config) {
			this.config = config
		}

		this.updateVariableDefinitions()
		this.initActions()
		this.initFeedbacks()

		this.initPolling()
		this.updateStatus(InstanceStatus.Ok)
	}
}

runEntrypoint(ElgatoKeylightInstance, [upgradeScripts.upgradeV1_2_0])
