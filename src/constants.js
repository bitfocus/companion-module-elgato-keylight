const { getMired } = require('./utils')

module.exports = {
	initConstants() {
		this.defineConst('INTERVAL_MIN', 250)
		this.defineConst('INTERVAL_DEFAULT', 500)

		this.defineConst('POWER_VALUES', ['OFF', 'ON'])

		this.defineConst('MIRED_MIN', 143)
		this.defineConst('MIRED_MAX', 344)

		this.defineConst('BRIGHTNESS_MIN', 3)
		this.defineConst('BRIGHTNESS_MAX', 100)

		this.defineConst('KELVIN_MAX', 7000)
		this.defineConst('KELVIN_MIN', 2900)
		this.defineConst('KELVIN_STEP', 50)

		this.defineConst(
			'KELVIN_LIST',
			Array.from(Array((this.KELVIN_MAX - this.KELVIN_MIN) / this.KELVIN_STEP + 1).keys())
				.map((n) => (n + this.KELVIN_MIN / this.KELVIN_STEP) * this.KELVIN_STEP)
				.reverse()
		)

		this.defineConst(
			'TEMP_CHOICES',
			this.KELVIN_LIST.map((kelvin) => ({
				id: getMired(kelvin),
				label: `${kelvin}K`,
			}))
		)
	},
}
