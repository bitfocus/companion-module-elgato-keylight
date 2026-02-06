const { InstanceStatus } = require('@companion-module/base')
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async')
const { got } = require('got-cjs')

const getUrl = function (self) {
	return `http://${self.config.ip}:9123/elgato/lights`
}

const initPolling = async function (self) {
	if (self.data.interval) {
		self.log('info', 'stopping poll')
		await clearIntervalAsync(self.data.interval)
	}

	if (self.config.ip && self.config.polling) {
		self.data.interval = setIntervalAsync(async () => {
			try {
				await got.get(getUrl(self), {}).then((res) => {
					const data = JSON.parse(res.body)

					self.updateVariables(data.lights[0])
					self.updateStatus(InstanceStatus.Ok)
				})
			} catch (error) {
				if (error !== null) {
					self.log('error', `HTTP GET Request failed (${error})`)
					self.updateStatus(InstanceStatus.UnknownError, error)
					return
				}
			}
		}, self.config.interval)
	}
}

module.exports = {
	getUrl,
	initPolling,
}
