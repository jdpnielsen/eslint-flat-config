import type { ConfigNames, OptionsConfig, OptionsOverrides, Rules, TypedFlatConfigItem } from '@antfu/eslint-config';
import type { FlatConfigComposer } from 'eslint-flat-config-utils';

import { antfu } from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
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
	 * Enable next rules.
	 *
	 * @default true
	 */
	next?: boolean;
};

export default function configure(options?: ConfigureOptions & TypedFlatConfigItem, ...userConfigs: (TypedFlatConfigItem | TypedFlatConfigItem[])[]): FlatConfigComposer<TypedFlatConfigItem, ConfigNames> {
	const enableReact = reactPackages.some((i) => isPackageExists(i));
	const enableNext = nextPackages.some((i) => isPackageExists(i));
	const enableTypescript = isPackageExists('typescript');

	const {
		next = enableNext,
		plugins = {},
		react = enableReact,
		rules = {},
		stylistic = true,
		typescript = enableTypescript,
		...remainingOptions
	} = options || {
		next: enableNext,
		react: enableReact,
		stylistic: true,
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
		'style/jsx-curly-brace-presence': ['off'],
		'style/jsx-one-expression-per-line': ['warn', { allow: 'single-line' }],
	} satisfies Partial<Rules>;

	const typescriptRules = {
		'ts/ban-types': ['error', {
			extendDefaults: true,
		}],
		'ts/consistent-type-definitions': ['off'],
		'ts/no-explicit-any': ['warn'],
	} satisfies Partial<Rules>;

	const customReactRules = {
		'react-refresh/only-export-components': [
			'warn',
			{
				allowConstantExport: false,
				allowExportNames: [
					...(enableNext
						? [
								'config',
								'dynamic',
								'generateStaticParams',
								'metadata',
								'generateMetadata',
								'viewport',
								'generateViewport',
							]
						: []),
				],
			},
		],
		'react/prefer-destructuring-assignment': ['off'],
	} satisfies Partial<Rules>;

	return antfu({
		plugins: {
			...(next
				? {
						'@next/next': nextPlugin,
					}
				: {}),
			...react
				? {
						// 'react': pluginReact,
						'react-hooks': pluginReactHooks,
						// 'react-refresh': pluginReactRefresh,
					}
				: {},
			...plugins,
		},
		react: extendOptions({ overrides: customReactRules }, react),
		rules: {
			...(next ? nextPlugin.configs.recommended.rules : {}),
			...(next ? nextPlugin.configs['core-web-vitals'].rules : {}),
			...(next
				? {
						'@next/next/no-img-element': 'error',
						'node/prefer-global/buffer': ['error', 'always'],
						'node/prefer-global/process': ['error', 'always'],
					}
				: {}),
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
		stylistic: extendOptions({ indent: 'tab', overrides: customStyleRules, quotes: 'single', semi: true }, stylistic),
		typescript: extendOptions({ overrides: typescriptRules }, typescript),
		vue: false,
		...remainingOptions,
	})
		.append(
			...userConfigs,
		);
}

function extendOptions<T extends OptionsOverrides>(defaultOptions: T, input: boolean | T | undefined): T | false {
	if (typeof input === 'boolean') {
		return input ? defaultOptions : false;
	}

	return {
		...defaultOptions,
		overrides: {
			...defaultOptions.overrides,
			...input?.overrides,
		},
	};
}
