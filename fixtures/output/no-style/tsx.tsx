export function Component1({children}) {
  return <div>{children}</div>;
}

export function jsx2() {
  const props = {a:1,
  b:2};
  return < a aria-label="bar" title={`foo` } >
     <div {...props }
    className="2">Inline Text</div>
    <Component1>
      Block Text
      </Component1>
      <div>
        Mixed
            <div>Foo</div>
          Text<b > Bar</b>
        </div>
        <p>
          foo<i>bar</i><b>baz</b>
        </p>
      </ a >;
}
