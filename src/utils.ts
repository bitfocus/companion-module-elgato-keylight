export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
	value !== undefined && typeof value === 'function'

export const mround = (value: number, precision: number): number => Math.round(value / precision) * precision

export const miredToKelvin = (mired: number): number => 1e6 / mired
export const kelvinToMired = (kelvin: number): number => 1e6 / kelvin

export const getKelvin = (mired: number): number => mround(miredToKelvin(mired), 50)
export const getMired = (kelvin: number): number => Math.round(kelvinToMired(kelvin))

export interface TemperatureValueBounds {
	miredMin: number
	miredMax: number
	kelvinMin: number
	kelvinMax: number
	kelvinStep: number
}

export const normalizeTemperatureSelection = (value: unknown, bounds: TemperatureValueBounds): number | null => {
	if (value === undefined || value === null) {
		return null
	}

	const stringValue = typeof value === 'string' ? value.trim() : value
	if (stringValue === '') {
		return null
	}

	const parsedValue =
		typeof stringValue === 'string' && stringValue.toUpperCase().endsWith('K')
			? Number.parseInt(stringValue, 10)
			: toNumber(stringValue)

	if (!Number.isFinite(parsedValue)) {
		return null
	}

	if (parsedValue >= bounds.miredMin && parsedValue <= bounds.miredMax) {
		return getKelvin(parsedValue)
	}

	if (parsedValue >= bounds.kelvinMin && parsedValue <= bounds.kelvinMax) {
		return mround(parsedValue, bounds.kelvinStep)
	}

	return null
}

export const formatTemperatureValue = (mired: number | null | undefined): string =>
	mired ? `${getKelvin(mired)}K` : '0K'

export interface LightStatus {
	on: number | null
	brightness: number
	temperature: number
}

export type ModuleStatusKey = keyof LightStatus

export const toNumber = (value: unknown): number => (typeof value === 'number' ? value : Number(value))

export interface ModuleConfig {
	ip: string
	polling: boolean
	interval: number
}
