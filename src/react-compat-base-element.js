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

import AmpElementFactory from './amp-element.js';

/**
 * ReactCompatibleBaseElement is a compatibility wrapper around AMP's
 * BaseElement. It takes a Component to compose, and calls renders the
 * component with any state necessary.
 *
 * This code can be shared across multiple extensions, all they need to do is
 * supply the Component.
 *
 * This is only necessary in when in AMP pages. If we're in a Bento page,
 * this code is useless. We'll supply a CustomElement factory class that will
 * provide compatibilty between CE and React.
 *
 * @param {!React.Component} Component
 * @return {Amp.BaseElement}
 */
export default function ReactCompatibleBaseElement(Component) {
  class ReactBaseElement {
    /** @param {!AmpElement} element */
    constructor(element) {
      this.element = element;

      /** @private {?Component} */
      this.el_ = null;
    }

    /**
     * For demo purposes.
     * @override
     */
    renderOutsideViewport() {
      return false;
    }

    /** @override */
    isLayoutSupported() {
      return true;
    }

    /** @override */
    buildCallback() {
      const el = ReactDOM.render(React.createElement(Component, this.attributes_()), this.element);
      this.el_ = el;
      el.setState({layoutWidth: this.getLayoutWidth()});
      this.rerender_();
    }

    /** @override */
    layoutCallback() {
      const el = devAssert(this.el_);
      el.setState({prerender: false});
      this.rerender_();
    }

    /** @override */
    mutatedAttributesCallback(mutations) {
      if (!this.el_) {
        return;
      }

      // Mutating src should override existing srcset, so remove the latter.
      if (
        mutations['src'] &&
        !mutations['srcset'] &&
        this.element.hasAttribute('srcset')
      ) {
        this.element.removeAttribute('srcset');
      }
      this.rerender_();
    }

    /** @override */
    preconnectCallback(onLayout) {
      const el = devAssert(this.el_);
      el.ampPreconnectCallback(onLayout, this.preconnect);
    }

    /** @override */
    onMeasureChanged() {
      const el = devAssert(this.el_);
      el.setState({layoutWidth: this.getLayoutWidth()});
      this.rerender_();
    }

    /**
     * @private
     */
    rerender_() {
      // While this "creates" a new element, React's diffing will not create
      // a second instance of Component. Instead, the existing one already
      // rendered into this element will be reusued.
      const el = React.createElement(Component, this.attributes_());
      ReactDOM.render(el, this.element);
    }

    /**
     * @private
     * @return {!Object<string, string>}
     */
    attributes_() {
      const out = {};
      const {attributes} = this.element;
      for (let i = 0, l = attributes.length; i < l; i++) {
        const attr = attributes[i];
        out[attr.name] = attr.value;
      }
      out['i-amphtml-element'] = this;
      return out;
    }

    getViewport() {
      return {
        getWidth() {
          return window.innerWidth;
        }
      };
    }

    getLayoutWidth() {
      return this.clientWidth;
    }
  }

  return AmpElementFactory(ReactBaseElement);
}
