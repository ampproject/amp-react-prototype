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

import userAssert from './dev-assert.js';

export default function AmpElementFactory(BaseElement) {
  return class AmpElement extends HTMLElement {
    constructor() {
      super(...arguments);

      /** @private @const {!Object} */
      this.opts_ = BaseElement.opts() || {};

      this.laidOut_ = false;
      this.isVisible_ = false;
      this.implementation_ = new BaseElement(this);
      this.intersection_ = null;
      this.mutations_ = null;
    }

    connectedCallback() {
      this.classList.add('i-amphtml-element');
      applyStaticLayout(this);
      this.implementation_.buildCallback();

      // TBD: does it work here?
      const io = new IntersectionObserver(
        this.handleIntersectionObserver_.bind(this)
      );
      this.intersection_ = io;
      io.observe(this, { threshold: 0 });

      const moOptions = {};
      const opts = this.opts_;
      if (opts.attrs) {
        // TODO: more specific attribute filters to reduce amount of mutates.
        moOptions['attributes'] = true;
      }
      if (opts.children) {
        // TBD: this is actually not enough. Need to observe children
        // attributes as well.
        moOptions['childList'] = true;
      }

      if (Object.keys(moOptions).length > 0) {
        const mo = new MutationObserver(this.handleMutationObserver_.bind(this));
        this.mutations_ = mo;
        mo.observe(this, moOptions);
      }

      this.mutated_();
    }

    disconnectedCallback() {
      if (this.intersection_) {
        this.intersection_.disconnect();
        this.intersection_ = null;
      }
      if (this.mutations_) {
        this.mutations_.disconnect();
        this.mutations_ = null;
      }
    }

    activate() {
      this.executeAction({action: 'activate'});
    }

    executeAction(invocation) {
      this.implementation_.executeAction(invocation);
    }

    handleIntersectionObserver_(records) {
      const last = records.length
        ? records[records.length - 1]
        : { isIntersecting: false };
      const isVisible = last.isIntersecting;

      if (isVisible && !this.laidOut_) {
        this.laidOut_ = true;
        this.implementation_.layoutCallback();
        this.mutated_();
      }
      if (isVisible !== this.isVisible_) {
        this.isVisible_ = isVisible;
        this.implementation_.viewportCallback(isVisible);
        this.mutated_();
      }
    }

    handleMutationObserver_(records) {
      const attrs = { __proto__: null };
      let childrenChanged = false;
      for (const r of records) {
        switch (r.type) {
          case 'attributes':
            const { attributeName } = r;
            attrs[attributeName] = this.getAttribute(attributeName);
            break;
          case 'childList':
            childrenChanged = true;
            break;
        }
      }

      this.implementation_.mutatedAttributesCallback(attrs);
      if (childrenChanged) {
        this.implementation_.mutatedChildrenCallback();
      }
      this.mutated_();
    }

    mutated_() {
      if (this.mutations_) {
        // Flush mutation observer to avoid recursive mutations.
        this.mutations_.takeRecords();
      }
    }
  };
}

/** Copy paste from AMP */

const Layout = {
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

function applyStaticLayout(element) {
  const layoutAttr = element.getAttribute('layout');
  const widthAttr = element.getAttribute('width');
  const heightAttr = element.getAttribute('height');
  const sizesAttr = element.getAttribute('sizes');
  const heightsAttr = element.getAttribute('heights');

  // Input layout attributes.
  const inputLayout = layoutAttr ? parseLayout(layoutAttr) : null;
  userAssert(inputLayout !== undefined, 'Unknown layout: %s', layoutAttr);
  /** @const {string|null|undefined} */
  const inputWidth =
    widthAttr && widthAttr != 'auto' ? parseLength(widthAttr) : widthAttr;
  userAssert(inputWidth !== undefined, 'Invalid width value: %s', widthAttr);
  /** @const {string|null|undefined} */
  const inputHeight =
    heightAttr && heightAttr != 'fluid' ? parseLength(heightAttr) : heightAttr;
  userAssert(inputHeight !== undefined, 'Invalid height value: %s', heightAttr);

  // Effective layout attributes. These are effectively constants.
  let width = inputWidth;
  let height = inputHeight;
  let layout;

  // Calculate effective layout.
  if (inputLayout) {
    layout = inputLayout;
  } else if (!width && !height) {
    layout = Layout.CONTAINER;
  } else if (height == 'fluid') {
    layout = Layout.FLUID;
  } else if (height && (!width || width == 'auto')) {
    layout = Layout.FIXED_HEIGHT;
  } else if (height && width && (sizesAttr || heightsAttr)) {
    layout = Layout.RESPONSIVE;
  } else {
    layout = Layout.FIXED;
  }

  // Verify layout attributes.
  if (
    layout == Layout.FIXED ||
    layout == Layout.FIXED_HEIGHT ||
    layout == Layout.RESPONSIVE ||
    layout == Layout.INTRINSIC
  ) {
    userAssert(height, 'Expected height to be available: %s', heightAttr);
  }
  if (layout == Layout.FIXED_HEIGHT) {
    userAssert(
      !width || width == 'auto',
      'Expected width to be either absent or equal "auto" ' +
        'for fixed-height layout: %s',
      widthAttr
    );
  }
  if (
    layout == Layout.FIXED ||
    layout == Layout.RESPONSIVE ||
    layout == Layout.INTRINSIC
  ) {
    userAssert(
      width && width != 'auto',
      'Expected width to be available and not equal to "auto": %s',
      widthAttr
    );
  }

  if (layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    userAssert(
      getLengthUnits(width) == getLengthUnits(height),
      'Length units should be the same for width and height: %s, %s',
      widthAttr,
      heightAttr
    );
  } else {
    userAssert(
      heightsAttr === null,
      'Unexpected "heights" attribute for none-responsive layout'
    );
  }

  // Apply UI.
  element.classList.add(getLayoutClass(layout));
  if (isLayoutSizeDefined(layout)) {
    element.classList.add('i-amphtml-layout-size-defined');
  }
  if (layout == Layout.NODISPLAY) {
    // CSS defines layout=nodisplay automatically with `display:none`. Thus
    // no additional styling is needed.
    toggle(element, false);
    // TODO(jridgewell): Temporary hack while SSR still adds an inline
    // `display: none`
    element['style']['display'] = '';
  } else if (layout == Layout.FIXED) {
    setStyles(element, { width, height });
  } else if (layout == Layout.FIXED_HEIGHT) {
    setStyle(element, 'height', dev().assertString(height));
  } else if (layout == Layout.RESPONSIVE) {
    const sizer = element.ownerDocument.createElement('i-amphtml-sizer');
    sizer.setAttribute('slot', 'i-amphtml-sizer');
    setStyles(sizer, {
      paddingTop:
        (getLengthNumeral(height) / getLengthNumeral(width)) * 100 + '%',
    });
    element.insertBefore(sizer, element.firstChild);
    element.sizerElement = sizer;
  } else if (layout == Layout.INTRINSIC) {
    // Intrinsic uses an svg inside the sizer element rather than the padding
    // trick Note a naked svg won't work becasue other thing expect the
    // i-amphtml-sizer element
    const sizer = htmlFor(element)`
      <i-amphtml-sizer class="i-amphtml-sizer" slot="i-amphtml-sizer">
        <img alt="" role="presentation" aria-hidden="true"
             class="i-amphtml-intrinsic-sizer" />
      </i-amphtml-sizer>`;
    const intrinsicSizer = sizer.firstElementChild;
    intrinsicSizer.setAttribute(
      'src',
      `data:image/svg+xml;charset=utf-8,<svg height="${height}" width="${width}" xmlns="http://www.w3.org/2000/svg" version="1.1"/>`
    );
    element.insertBefore(sizer, element.firstChild);
    element.sizerElement = sizer;
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
      setStyle(element, 'width', width);
    }
    if (height) {
      setStyle(element, 'height', height);
    }
  } else if (layout == Layout.FLUID) {
    element.classList.add('i-amphtml-layout-awaiting-size');
    if (width) {
      setStyle(element, 'width', width);
    }
    setStyle(element, 'height', 0);
  }
  // Mark the element as having completed static layout, in case it is cloned
  // in the future.
  element.setAttribute('i-amphtml-layout', layout);
  return layout;
}

function setStyle(element, style, value) {
  element.style[style] = value;
}

function setStyles(element, styles) {
  for (const style in styles) {
    setStyle(element, style, styles[style]);
  }
}

function toggle(element, display) {
  if (display) {
    element.removeAttribute('hidden');
  } else {
    element.setAttribute('hidden', '');
  }
}

function getLayoutClass(layout) {
  return 'i-amphtml-layout-' + layout;
}

function parseLayout(layout) {
  return layout;
}

function parseLength(s) {
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

function isLayoutSizeDefined(layout) {
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

function getLengthUnits(length) {
  const m = userAssert(
    length.match(/[a-z]+/i),
    'Failed to read units from %s',
    length
  );
  return m[0];
}

function getLengthNumeral(length) {
  const res = parseFloat(length);
  return res === res ? res : undefined;
}
