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
			try {
				const lights: KeyLightOptions = await self.keyLightApi.getLights()
				self.updateVariables(lights)
				self.updateStatus(InstanceStatus.Ok)
			} catch (error) {
				if (error !== null) {
					const errorMessage =
						error instanceof Error ? error.message : error instanceof Error ? error.toString() : 'Unknown error'
					self.log('error', `HTTP GET Request failed (${errorMessage})`)
					self.updateStatus(InstanceStatus.UnknownError, errorMessage)
					return
				}
			}
		}, self.config.interval)
	}
}
