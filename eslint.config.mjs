import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const baseConfig = await generateEslintConfig({
	enableTypescript: true,
})

const customConfig = [
	{ ignores: ['.squad/**'] },
	...baseConfig,
	{
		files: ['src/**/*.ts', 'src/**/*.tsx'],
	},
	{
		rules: {
			'prettier/prettier': ['warn', { endOfLine: 'lf' }],
		},
	},
]

export default customConfig
