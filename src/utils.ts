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
			tsconfig = getTsconfig(tsconfigPath[0]);
		} else {
			tsconfig = getTsconfig(tsconfigPath);
		}
	}

	if (tsconfig && tsconfig.config.compilerOptions?.paths) {
		return Object.keys(tsconfig.config.compilerOptions.paths);
	}

	return [];
}
