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
  cleanProps,
  useLoadEffect,
} from './amp-react-utils.js';

const {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = React;

/**
 * @return {boolean}
 */
function testSrcsetSupport() {
  const support = 'srcset' in Image.prototype;
  testSrcsetSupport = () => support;
  return support;
}

/**
 * @param {!Object} props
 * @return {string|undefined}
 */
function guaranteeSrcForSrcsetUnsupportedBrowsers(props) {
  const {src, srcSet} = props;
  if (src !== undefined || testSrcsetSupport()) {
    return src;
  }
  const match = /\S+/.exec(srcSet);
  return match ? match[0] : undefined;
}

/**
 * We'll implement all our new extensions as React/Preact Components (TBD).
 * They're true Components, not AmpElements/Amp.BaseElements.
 */
export function AmpImg(props) {
  const outs = cleanProps(props);

  const imageRef = useRef();
  outs['ref'] = imageRef;

  outs['decoding'] = 'async';
  outs['src'] = guaranteeSrcForSrcsetUnsupportedBrowsers(props);

  // TBD: Can this at all be provided outside of AMP? Access to Viewport
  // limits the functionality of this element independently.
  // outs['sizes'] = this.maybeGenerateSizes_(props['sizes']);

  // TBD: To be assigned by the affect.
  delete outs['src'];
  delete outs['srcSet'];
  useLoadEffect(props, () => {
    const {src, srcSet} = props;
    const img = imageRef.current;
    if (src) {
      img.setAttribute('src', src);
    }
    if (srcSet) {
      img.setAttribute('srcset', srcSet);
    }
    return new Promise(resolve => {
      img.onload = resolve;
    });
  });

  return React.createElement('img', outs);
}

const AmpReactImg = ReactCompatibleBaseElement(AmpImg, {
  className: 'i-amphtml-fill-content i-amphtml-replaced-content',
  attrs: {
    'src': {prop: 'src'},
    'srcset': {prop: 'srcSet'},
  },
});
customElements.define('amp-react-img', AmpReactImg);
