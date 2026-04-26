import { InstanceStatus } from '@companion-module/base'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async'
import { ModuleInstance } from './main.js'
import { KeyLightOptions } from './api/types/KeyLight.js'

export function GetUrl(self: ModuleInstance): string {
	return `http://${self.config.ip}:9123/elgato/lights`
}

export async function InitPolling(self: ModuleInstance): Promise<void> {
	if (self.data.interval) {
		self.log('info', 'stopping poll')
		await clearIntervalAsync(self.data.interval)
		self.data.interval = null
	}

	if (self.config.ip && self.config.polling) {
		self.data.interval = setIntervalAsync(async () => {
			let successCount = 0

			// Get Light Options
			try {
				const lights: KeyLightOptions = await self.keyLightApi.getLights()
				self.data.keylight.options = lights
				if (lights.lights[0]) {
					self.markLightStatusUpdated()
				} else {
					self.invalidateLightStatus()
				}
				successCount++
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
				self.log('error', `getLights failed (${errorMessage})`)
				// Set to default values
				self.data.keylight.options = {
					numberOfLights: 0,
					lights: [
						{
							on: 0,
							brightness: 0,
							temperature: 0,
						},
					],
				}
				self.invalidateLightStatus()
			}

			// Get Accessory Info
			try {
				const info = await self.keyLightApi.getAccessoryInfo()
				self.data.keylight.info = info
				successCount++
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
				self.log('error', `getAccessoryInfo failed (${errorMessage})`)
				// Set to default values
				self.data.keylight.info = {
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
				}
			}

			// Get Settings
			try {
				const settings = await self.keyLightApi.getSettings()
				self.data.keylight.settings = settings
				successCount++
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
				self.log('error', `getSettings failed (${errorMessage})`)
				// Set to default values
				self.data.keylight.settings = {
					powerOnBehavior: 0,
					powerOnBrightness: 0,
					powerOnTemperature: 0,
					switchOnDurationMs: 0,
					switchOffDurationMs: 0,
					colorChangeDurationMs: 0,
				}
			}

			// Update variables with either real or default values
			self.updateVariables()

			// Update status based on success
			if (self.isLightStatusFresh()) {
				self.updateStatus(InstanceStatus.Ok)
			} else if (successCount > 0) {
				self.updateStatus(InstanceStatus.UnknownWarning, 'Light state unavailable')
			} else {
				self.updateStatus(InstanceStatus.ConnectionFailure, 'Unable to reach Key Light')
			}
		}, self.config.interval)

		return
	}

	self.invalidateLightStatus()
	self.updateVariables()
}
