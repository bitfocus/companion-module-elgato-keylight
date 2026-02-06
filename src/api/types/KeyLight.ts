export interface KeyLight {
	ip: string
	port: number
	name?: string
	settings?: KeyLightSettings
	info?: KeyLightInfo
	options?: KeyLightOptions
}

export interface KeyLightSettings {
	powerOnBehavior: number
	powerOnBrightness: number
	powerOnTemperature: number
	switchOnDurationMs: number
	switchOffDurationMs: number
	colorChangeDurationMs: number
}

export interface KeyLightInfo {
	productName: string
	hardwareBoardType: number
	hardwareRevision: number
	macAddress: string
	firmwareBuildNumber: number
	firmwareVersion: string
	serialNumber: string
	displayName: string
	features: Array<string>
	'wifi-info': WifiInfo
}

export interface WifiInfo {
	ssid: string
	frequencyMHz: number
	rssi: number
}

export interface KeyLightStatus {
	on: number | null
	brightness: number
	temperature: number
}

export interface KeyLightOptions {
	numberOfLights?: number
	lights: Array<KeyLightStatus>
}
