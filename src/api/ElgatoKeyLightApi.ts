import { KeyLightSettings, KeyLightInfo, KeyLightOptions } from './types/KeyLight.js'
import got, { OptionsOfJSONResponseBody } from 'got'

export class ElgatoKeylightApi {
	private readonly host: string
	private readonly port: number
	private readonly baseUrl: string
	private readonly settingsUrl: string
	private readonly infoUrl: string
	private readonly lightsUrl: string

	constructor(host: string, port: number) {
		this.host = host
		this.port = port
		this.baseUrl = `http://${this.host}:${this.port}/elgato`
		this.infoUrl = `${this.baseUrl}/accessory-info`
		this.lightsUrl = `${this.baseUrl}/lights`
		this.settingsUrl = `${this.lightsUrl}/settings`
	}

	private client = got.extend({
		timeout: { request: 10000 },
		responseType: 'json',
		resolveBodyOnly: true,
		retry: { limit: 10 },
	})

	async getSettings(): Promise<KeyLightSettings> {
		return this.client.get(this.settingsUrl).json<KeyLightSettings>()
	}

	async getAccessoryInfo(): Promise<KeyLightInfo> {
		return this.client.get(this.infoUrl).json<KeyLightInfo>()
	}

	async getLights(): Promise<KeyLightOptions> {
		return this.client.get(this.lightsUrl).json<KeyLightOptions>()
	}

	async updateLightOptions(options: Partial<KeyLightOptions>): Promise<KeyLightOptions> {
		if (options.lights && Object.keys(options.lights[0]).length > 0) {
			const requestOptions: OptionsOfJSONResponseBody = {
				json: options,
				headers: {
					'Content-Type': 'application/json',
				},
				timeout: {
					request: 10000,
				},
			}

			return this.client.put(this.lightsUrl, requestOptions).json<KeyLightOptions>()
		} else {
			return Promise.reject(new Error('No valid light options provided'))
		}
	}
}
