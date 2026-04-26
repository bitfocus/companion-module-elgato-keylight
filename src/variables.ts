import { ModuleInstance } from './main.js'
import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { formatTemperatureValue } from './utils.js'

export enum VariableId {
	lightIp = 'light.ip',
	lightPort = 'light.port',
	lightName = 'light.name',
	settingsPowerOnBehavior = 'settings.powerOnBehavior',
	settingsPowerOnBrightness = 'settings.powerOnBrightness',
	settingsPowerOnTemperature = 'settings.powerOnTemperature',
	settingsSwitchOnDurationMs = 'settings.switchOnDurationMs',
	settingsSwitchOffDurationMs = 'settings.switchOffDurationMs',
	settingsColorChangeDurationMs = 'settings.colorChangeDurationMs',
	infoProductName = 'info.productName',
	infoHardwareBoardType = 'info.hardwareBoardType',
	infoHardwareRevision = 'info.hardwareRevision',
	infoMacAddress = 'info.macAddress',
	infoFirmwareBuildNumber = 'info.firmwareBuildNumber',
	infoFirmwareVersion = 'info.firmwareVersion',
	infoSerialNumber = 'info.serialNumber',
	infoDisplayName = 'info.displayName',
	infoFeatures = 'info.features',
	infoWifiSsid = 'info.wifi.wifiSsid',
	infoWifiFrequencyMHz = 'info.wifi.wifiFrequencyMHz',
	infoWifiRssi = 'info.wifi.wifiRssi',
	optionsNumberOfLights = 'options.numberOfLights',
	optionsLightOn = 'options.light.lightOn',
	optionsLightBrightness = 'options.light.lightBrightness',
	optionsLightTemperature = 'options.light.lightTemperature',
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variableDefinitions: CompanionVariableDefinition[] = [
		// Basic properties
		{
			name: 'Light IP Address',
			variableId: VariableId.lightIp,
		},
		{
			name: 'Light Port',
			variableId: VariableId.lightPort,
		},
		{
			name: 'Light Name',
			variableId: VariableId.lightName,
		},
		// Settings properties
		{
			name: 'Power On Behavior',
			variableId: VariableId.settingsPowerOnBehavior,
		},
		{
			name: 'Power On Brightness',
			variableId: VariableId.settingsPowerOnBrightness,
		},
		{
			name: 'Power On Temperature',
			variableId: VariableId.settingsPowerOnTemperature,
		},
		{
			name: 'Switch On Duration (ms)',
			variableId: VariableId.settingsSwitchOnDurationMs,
		},
		{
			name: 'Switch Off Duration (ms)',
			variableId: VariableId.settingsSwitchOffDurationMs,
		},
		{
			name: 'Color Change Duration (ms)',
			variableId: VariableId.settingsColorChangeDurationMs,
		},
		// Info properties
		{
			name: 'Product Name',
			variableId: VariableId.infoProductName,
		},
		{
			name: 'Hardware Board Type',
			variableId: VariableId.infoHardwareBoardType,
		},
		{
			name: 'Hardware Revision',
			variableId: VariableId.infoHardwareRevision,
		},
		{
			name: 'MAC Address',
			variableId: VariableId.infoMacAddress,
		},
		{
			name: 'Firmware Build Number',
			variableId: VariableId.infoFirmwareBuildNumber,
		},
		{
			name: 'Firmware Version',
			variableId: VariableId.infoFirmwareVersion,
		},
		{
			name: 'Serial Number',
			variableId: VariableId.infoSerialNumber,
		},
		{
			name: 'Display Name',
			variableId: VariableId.infoDisplayName,
		},
		{
			name: 'Features',
			variableId: VariableId.infoFeatures,
		},
		{
			name: 'WiFi SSID',
			variableId: VariableId.infoWifiSsid,
		},
		{
			name: 'WiFi Frequency (MHz)',
			variableId: VariableId.infoWifiFrequencyMHz,
		},
		{
			name: 'WiFi RSSI',
			variableId: VariableId.infoWifiRssi,
		},
		// Options/Light Status properties
		{
			name: 'Number of Lights',
			variableId: VariableId.optionsNumberOfLights,
		},
		{
			name: 'Light Power Status',
			variableId: VariableId.optionsLightOn,
		},
		{
			name: 'Light Brightness',
			variableId: VariableId.optionsLightBrightness,
		},
		{
			name: 'Light Temperature',
			variableId: VariableId.optionsLightTemperature,
		},
	]

	self.setVariableDefinitions(variableDefinitions)
}

export function UpdateVariables(self: ModuleInstance): void {
	const variables: CompanionVariableValues = {}
	const lightStateUnavailable = '$NA. Light State Unavailable'
	if (!self.config.polling) {
		self.log('debug', `Polling set to ${self.config.polling}`)
		// Set all variables to NA when polling is turned off
		const naValue = '$NA. Polling Is Turned Off'
		variables[VariableId.lightIp] = naValue
		variables[VariableId.lightPort] = naValue
		variables[VariableId.lightName] = naValue
		variables[VariableId.settingsPowerOnBehavior] = naValue
		variables[VariableId.settingsPowerOnBrightness] = naValue
		variables[VariableId.settingsPowerOnTemperature] = naValue
		variables[VariableId.settingsSwitchOnDurationMs] = naValue
		variables[VariableId.settingsSwitchOffDurationMs] = naValue
		variables[VariableId.settingsColorChangeDurationMs] = naValue
		variables[VariableId.infoProductName] = naValue
		variables[VariableId.infoHardwareBoardType] = naValue
		variables[VariableId.infoHardwareRevision] = naValue
		variables[VariableId.infoMacAddress] = naValue
		variables[VariableId.infoFirmwareBuildNumber] = naValue
		variables[VariableId.infoFirmwareVersion] = naValue
		variables[VariableId.infoSerialNumber] = naValue
		variables[VariableId.infoDisplayName] = naValue
		variables[VariableId.infoFeatures] = naValue
		variables[VariableId.infoWifiSsid] = naValue
		variables[VariableId.infoWifiFrequencyMHz] = naValue
		variables[VariableId.infoWifiRssi] = naValue
		variables[VariableId.optionsNumberOfLights] = naValue
		variables[VariableId.optionsLightOn] = naValue
		variables[VariableId.optionsLightBrightness] = naValue
		variables[VariableId.optionsLightTemperature] = naValue
	} else {
		const keylight = self.data.keylight

		// Basic properties
		variables[VariableId.lightIp] = keylight.ip || ''
		variables[VariableId.lightPort] = keylight.port || 0
		variables[VariableId.lightName] = keylight.name || ''

		// Settings properties
		variables[VariableId.settingsPowerOnBehavior] = keylight.settings?.powerOnBehavior === 1 ? 'On' : 'Off'
		variables[VariableId.settingsPowerOnBrightness] = keylight.settings?.powerOnBrightness
			? `${keylight.settings.powerOnBrightness}%`
			: '0%'
		variables[VariableId.settingsPowerOnTemperature] = keylight.settings?.powerOnTemperature
			? formatTemperatureValue(keylight.settings.powerOnTemperature)
			: '0K'
		variables[VariableId.settingsSwitchOnDurationMs] = keylight.settings?.switchOnDurationMs
			? keylight.settings.switchOnDurationMs / 1000
			: 0
		variables[VariableId.settingsSwitchOffDurationMs] = keylight.settings?.switchOffDurationMs
			? keylight.settings.switchOffDurationMs / 1000
			: 0
		variables[VariableId.settingsColorChangeDurationMs] = keylight.settings?.colorChangeDurationMs
			? keylight.settings.colorChangeDurationMs / 1000
			: 0

		// Info properties
		variables[VariableId.infoProductName] = keylight.info?.productName || ''
		variables[VariableId.infoHardwareBoardType] = keylight.info?.hardwareBoardType || 0
		variables[VariableId.infoHardwareRevision] = keylight.info?.hardwareRevision || 0
		variables[VariableId.infoMacAddress] = keylight.info?.macAddress || ''
		variables[VariableId.infoFirmwareBuildNumber] = keylight.info?.firmwareBuildNumber || 0
		variables[VariableId.infoFirmwareVersion] = keylight.info?.firmwareVersion || ''
		variables[VariableId.infoSerialNumber] = keylight.info?.serialNumber || ''
		variables[VariableId.infoDisplayName] = keylight.info?.displayName || ''
		variables[VariableId.infoFeatures] = keylight.info?.features?.join(', ') || ''

		// WiFi Info properties
		variables[VariableId.infoWifiSsid] = keylight.info?.['wifi-info']?.ssid || ''
		variables[VariableId.infoWifiFrequencyMHz] = keylight.info?.['wifi-info']?.frequencyMHz
			? keylight.info['wifi-info'].frequencyMHz / 1000
			: 0
		variables[VariableId.infoWifiRssi] = keylight.info?.['wifi-info']?.rssi || 0

		// Options/Light Status properties
		const lightStatus = self.getLightStatus()
		if (lightStatus) {
			variables[VariableId.optionsNumberOfLights] =
				keylight.options?.numberOfLights ?? keylight.options?.lights?.length ?? 0
			variables[VariableId.optionsLightOn] = lightStatus.on === 1 ? 'On' : 'Off'
			variables[VariableId.optionsLightBrightness] = lightStatus.brightness ? `${lightStatus.brightness}%` : '0%'
			variables[VariableId.optionsLightTemperature] = lightStatus.temperature
				? formatTemperatureValue(lightStatus.temperature)
				: '0K'
		} else {
			variables[VariableId.optionsNumberOfLights] = lightStateUnavailable
			variables[VariableId.optionsLightOn] = lightStateUnavailable
			variables[VariableId.optionsLightBrightness] = lightStateUnavailable
			variables[VariableId.optionsLightTemperature] = lightStateUnavailable
		}
	}

	self.setVariableValues(variables)
	self.checkFeedbacks()
}
