import type { ConfigItem, OptionsConfig, Rules } from '@antfu/eslint-config';

import { GLOB_JSX, GLOB_TSX, antfu } from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import { isPackageExists } from 'local-pkg';

import { getTsConfigPaths } from './utils';

const reactPackages = [
	'react',
	'react-dom',
];

const nextPackages = [
	'next',
];

export type ConfigureOptions = OptionsConfig & {
	/**
	 * Enable react rules.
	 *
	 * @default true
	 */
	react?: boolean;
	/**
	 * Enable next rules.
	 *
	 * @default true
	 */
	next?: boolean;
};

export default function configure(options?: ConfigureOptions & ConfigItem, ...userConfigs: (ConfigItem | ConfigItem[])[]): ConfigItem[] {
	const enableReact = reactPackages.some((i) => isPackageExists(i));
	const enableNext = nextPackages.some((i) => isPackageExists(i));
	const enableTypescript = isPackageExists('typescript');

	const {
		next = enableNext,
		plugins = {},
		react = enableReact,
		rules = {},
		stylistic = {
			indent: 'tab',
			quotes: 'single',
		},
		typescript = enableTypescript,
		...remainingOptions
	} = options || {
		next: enableNext,
		react: enableReact,
		stylistic: {
			indent: 'tab',
			quotes: 'single',
		},
		typescript: enableTypescript,
	};

	const indent = stylistic && typeof stylistic !== 'boolean'
		? typeof stylistic?.indent === 'number'
			? stylistic.indent
			: 'tab'
		: 'tab';

	const tsConfigPaths = getTsConfigPaths(typescript);

	const customStyleRules = {
		'style/arrow-parens': ['error', 'always'],
		'style/brace-style': ['error', '1tbs'],
		'style/indent': ['error', indent],
		'style/jsx-curly-brace-presence': ['off'],
		'style/jsx-one-expression-per-line': ['off'],
		'style/member-delimiter-style': ['error', {
			multiline: {
				delimiter: 'semi',
				requireLast: true,
			},
			multilineDetection: 'brackets',
			singleline: {
				delimiter: 'semi',
				requireLast: false,
			},
		}],
		'style/semi': ['error', 'always'],
	} satisfies Partial<Rules>;

	const typescriptRules = {
		'ts/ban-types': ['error', {
			extendDefaults: true,
		}],
		'ts/consistent-type-definitions': ['off'],
		'ts/no-explicit-any': ['warn'],
		'ts/semi': ['error', 'always'],
	} satisfies Partial<Rules>;

	return antfu({
		plugins: {
			...(next
				? {
					'@next/next': nextPlugin,
				}
				: {}),
			...plugins,
		},
		rules: {
			// ...(react ? reactPlugin.configs.recommended.rules : {}),
			...(next ? nextPlugin.configs.recommended.rules : {}),
			...(next ? nextPlugin.configs['core-web-vitals'].rules : {}),
			...(next
				? {
					'@next/next/no-img-element': 'error',
				}
				: {}),
			...(stylistic ? customStyleRules : {}),
			...(typescript ? typescriptRules : {}),
			'antfu/consistent-list-newline': ['off'],
			'curly': ['error', 'all'],
			'perfectionist/sort-imports': ['error', {
				'groups': [
					'builtin',
					'type',
					['external'],
					['internal-type', 'internal'],
					['parent-type', 'sibling-type', 'index-type'],
					['parent', 'sibling', 'index'],
					'side-effect',
					'style',
					'object',
					'unknown',
				],
				'internal-pattern': tsConfigPaths,
				'newlines-between': 'always',
				'order': 'asc',
				'type': 'natural',
			}],
			'perfectionist/sort-jsx-props': [
				'error',
				{
					'custom-groups': {
						ids: ['key', 'id'],
					},
					'groups': ['ids', 'multiline', 'unknown', 'shorthand'],
					'order': 'asc',
					'type': 'natural',
				},
			],
			'semi': ['error', 'always'],
			'unicorn/template-indent': ['warn', {
				indent: indent === 'tab'
					? '\t'
					: indent,
				tags: [
					'groq',
					'gql',
					'sql',
					'html',
					'styled',
				],
			}],
			...rules,
		},
		stylistic: typeof stylistic === 'boolean'
			? stylistic
			: {
				indent,
				...stylistic,
			},
		typescript,
		vue: false,
		...remainingOptions,
	},
	...userConfigs,
	...(react
		? [
			{
				name: 'antfu:react:setup',
				plugins: {
					'react': pluginReact,
					'react-hooks': pluginReactHooks,
				},
			},
			{
				files: [GLOB_JSX, typescript ? GLOB_TSX : ''].filter(Boolean),
				languageOptions: {
					parserOptions: {
						ecmaFeatures: {
							jsx: true,
						},
					},
				},
				name: 'antfu:react:rules',
				rules: {
					...pluginReact.configs.recommended.rules,
					...pluginReactHooks.configs.recommended.rules,

					'react/prop-types': 'off',
					'react/react-in-jsx-scope': 'off',
				},
				settings: {
					react: {
						version: 'detect',
					},
				},
			},
		]
		: []),
	);
}
