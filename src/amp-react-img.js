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
import { useHasEverLoaded } from './amp-react-utils.js';


export function AmpImg(props) {
  const renderable = useHasEverLoaded();
  const attrs = {...props};

  attrs['decoding'] = 'async';

  if (renderable) {
    guaranteeSrcForSrcsetUnsupportedBrowsers(attrs);
  } else {
    delete attrs['src'];
    delete attrs['srcSet'];
  }

  return preact.createElement('img', attrs);
}

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
    return;
  }
  const match = /\S+/.exec(srcSet);
  props['src'] = match ? match[0] : undefined;
}


const AmpReactImg = ReactCompatibleBaseElement(AmpImg, {
  className: 'i-amphtml-fill-content i-amphtml-replaced-content',
  attrs: {
    'id': {prop: 'amp-img-id'},
    'src': {prop: 'src'},
    'srcset': {prop: 'srcset'},
  },
});
customElements.define('amp-react-img', AmpReactImg);
