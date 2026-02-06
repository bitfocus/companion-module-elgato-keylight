import { InstanceStatus } from '@companion-module/base'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async'
import { got } from 'got-cjs'
import { ModuleInstance } from './main.js'
import { LightStatus } from './utils.js'

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
				const response = await got.get(GetUrl(self), {})
				const data = JSON.parse(response.body) as { lights: LightStatus[] }

				self.updateVariables(data.lights[0])
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
