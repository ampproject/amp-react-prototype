
import React, {useEffect, useState} from 'react';

export function Sparse({el, sid, skipContent, children, getComponent, ...rest}) {
  const [component, setComponent] = useState(null);

  useEffect(() => {
    if (getComponent) {
      return onFakeUnblock(() => getComponent().then(setComponent));
    }
  }, [getComponent]);

  if (component) {
    return component;
  }

  const El = el;
  return (
    <El
      suppressHydrationWarning
      dangerouslySetInnerHTML={skipContent ? {__html: ''} : null}
      children={skipContent ? undefined : children}
      {...rest}
      data-sid={sid}
      />
  );
}

function onFakeUnblock(callback) {
  if (!window.__blocker) {
    window.__blocker = new Promise(resolve => {
      window.__unblock = resolve;
    });
  }
  let canceled = false;
  window.__blocker.then(() => {
    if (!canceled) {
      callback();
    }
  });
  return () => {
    canceled = true;
  }
}
