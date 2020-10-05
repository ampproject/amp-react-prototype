
import React from 'react';
import {renderToString} from 'react-dom/server';
import {StyleContext} from '../doc';
import ReactDOM from 'react-dom';

export function extractDoc(doc) {
  const styles = [];
  const pushStyle = (style) => styles.push(style);
  let markup = renderToString(
    <StyleContext.Provider value={{pushStyle}}>
      {doc}
    </StyleContext.Provider>
  );
  markup = markup.replace(
    '<style amp-custom=""></style>',
    `<style amp-custom>${styles.join('')}</style>`
  );
  return markup;
}

export function hydrate(doc, container) {
  // suppressHydrationWarning
  return ReactDOM.hydrate(
    <StyleContext.Provider>
      {doc}
    </StyleContext.Provider>,
    container
  );
}
