const { InstanceStatus } = require('@companion-module/base')
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async')
const { got } = require('got-cjs')
module.exports = {
	getUrl() {
		return `http://${this.config.ip}:9123/elgato/lights`
	},
	async initPolling() {
		if (this.data.interval) {
			this.log('info', 'stopping poll')
			await clearIntervalAsync(this.data.interval)
		}

		if (this.config.ip && this.config.polling) {
			this.data.interval = setIntervalAsync(async () => {
				try {
					await got.get(this.getUrl(), {}).then((res) => {
						const data = JSON.parse(res.body)

						this.updateVariables(data.lights[0])
						this.updateStatus(InstanceStatus.Ok)
					})
				} catch (error) {
					if (error !== null) {
						this.log('error', `HTTP GET Request failed (${error})`)
						this.updateStatus(InstanceStatus.UnknownError, error)
						return
					}
				}
			}, this.config.interval)
		}
	},
}
