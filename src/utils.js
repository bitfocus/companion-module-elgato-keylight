const isFunction = (identifier) => identifier !== undefined && typeof identifier === 'function'

const mround = (value, precision) => Math.round(value / precision) * precision

const miredToKelvin = (mired) => 1e6 / mired
const kelvinToMired = (kelvin) => 1e6 / kelvin

const getKelvin = (mired) => mround(miredToKelvin(mired), 50)
const getMired = (kelvin) => Math.round(kelvinToMired(kelvin))

module.exports = {
	isFunction,
	mround,
	miredToKelvin,
	kelvinToMired,
	getKelvin,
	getMired,
}
