import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const baseConfig = await generateEslintConfig({
	enableTypescript: false,
})

const customConfig = [
	...baseConfig,
	{
		files: ['src/**/*.js', 'src/**/*.mjs'],
	},
	{
		rules: {
			'prettier/prettier': ['warn', { endOfLine: 'lf' }],
		},
	},
]

export default customConfig
