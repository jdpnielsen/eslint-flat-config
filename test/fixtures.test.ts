import { join, resolve } from 'node:path';

import type { ConfigItem } from '@antfu/eslint-config';
import type { ConfigureOptions } from '@jdpnielsen/eslint-flat-config';

import { execa } from 'execa';
import fg from 'fast-glob';
import fs from 'fs-extra';
import { afterAll, beforeAll, it } from 'vitest';

beforeAll(async () => {
	await fs.rm('_fixtures', { recursive: true, force: true });
});
afterAll(async () => {
	await fs.rm('_fixtures', { recursive: true, force: true });
});

runWithConfig('js', {
	typescript: false,
});
runWithConfig('all', {
	typescript: true,
});
runWithConfig('no-style', {
	typescript: true,
	stylistic: false,
});
runWithConfig('double-quotes', {
	typescript: true,
	stylistic: {
		quotes: 'double',
	},
});

// https://github.com/antfu/eslint-config/issues/255
runWithConfig(
	'ts-override',
	{
		typescript: true,
		react: false,
	},
	{
		rules: {
			'ts/consistent-type-definitions': ['error', 'type'],
		},
	},
);

function runWithConfig(name: string, configs: ConfigureOptions, ...items: ConfigItem[]) {
	it.concurrent(name, async ({ expect }) => {
		const from = resolve('fixtures/input');
		const output = resolve('fixtures/output', name);
		const target = resolve('_fixtures', name);

		await fs.copy(from, target, {
			filter: (src) => {
				return !src.includes('node_modules');
			},
		});
		await fs.writeFile(join(target, 'eslint.config.js'), `
// @eslint-disable
import configure from '@jdpnielsen/eslint-flat-config'

export default configure(
  ${JSON.stringify(configs)},
  ...${JSON.stringify(items) ?? []},
)
  `);

		await execa('npx', ['eslint', '.', '--fix'], {
			cwd: target,
			stdio: 'pipe',
		});

		const files = await fg('**/*', {
			ignore: [
				'node_modules',
				'eslint.config.js',
			],
			cwd: target,
		});

		await Promise.all(files.map(async (file) => {
			let content = await fs.readFile(join(target, file), 'utf-8');
			const source = await fs.readFile(join(from, file), 'utf-8');
			if (content === source) {
				content = '// unchanged\n';
			};
			await expect.soft(content).toMatchFileSnapshot(join(output, file));
		}));
	}, 30_000);
}
