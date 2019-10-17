/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ReactCompatibleBaseElement from './react-compat-base-element.js';
import {
  AmpContext,
} from './amp-context.js';

const {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = preactHooks;

const LINE_HEIGHT_EM = 1.15;


export function AmpSelector(props) {
  return preact.createElement('div', {
    ...props,
  }, props.children);
}


AmpSelector.Option = function(props) {
  // QQQQ: Context
  useEffect(() => {

  });
  return props.render({
    option: props.option,
    selected: props.selected || false,
  });
}


const AmpReactSelector = ReactCompatibleBaseElement(AmpSelector, {
  className: 'i-amphtml-fill-content i-amphtml-replaced-content',
  attrs: {
  },
  children: {
    'children': '*',
  },
});
customElements.define('amp-react-selector', AmpReactSelector);
