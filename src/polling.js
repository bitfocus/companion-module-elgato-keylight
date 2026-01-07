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

                    this.updateVariables({
                        on: data.lights[0].on !== undefined ? data.lights[0].on : null,
                        brightness: data.lights[0].brightness !== undefined ? data.lights[0].brightness : null,
                        temperature: data.lights[0].temperature !== undefined ? data.lights[0].temperature : null,
                    })
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
                    this.updateVariables({
                        productName: null,
                        macAddress: null,
                        firmwareVersion: null,
                        serialNumber: null,
                        displayName: null,
                        'wifi-info': {
                            ssid: null,
                            frequencyMHz: null,
                            rssi: null,
                        }
                    })
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
                    this.updateVariables({
                        powerOnBehavior: null,
                        powerOnBrightness: null,
                        powerOnTemperature: null,
                        switchOnDurationMs: null,
                        switchOffDurationMs: null,
                        colorChangeDurationMs: null,
                    })
                    if (err !== null) {
                        if (lastStatus !== "error") {
                            this.updateStatus(InstanceStatus.UnknownError, err);
                            lastStatus = "error";
                        }
                        this.log('error', `HTTP GET Request failed (${err})`);
                    }
                    return false;
                })
                got.get(this.getUrl() + '/battery-info', { retry: { limit: 10 } }).then((res) => {
                    const data = JSON.parse(res.body)

                    this.updateVariables(data)
                }).catch(() => {
                    this.updateVariables({
                        powerSource: null,
                        level: null,
                        status: null,
                        currentBatteryVoltage: null,
                        inputChargeVoltage: null,
                        inputChargeCurrent: null
                    })
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
