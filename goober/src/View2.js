import React from 'react';

import './View2.css';

const View2WithRef = (props, ref) => {
  console.log('View2WithRef: ', props, ref);
  const ref2 = React.useRef();
  React.useImperativeHandle(ref, () => ref2.current);
  return <div ref={ref2} className="view2"></div>;
};

const View2X = React.forwardRef(View2WithRef);

const View2 = (props) => {
  const ref = React.useRef();
  React.useEffect(() => {
    console.log('got ref back: ', ref.current);
  });
  return <View2X ref={ref} />;
  // return <View2X />;
};

export default View2;
