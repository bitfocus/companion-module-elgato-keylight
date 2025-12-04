const { isFunction, getKelvin, getContentOfPath} = require('./utils')

module.exports = {
	updateVariableDefinitions() {
		this.data.variables = {}

		if (!this.config.polling) {
			this.setVariableDefinitions([])
			return
		}

        // ============================== Light States ============================== //
		this.data.variables.on = {
			name: 'Light Power Status',
			variableId: 'power',
			getValue: (value) => this.POWER_VALUES[value],
		}

		this.data.variables.brightness = {
			name: 'Light Brightness',
			variableId: 'brightness'
		}

		this.data.variables.temperature = {
			name: 'Light Temperature',
			variableId: 'temperature',
			getValue: (value) => `${getKelvin(value)}K`,
		}

        // ============================== Accessory Info ============================== //
        this.data.variables.productName = {
            name: 'Product',
            variableId: 'accessory.productName'
        }

        this.data.variables.macAddress = {
            name: 'Address Mac',
            variableId: 'accessory.macAddress'
        }

        this.data.variables.firmwareVersion = {
            name: 'Firmware version',
            variableId: 'accessory.firmwareVersion'
        }

        this.data.variables.serialNumber = {
            name: 'Serial number',
            variableId: 'accessory.serialNumber'
        }

        this.data.variables.displayName = {
            name: 'Light name',
            variableId: 'accessory.displayName'
        }

        this.data.variables['wifi-info.ssid'] = {
            name: 'Wifi Name',
            variableId: 'accessory.wifi.name'
        }

        this.data.variables['wifi-info.frequencyMHz'] = {
            name: 'Wifi frequency (GHz)',
            variableId: 'accessory.wifi.frequency',
            getValue: (value) => value / 1000,
        }

        this.data.variables['wifi-info.rssi'] = {
            name: 'Wifi RSSI',
            variableId: 'accessory.wifi.rssi'
        }

        // ============================== Settings ============================== //

        this.data.variables.powerOnBehavior = {
            name: 'Reset to default parameters on power on ?',
            variableId: 'setting.powerOnBehavior',
            getValue: (value) => value === 2,
        }

        this.data.variables.powerOnBrightness = {
            name: 'Default brightness on power on if powerOnBehavior is true',
            variableId: 'setting.powerOnBrightness'
        }

        this.data.variables.powerOnTemperature = {
            name: 'Default temperature on power on if powerOnBehavior is true',
            variableId: 'setting.powerOnTemperature',
            getValue: (value) => `${getKelvin(value)}K`,
        }

        this.data.variables.switchOnDurationMs = {
            name: 'Duration of the power on transition (sec)',
            variableId: 'setting.switchOnDuration',
            getValue: (value) => value / 1000,
        }

        this.data.variables.switchOffDurationMs = {
            name: 'Duration of the power off transition (sec)',
            variableId: 'setting.switchOffDuration',
            getValue: (value) => value / 1000,
        }

        this.data.variables.colorChangeDurationMs = {
            name: 'Duration of the color change transition (sec)',
            variableId: 'setting.colorChangeDuration',
            getValue: (value) => value / 1000,
        }

		this.setVariableDefinitions(
			Object.values(this.data.variables).map((variable) => ({
				name: variable.name,
				variableId: variable.variableId,
			}))
		)
	},
	updateVariables(status) {
		Object.keys(this.data.variables).forEach((id) => {
			const value = getContentOfPath(status, id);
            if (value === undefined) return;
            const variables = {};
			const name = this.data.variables[id].variableId

			if (this.data.status[name] !== value) {
				this.data.status[name] = value
				if (isFunction(this.data.variables[id].getValue)) {
					variables[name] = this.data.variables[id].getValue(value)
				} else {
					variables[name] = value
				}
                this.setVariableValues(variables)
				this.checkFeedbacks(name)
			}
		})
	},
}
