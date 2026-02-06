export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
	value !== undefined && typeof value === 'function'

export const mround = (value: number, precision: number): number => Math.round(value / precision) * precision

export const miredToKelvin = (mired: number): number => 1e6 / mired
export const kelvinToMired = (kelvin: number): number => 1e6 / kelvin

export const getKelvin = (mired: number): number => mround(miredToKelvin(mired), 50)
export const getMired = (kelvin: number): number => Math.round(kelvinToMired(kelvin))

export interface LightStatus {
	on: number | null
	brightness: number
	temperature: number
}

export type ModuleStatusKey = keyof LightStatus

export interface VariableEntry {
	name: string
	variableId: ModuleStatusKey
	getValue?: (value: number) => string | number
}

export type VariableMap = Record<string, VariableEntry>

export const toNumber = (value: unknown): number => (typeof value === 'number' ? value : Number(value))

export interface ModuleConfig {
	ip: string
	polling: boolean
	interval: number
}
