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

/**
 * @param {!Object<string, *>} props
 * @param {!Array<string>} keys
 * @return {!Object<string, *>}
 */
function pick(props, keys) {
  const out = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = props[key];
    if (value !== undefined) {
      out[key] = value;
    }
  }

  return out;
}

/**
 * @return {boolean}
 */
function testSrcsetSupport() {
  const support = 'srcset' in new Image();
  testSrcsetSupport = () => support;
  return support;
}

/**
 * @param {string|undefined} src
 * @param {string|undefined} srcset
 * @return {string|undefined}
 */
function guaranteeSrcForSrcsetUnsupportedBrowsers(src, srcset) {
  if (src !== undefined || testSrcsetSupport()) {
    return src;
  }
  const match = /\S+/.exec(srcset);
  return match ? match[0] : undefined;
}

const ATTRIBUTES_TO_PROPAGATE = [
  'alt',
  'title',
  'referrerpolicy',
  'aria-label',
  'aria-describedby',
  'aria-labelledby',
  'srcset',
  'src',
  'sizes',
];

/**
 * We'll implement all our new extensions as React/Preact Components (TBD).
 * They're true Components, not AmpElements/Amp.BaseElements.
 */
export class AmpImg extends React.Component {
  /**
   * @param {!Object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      prerender: true,
      element: props['i-amphtml-element'],
      layoutWidth: 0,
    };

    /** @private {boolean} */
    this.prerenderAllowed_ = !!props['noprerender'];

    /** @private {number} */
    this.currentSizesWidth_ = 0;

    /** @private {string|undefined} */
    this.currentSizes_ = undefined;
  }

  /**
   * @return {*}
   */
  render() {
    const context = this.context;

    const props = pick(this.props, ATTRIBUTES_TO_PROPAGATE);

    const { id } = this.props;
    if (id) {
      props['amp-img-id'] = id;
    }
    props['src'] = guaranteeSrcForSrcsetUnsupportedBrowsers(
      props['src'],
      props['srcset']
    );
    props['sizes'] = this.maybeGenerateSizes_(props['sizes']);
    props['decoding'] = 'async';
    props['className'] = 'i-amphtml-fill-content i-amphtml-replaced-content';

    // TBD: This is just a demonstration. In reality, this doesn't work
    // correctly since it unloads images unnecessary. The `playable` property,
    // however, would work better in this scheme.
    if (!context.renderable) {
      delete props['src'];
      delete props['srcset'];
    }

    return React.createElement('img', props);
  }

  /**
   * @param {string|undefined} sizes
   * @return {string|undefined}
   * @private
   */
  maybeGenerateSizes_(sizes) {
    if (sizes) {
      return sizes;
    }
    const { 'i-amphtml-layout': layout, srcset } = this.props;
    if (layout === 'intrinsic') {
      return;
    }

    if (!srcset || /[0-9]+x(?:,|$)/.test(srcset)) {
      return;
    }

    const { layoutWidth } = this.state;
    if (!layoutWidth || layoutWidth <= this.currentSizesWidth_) {
      return this.currentSizes_;
    }
    this.currentSizesWidth_ = layoutWidth;

    const viewportWidth = this.state.element.getViewport().getWidth();

    const entry = `(max-width: ${viewportWidth}px) ${layoutWidth}px, `;
    let defaultSize = layoutWidth + 'px';

    if (layout !== 'fixed') {
      const ratio = Math.round((layoutWidth * 100) / viewportWidth);
      defaultSize = Math.max(ratio, 100) + 'vw';
    }

    return (this.currentSizes_ = entry + defaultSize);
  }
}

AmpImg.contextType = AmpContext;

function addToClass(classes, add) {
  return (classes || '') + ' ' + add;
}

const AmpReactImg = ReactCompatibleBaseElement(AmpImg, {});
customElements.define('amp-react-img', AmpReactImg);
