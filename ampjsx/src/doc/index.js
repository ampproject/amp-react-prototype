
import React, {createContext, useContext, useLayoutEffect} from 'react';
import ReactDOM from 'react-dom';

export function AmpDoc({children}) {
  return (
    <x-html>
      <x-head>
        <style
          amp-custom=""
          suppressHydrationWarning
          dangerouslySetInnerHTML={{__html: ''}} />
      </x-head>
      <x-body>
        {children}
      </x-body>
    </x-html>
  );
}

export const StyleContext = createContext({});

export function Style({children}) {
  const styleContext = useContext(StyleContext);
  if (styleContext && styleContext.pushStyle) {
    styleContext.pushStyle(children);
  }

  /*
  const style = <style amp-custom="">{children}</style>
  return ReactDOM.createPortal(style, document.head);
  */
  useLayoutEffect(() => {
    // TODO: find the place for the stylesheet via a root node.
    let sheet = document.head.querySelector('style[amp-custom]');
    if (!sheet) {
      sheet = document.createElement('style');
      sheet.setAttribute('amp-custom', '');
      document.head.appendChild(sheet);
    }
    // TODO: check that it's not repeated.
    sheet.textContent += children;
  }, []);
  return <></>;
}
