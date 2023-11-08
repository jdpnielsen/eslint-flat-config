import path from 'node:path';

import type { OptionsTypeScriptParserOptions, OptionsTypeScriptWithTypes } from '@antfu/eslint-config';
import type { TsConfigResult } from 'get-tsconfig';

import { getTsconfig } from 'get-tsconfig';

export function getTsConfigPaths(typescriptOptions: boolean | OptionsTypeScriptWithTypes | OptionsTypeScriptParserOptions): string[] {
	if (!typescriptOptions) {
		return [];
	}

	let tsconfig: TsConfigResult | null = null;

	if (typeof typescriptOptions === 'boolean') {
		tsconfig = getTsconfig();
	} else if (typeof typescriptOptions === 'object' && ('tsconfigPath' in typescriptOptions) && typescriptOptions?.tsconfigPath) {
		const tsconfigPath = typescriptOptions.tsconfigPath;
		if (Array.isArray(tsconfigPath)) {
			const tsPath = path.parse(tsconfigPath[0]);
			tsconfig = getTsconfig(tsconfigPath[0], tsPath.name + tsPath.ext);
		} else {
			const tsPath = path.parse(tsconfigPath);
			tsconfig = getTsconfig(tsconfigPath, tsPath.name + tsPath.ext);
		}
	}

	if (tsconfig && tsconfig.config.compilerOptions?.paths) {
		return Object.keys(tsconfig.config.compilerOptions.paths)
			.map((i) => i.replace('/*', '/**'));
	}

	return [];
}
