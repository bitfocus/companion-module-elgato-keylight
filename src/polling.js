module.exports = {
	getUrl() {
		return `http://${this.config.ip}:9123/elgato/lights`
	},

	initPolling() {
		if (this.data.interval) {
			clearInterval(this.data.interval)
		}

		if (this.config.ip && this.config.polling) {
			this.data.interval = setInterval(() => {
				this.system.emit('rest_get', this.getUrl(), (err, result) => {
					if (err !== null) {
						this.log('error', `HTTP GET Request failed (${result.error.code})`)
						this.status(this.STATUS_ERROR, result.error.code)
						return
					}
					this.updateVariables(result.data.lights[0])
					this.status(this.STATUS_OK)
				})
			}, this.config.interval)
		}
	},
}
