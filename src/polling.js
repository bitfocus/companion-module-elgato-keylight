const { InstanceStatus } = require('@companion-module/base')
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async')
const { got } = require('got-cjs')

module.exports = {
	getUrl() {
		return `http://${this.config.ip}:9123/elgato`
	},
	async initPolling() {
		if (this.data.interval) {
			this.log('info', 'stopping poll')
			await clearIntervalAsync(this.data.interval)
		}

		if (this.config.ip && this.config.polling) {
            let lastStatus = undefined;
			this.data.interval = setIntervalAsync(async () => {
                const light = got.get(this.getUrl() + '/lights', { retry: { limit: 10 } }).then((res) => {
                    const data = JSON.parse(res.body)

                    this.updateVariables(data.lights[0])
                    return true;
                }).catch((err) => {
                    if (err !== null) {
                        if (lastStatus !== "error") {
                            this.updateStatus(InstanceStatus.UnknownError, err);
                            lastStatus = "error";
                        }
                        this.log('error', `HTTP GET Request failed (${err})`);
                    }
                    return false;
                })
                const lightsSettings = got.get(this.getUrl() + '/lights/settings', { retry: { limit: 10 } }).then((res) => {
                    const data = JSON.parse(res.body)

                    this.updateVariables(data)
                    return true;
                }).catch((err) => {
                    if (err !== null) {
                        if (lastStatus !== "error") {
                            this.updateStatus(InstanceStatus.UnknownError, err);
                            lastStatus = "error";
                        }
                        this.log('error', `HTTP GET Request failed (${err})`);
                    }
                    return false;
                })
                const accessoryInfo = got.get(this.getUrl() + '/accessory-info', { retry: { limit: 10 } }).then((res) => {
                    const data = JSON.parse(res.body)

                    this.updateVariables(data)
                    return true;
                }).catch((err) => {
                    if (err !== null) {
                        if (lastStatus !== "error") {
                            this.updateStatus(InstanceStatus.UnknownError, err);
                            lastStatus = "error";
                        }
                        this.log('error', `HTTP GET Request failed (${err})`);
                    }
                    return false;
                })
                const success = await Promise.all([light, lightsSettings, accessoryInfo]).then((results) => results.every((res) => res));
                if (success) {
                    if (lastStatus !== "ok") {
                        this.updateStatus(InstanceStatus.Ok);
                        lastStatus = "ok";
                    }
                }
			}, this.config.interval)
		}
	},
}
