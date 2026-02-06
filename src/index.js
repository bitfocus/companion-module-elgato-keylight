const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const Actions = require('./actions')
const ConfigFields = require('./configFields')
const Feedbacks = require('./feedbacks')
const Polling = require('./polling')
const UpgradeScripts = require('./upgrades')
const Variables = require('./variables')
const { getMired } = require('./utils')

class ElgatoKeylightInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

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
		this.config = config
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

		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		await this.initPolling()
		this.updateStatus(InstanceStatus.Ok)
	}

	getConfigFields() {
		return ConfigFields.getConfigFields(this)
	}

	updateActions() {
		Actions.updateActions(this)
	}

	updateFeedbacks() {
		Feedbacks.updateFeedbacks(this)
	}

	updateVariableDefinitions() {
		Variables.updateVariableDefinitions(this)
	}

	updateVariables(status) {
		Variables.updateVariables(this, status)
	}

	getUrl() {
		return Polling.getUrl(this)
	}

	async initPolling() {
		await Polling.initPolling(this)
	}

	async runAction(action) {
		await Actions.runAction(this, action)
	}
}

runEntrypoint(ElgatoKeylightInstance, UpgradeScripts)
