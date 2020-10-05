import React, {useEffect, useRef} from 'react';
import { action } from '@storybook/addon-actions';
import {text, withKnobs} from '@storybook/addon-knobs';
import Doc from './doc1.doc';
import {extractDoc, hydrate} from '../tools/extract-doc';

export default {
  title: 'Doc1',
  decorators: [withKnobs],
};

export const _default = () => {
  const name = text('name', 'lightcoral');
  return <Doc />
};

export const _output = () => {
  const markup = extractDoc(<Doc/>);
  const ref = useRef();
  useEffect(() => {
    setTimeout(() => {
      hydrate(<Doc/>, ref.current.contentDocument.body);
    }, 1000);
  }, []);
  return (
    <div>
      <div>{markup}</div>
      <iframe ref={ref} srcDoc={markup}/>
    </div>
  );
};
