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

const {
  useState,
} = preactHooks;


/**
 * @enum {string}
 */
export const Layout = {
  NODISPLAY: 'nodisplay',
  FIXED: 'fixed',
  FIXED_HEIGHT: 'fixed-height',
  RESPONSIVE: 'responsive',
  CONTAINER: 'container',
  FILL: 'fill',
  FLEX_ITEM: 'flex-item',
  FLUID: 'fluid',
  INTRINSIC: 'intrinsic',
};


export function AmpWithLayout(props) {
  // This code is forked from `applyStaticLayout`.
  // TBD: refactor `applyStaticLayout` to make this less forked.

  const [hasBeenLoaded, setHasBeenLoaded] = useState(false);

  // Parse layout from props.
  const {
    type,
    tagName,
    layout: layoutAttr,
    width: widthAttr,
    height: heightAttr,
    placeholder,
  } = props;

  // Input layout attributes.
  const inputLayout = layoutAttr ? layoutAttr : null;
  const inputWidth =
    widthAttr && widthAttr != 'auto' ? parseLength(widthAttr) : widthAttr;
  const inputHeight =
    heightAttr && heightAttr != 'fluid' ? parseLength(heightAttr) : heightAttr;

  // Effective layout attributes. These are effectively constants.
  let width;
  let height;
  let layout;

  // Calculate effective width and height.
  if (
    (!inputLayout ||
      inputLayout == Layout.FIXED ||
      inputLayout == Layout.FIXED_HEIGHT) &&
    (!inputWidth || !inputHeight) &&
    hasNaturalDimensions(tagName)
  ) {
    // Default width and height: handle elements that do not specify a
    // width/height and are defined to have natural browser dimensions.
    const dimensions = getNaturalDimensions(tagName);
    width =
      inputWidth || inputLayout == Layout.FIXED_HEIGHT
        ? inputWidth
        : dimensions.width;
    height = inputHeight || dimensions.height;
  } else {
    width = inputWidth;
    height = inputHeight;
  }

  // Calculate effective layout.
  if (inputLayout) {
    layout = inputLayout;
  } else if (!width && !height) {
    layout = Layout.CONTAINER;
  } else if (height == 'fluid') {
    layout = Layout.FLUID;
  } else if (height && (!width || width == 'auto')) {
    layout = Layout.FIXED_HEIGHT;
  } else {
    layout = Layout.FIXED;
  }

  // Apply UI.
  const layoutStyle = {
    'display': 'block',
  };
  const childStyle = {};
  const layoutProps = {
    'i-amphtml-layout': layout,
    style: layoutStyle,
  };
  const layoutChildren = [];
  if (isLayoutSizeDefined(layout)) {
    layoutStyle['overflow'] = 'hidden';
    layoutStyle['position'] = 'relative';
    childStyle['position'] = 'absolute';
    childStyle['inset'] = 0;
  }
  if (layout == Layout.NODISPLAY) {
    // CSS defines layout=nodisplay automatically with `display:none`. Thus
    // no additional styling is needed.
    layoutProps['hidden'] = true;
    // TODO(jridgewell): Temporary hack while SSR still adds an inline
    // `display: none`
    layoutStyle['display'] = '';
  } else if (layout == Layout.FIXED) {
    layoutStyle['width'] = width;
    layoutStyle['height'] = height;
  } else if (layout == Layout.FIXED_HEIGHT) {
    layoutStyle['height'] = height;
  } else if (layout == Layout.RESPONSIVE) {
    layoutChildren.push(preact.createElement(
      'i-amphtml-sizer',
      {
        style: {
          'display': 'block',
          'paddingTop':
            (getLengthNumeral(height) / getLengthNumeral(width)) * 100 + '%',
        },
      }
    ));
  } else if (layout == Layout.FILL) {
    // Do nothing.
  } else if (layout == Layout.CONTAINER) {
    // Do nothing. Elements themselves will check whether the supplied
    // layout value is acceptable. In particular container is only OK
    // sometimes.
  } else if (layout == Layout.FLEX_ITEM) {
    // Set height and width to a flex item if they exist.
    // The size set to a flex item could be overridden by `display: flex` later.
    if (width) {
      layoutStyle['width'] = width;
    }
    if (height) {
      layoutStyle['height'] = height;
    }
  } else {
    // TODO: partial implementation.
  }

  // Placeholder.
  if (placeholder && !hasBeenLoaded) {
    // TBD: how to force placeholder to take 100% space?
    layoutChildren.push(placeholder);
  }

  // Loading indicator.
  if (!hasBeenLoaded) {
    layoutChildren.push(preact.createElement(Loader));
  }

  // TODO: loading indicator.

  return preact.createElement(
    tagName || 'amp-element',
    layoutProps,
    layoutChildren.concat(
      preact.createElement(
        type,
        {
          ...props,
          // Remove layout props.
          layout: undefined,
          width: undefined,
          height: undefined,
          placeholder: undefined,
          // Styles.
          style: {
            ...props.style,
            ...childStyle,
          },
          // Loading.
          // TODO: ensure that all AMP elements yield onLoad.
          // TBD: is it ever possible that we are too late here for the onLoad
          // event?
          onLoad: () => setHasBeenLoaded(true),
        }
      )
    )
  );
}


/**
 * Loader component.
 */
function Loader(props) {
  // TBD: very hard to animate without `@keyframes` global.
  // TBD: use `useInViewportEffect()` to start/stop animations.
  return preact.createElement(
    'i-amphtml-loader',
    {
      style: {
        'position': 'absolute',
        'inset': 0,
        'zIndex': 3,
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        // TODO: remove; debugging only.
        'background': 'rgba(0, 0, 0, 0.7)',
        'color': '#fff',
      },
    },
    preact.createElement(
      'div',
      {},
      'loading...'
    )
  );
}


/**
 * Parses the CSS length value. If no units specified, the assumed value is
 * "px". Returns undefined in case of parsing error.
 * @param {string|undefined|null} s
 * @return {!LengthDef|undefined}
 */
export function parseLength(s) {
  if (typeof s == 'number') {
    return s + 'px';
  }
  if (!s) {
    return undefined;
  }
  if (!/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)?$/.test(s)) {
    return undefined;
  }
  if (/^\d+(\.\d+)?$/.test(s)) {
    return s + 'px';
  }
  return s;
}

/**
 * Returns the numeric value of a CSS length value.
 * @param {!LengthDef|string|null|undefined} length
 * @return {number|undefined}
 */
export function getLengthNumeral(length) {
  const res = parseFloat(length);
  return isFiniteNumber(res) ? res : undefined;
}

function hasNaturalDimensions(tagName) {
  // TODO: partial implementation.
  return false;
}

function getNaturalDimensions(tagName) {
  // TODO: partial implementation.
  return null;
}

/**
 * Whether an element with this layout inherently defines the size.
 * @param {!Layout} layout
 * @return {boolean}
 */
export function isLayoutSizeDefined(layout) {
  return (
    layout == Layout.FIXED ||
    layout == Layout.FIXED_HEIGHT ||
    layout == Layout.RESPONSIVE ||
    layout == Layout.FILL ||
    layout == Layout.FLEX_ITEM ||
    layout == Layout.FLUID ||
    layout == Layout.INTRINSIC
  );
}

/**
 * Whether an element with this layout has a fixed dimension.
 * @param {!Layout} layout
 * @return {boolean}
 */
export function isLayoutSizeFixed(layout) {
  return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
}

/**
 * Determines if value is of number type and finite.
 * NaN and Infinity are not considered a finite number.
 * String numbers are not considered numbers.
 * @param {*} value
 * @return {boolean}
 */
export function isFiniteNumber(value) {
  return typeof value === 'number' && isFinite(value);
}
