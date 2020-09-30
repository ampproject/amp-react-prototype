
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
  return <div>Img</div>;
}

function HeavyProto() {
  return <div className="heavy">Heavy</div>;
}

export const Heavy = withWrapper(HeavyProto);
