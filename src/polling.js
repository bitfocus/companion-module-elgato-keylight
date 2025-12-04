const { InstanceStatus } = require('@companion-module/base')
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async')
const { got } = require('got-cjs')

let lastStatus = undefined;
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
                await got.get(this.getUrl(), { retry: { limit: 10 } }).then((res) => {
                    const data = JSON.parse(res.body)

                    this.updateVariables(data.lights[0])
                    if (lastStatus !== "ok") {
                        this.updateStatus(InstanceStatus.Ok);
                        lastStatus = "ok";
                    }
                }).catch((err) => {
                    if (err !== null) {
                        if (lastStatus !== "error") {
                            this.updateStatus(InstanceStatus.UnknownError, err);
                            lastStatus = "error";
                        }
                        this.log('error', `HTTP GET Request failed (${err})`);
                    }
                })
			}, this.config.interval)
		}
	},
}
