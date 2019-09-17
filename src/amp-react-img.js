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
  exporter,
  useLoadState,
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

  // TBD: Loading is done via rendering, but loading and loadPromise are
  //      a bit separate now with more AMPy nuances visible (e.g. exporter).
  // TBD: If we decide to do unloading as well (e.g. remove "src") this will
  //      be even messier since layout and unlayout effects have to be separate
  //      as well.
  const toLoad = useLoadState(props);
  if (!toLoad) {
    delete outs['src'];
    delete outs['srcSet'];
  }
  // TBD: In the past there were bugs where "load" even fired sync in
  //      some cases. In this case it'd be too late to setup a listener in
  //      a layoutEffect.
  useLayoutEffect(() => {
    if (toLoad) {
      exporter({loadPromise: new Promise(resolve => {
        imageRef.current.onload = resolve;
      })});
    }
  }, [toLoad]);

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
