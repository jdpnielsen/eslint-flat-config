import { describe, it } from 'vitest';

import { getTsConfigPaths } from './utils';

describe('getTsConfigPaths', () => {
	it('should not return any paths when typescript options is disabled', async ({ expect }) => {
		const empty = getTsConfigPaths(false);
		expect(empty).toEqual([]);
	});

	it('should return empty array when typescript options is empty', async ({ expect }) => {
		const empty = getTsConfigPaths(true);
		expect(empty).toEqual([]);

		const singlePath = getTsConfigPaths({
			tsconfigPath: './fixtures/tsconfig.json',
		});

		expect(singlePath).toEqual([]);
	});

	it('should return array of paths when given a tsconfig file with paths', async ({ expect }) => {
		const singlePath = getTsConfigPaths({
			tsconfigPath: './fixtures/tsconfig.paths.json',
		});

		expect(singlePath).toEqual(['@src/**']);

		const multiPath = getTsConfigPaths({
			tsconfigPath: [
				'./fixtures/tsconfig.paths.json',
			],
		});

		expect(multiPath).toEqual(['@src/**']);
	});

	it('should return paths from the first tsconfig file given', async ({ expect }) => {
		const multiPath = getTsConfigPaths({
			tsconfigPath: [
				'./fixtures/tsconfig.json',
				'./fixtures/tsconfig.paths.json',
			],
		});

		expect(multiPath).toEqual([]);
	});
});
