import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { clearIntervalAsync, type SetIntervalAsyncTimer } from 'set-interval-async'
import { SetActionDefinitions } from './actions.js'
import { GetConfigFields } from './config.js'
import { type ModuleConfig } from './utils.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { GetUrl, InitPolling } from './polling.js'
import { UpgradeScripts } from './upgrades.js'
import { getMired, VariableMap } from './utils.js'
import { UpdateVariableDefinitions, UpdateVariables } from './variables.js'
import { ElgatoKeylightApi } from './api/ElgatoKeyLightApi.js'
import { KeyLight } from './api/types/KeyLight.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	keyLightApi!: ElgatoKeylightApi
	port = 9123
	data: {
		keylight: KeyLight
		interval: SetIntervalAsyncTimer<[]> | null
		variables: VariableMap
	}

	INTERVAL_MIN = 250
	INTERVAL_DEFAULT = 500

	POWER_VALUES = ['OFF', 'ON'] as const

	MIRED_MIN = 143
	MIRED_MAX = 344

	BRIGHTNESS_MIN = 3
	BRIGHTNESS_MAX = 100

	KELVIN_MAX = 7000
	KELVIN_MIN = 2900
	KELVIN_STEP = 50

	KELVIN_LIST: number[]
	TEMP_CHOICES: Array<{ id: number; label: string }>

	constructor(internal: unknown) {
		super(internal)

		this.data = {
			keylight: {
				ip: '',
				port: 0,
				name: '',
				settings: {
					powerOnBehavior: 0,
					powerOnBrightness: 0,
					powerOnTemperature: 0,
					switchOnDurationMs: 0,
					switchOffDurationMs: 0,
					colorChangeDurationMs: 0,
				},
				info: {
					productName: '',
					hardwareBoardType: 0,
					hardwareRevision: 0,
					macAddress: '',
					firmwareBuildNumber: 0,
					firmwareVersion: '',
					serialNumber: '',
					displayName: '',
					features: ['lights'],
					'wifi-info': {
						ssid: '',
						frequencyMHz: 0,
						rssi: 0,
					},
				},
				options: {
					numberOfLights: 0,
					lights: [
						{
							on: 0,
							brightness: 0,
							temperature: 0,
						},
					],
				},
			},
			interval: null,
			variables: {},
		}

		this.KELVIN_LIST = Array.from(Array((this.KELVIN_MAX - this.KELVIN_MIN) / this.KELVIN_STEP + 1).keys()).map(
			(n) => (n + this.KELVIN_MIN / this.KELVIN_STEP) * this.KELVIN_STEP,
		)
		this.KELVIN_LIST.reverse()

		this.TEMP_CHOICES = this.KELVIN_LIST.map((kelvin) => ({
			id: getMired(kelvin),
			label: `${kelvin}K`,
		}))
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		await this.configUpdated(config)
	}

	async destroy(): Promise<void> {
		this.log('info', 'destroying')
		if (this.data.interval) {
			await clearIntervalAsync(this.data.interval)
			this.data.interval = null
		}
		this.log('debug', 'destroyed')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.log('info', 'config updating')
		if (config) {
			this.config = config
		}

		this.data.keylight.ip = this.config.ip
		this.data.keylight.port = this.port

		this.keyLightApi = new ElgatoKeylightApi(this.config.ip, this.port)
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		await this.initPolling()
		this.updateStatus(InstanceStatus.Ok)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields(this)
	}

	updateActions(): void {
		SetActionDefinitions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updateVariables(): void {
		UpdateVariables(this)
	}

	getUrl(): string {
		return GetUrl(this)
	}

	async initPolling(): Promise<void> {
		await InitPolling(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
