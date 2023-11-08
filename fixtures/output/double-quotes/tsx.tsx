import type { Person } from "./typescript";

export function Component1({ children }: { children: React.ReactNode }) {
	return <div>{children}</div>;
}

export function jsx2({ name, age }: Person) {
	const props = { a: name,
		b: age };
	return (
		<a aria-label="bar" title={`foo`}>
			<div
				{...props}
				className="2"
			>Inline Text
			</div>
			<Component1>
				Block Text
			</Component1>
			<div>
				Mixed
				<div>Foo</div>
				Text<b> Bar</b>
			</div>
			<p>
				foo<i>bar</i><b>baz</b>
			</p>
		</a>
	);
}
