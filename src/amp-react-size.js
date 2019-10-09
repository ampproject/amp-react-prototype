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
import {useResizeEffect, useStateFromProp} from './amp-react-utils.js';

const {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = preactHooks;


export function AmpSize(props) {
  const sizeRef = useRef();

  useResizeEffect(sizeRef, (width, height) => {
    const el = sizeRef.current;
    el.textContent = `${width}x${height}`;
  });

  return preact.createElement('div', {
    ref: sizeRef,
    style: props.style,
  });
}

const AmpReactSize = ReactCompatibleBaseElement(AmpSize, {});
customElements.define('amp-react-size', AmpReactSize);
