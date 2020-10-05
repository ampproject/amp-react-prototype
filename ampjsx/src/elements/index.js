
import React from 'react';

export function Wrapper({
  comp: Comp,
  props,
}) {
  return <Comp {...props} />
}

export function withWrapper(comp) {
  return (props) => Wrapper({comp, props});
}

export function Img() {
  return <span>Img</span>;
}

function HeavyProto({placeholder, showWarning, ...rest}) {
  return <div {...rest} className="heavy" style={{border: `1px solid ${showWarning ? 'red' : 'black'}`}}>Heavy: {placeholder}</div>;
}

export const Heavy = withWrapper(HeavyProto);
