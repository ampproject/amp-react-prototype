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
import devAssert from './dev-assert.js';

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
 * @param {!AmpElementOptions} opts
 * @return {Amp.BaseElement}
 */
export default function ReactCompatibleBaseElement(Component, opts) {
  class ReactBaseElement {

    /**
     * @return {?Object|undefined}
     */
    static opts() {
      return opts;
    }

    /** @param {!AmpElement} element */
    constructor(element) {
      this.element = element;

      /** @private {?Node} */
      this.container_ = null;

      /** @private {?Component} */
      this.el_ = null;

      this.win = self;
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
      this.rerender_();
    }

    /** @override */
    layoutCallback() {
      const el = devAssert(this.el_);
      // TBD: this should be a property or even maybe a context property.
      el.setState({ prerender: false });
    }

    /** @override */
    mutatedAttributesCallback(mutations) {
      if (!this.el_) {
        return;
      }
      this.rerender_();
    }

    /** @override */
    mutatedChildrenCallback() {
      if (!this.el_) {
        return;
      }
      this.rerender_();
    }

    /** @override */
    onMeasureChanged() {
      const el = devAssert(this.el_);
      // TBD: If the component cares about its width, it has to do it
      // independently. Otherwise, it will break React-only mode.
      // el.setState({ layoutWidth: this.getLayoutWidth() });
    }

    /** @override */
    viewportCallback(inViewport) {
      const el = devAssert(this.el_);
      // TBD: Ditto: if it's important for the component to know intersection
      // with the viewport - it has to track it independently.
      // el.setState({ inViewport });
    }

    /** @private */
    rerender_() {
      if (!this.container_) {
        // TBD: create container/shadow in the amp-element.js?
        if (opts.children) {
          this.container_ = this.element.attachShadow({mode: 'open'});
        } else {
          this.container_ = this.getWin().document.createElement('i-amphtml-c');
          // TBD: we only want `position:absolute` in a few layouts really.
          this.container_.style.position = 'absolute';
          this.container_.style.top = '0';
          this.container_.style.left = '0';
          this.container_.style.right = '0';
          this.container_.style.bottom = '0';
          this.element.appendChild(this.container_);
        }
      }

      const props = collectProps(this.element, opts);

      // While this "creates" a new element, React's diffing will not create
      // a second instance of Component. Instead, the existing one already
      // rendered into this element will be reusued.
      const v = React.createElement(Component, props);
      this.el_ = ReactDOM.render(v, this.container_);
    }

    /** Mocks of the BaseElement base class methods/props */

    getWin() {
      return this.win;
    }

    getViewport() {
      return {
        getWidth() {
          return window.innerWidth;
        },
      };
    }

    getLayoutWidth() {
      return this.clientWidth;
    }

    /** Unimplemented things */

    get preconnect() {
      throw new Error('unimplemented');
    }

    signals() {
      throw new Error('unimplemented');
    }

    getDefaultActionAlias() {
      throw new Error('unimplemented');
    }

    getLayoutPriority() {
      throw new Error('unimplemented');
    }

    updateLayoutPriority() {
      throw new Error('unimplemented');
    }

    getLayout() {
      throw new Error('unimplemented');
    }

    getPageLayoutBox() {
      throw new Error('unimplemented');
    }

    getAmpDoc() {
      throw new Error('unimplemented');
    }

    getVsync() {
      throw new Error('unimplemented');
    }

    getConsentPolicy() {
      throw new Error('unimplemented');
    }

    isLayoutSupported(layout) {
      throw new Error('unimplemented');
    }

    isAlwaysFixed() {
      throw new Error('unimplemented');
    }

    isInViewport() {
      throw new Error('unimplemented');
    }

    upgradeCallback() {
      throw new Error('unimplemented');
    }

    createdCallback() {
      throw new Error('unimplemented');
    }

    firstAttachedCallback() {
      throw new Error('unimplemented');
    }

    preconnectCallback(opt_onLayout) {
      throw new Error('unimplemented');
    }

    detachedCallback() {
      throw new Error('unimplemented');
    }

    prerenderAllowed() {
      throw new Error('unimplemented');
    }

    createPlaceholderCallback() {
      throw new Error('unimplemented');
    }

    createLoaderLogoCallback() {
      throw new Error('unimplemented');
    }

    renderOutsideViewport() {
      throw new Error('unimplemented');
    }

    idleRenderOutsideViewport() {
      throw new Error('unimplemented');
    }

    isRelayoutNeeded() {
      throw new Error('unimplemented');
    }

    firstLayoutCompleted() {
      throw new Error('unimplemented');
    }

    pauseCallback() {
      throw new Error('unimplemented');
    }

    resumeCallback() {
      throw new Error('unimplemented');
    }

    unlayoutCallback() {
      throw new Error('unimplemented');
    }

    unlayoutOnPause() {
      throw new Error('unimplemented');
    }

    reconstructWhenReparented() {
      throw new Error('unimplemented');
    }

    activate(unusedInvocation) {
      throw new Error('unimplemented');
    }

    activationTrust() {
      throw new Error('unimplemented');
    }

    loadPromise(element) {
      throw new Error('unimplemented');
    }

    initActionMap_() {
      throw new Error('unimplemented');
    }

    registerAction(alias, handler, minTrust = ActionTrust.HIGH) {
      throw new Error('unimplemented');
    }

    registerDefaultAction(
      handler,
      alias = DEFAULT_ACTION,
      minTrust = ActionTrust.HIGH
    ) {
      throw new Error('unimplemented');
    }

    executeAction(invocation, unusedDeferred) {
      throw new Error('unimplemented');
    }

    getDpr() {
      throw new Error('unimplemented');
    }

    propagateAttributes(attributes, element, opt_removeMissingAttrs) {
      throw new Error('unimplemented');
    }

    forwardEvents(events, element) {
      throw new Error('unimplemented');
    }

    getPlaceholder() {
      throw new Error('unimplemented');
    }

    togglePlaceholder(state) {
      throw new Error('unimplemented');
    }

    getFallback() {
      throw new Error('unimplemented');
    }

    toggleFallback(state) {
      throw new Error('unimplemented');
    }

    toggleLoading(state, opt_force) {
      throw new Error('unimplemented');
    }

    isLoadingReused() {
      throw new Error('unimplemented');
    }

    getOverflowElement() {
      throw new Error('unimplemented');
    }

    renderStarted() {
      throw new Error('unimplemented');
    }

    getRealChildNodes() {
      throw new Error('unimplemented');
    }

    getRealChildren() {
      throw new Error('unimplemented');
    }

    applyFillContent(element, opt_replacedContent) {
      throw new Error('unimplemented');
    }

    getViewport() {
      throw new Error('unimplemented');
    }

    getIntersectionElementLayoutBox() {
      throw new Error('unimplemented');
    }

    changeHeight(newHeight) {
      throw new Error('unimplemented');
    }

    collapse() {
      throw new Error('unimplemented');
    }

    attemptCollapse() {
      throw new Error('unimplemented');
    }

    attemptChangeHeight(newHeight) {
      throw new Error('unimplemented');
    }

    attemptChangeSize(newHeight, newWidth, opt_event) {
      throw new Error('unimplemented');
    }

    measureElement(measurer) {
      throw new Error('unimplemented');
    }

    mutateElement(mutator, opt_element) {
      throw new Error('unimplemented');
    }

    measureMutateElement(measurer, mutator, opt_element) {
      throw new Error('unimplemented');
    }

    collapsedCallback(unusedElement) {
      throw new Error('unimplemented');
    }

    expand() {
      throw new Error('unimplemented');
    }

    expandedCallback(unusedElement) {
      throw new Error('unimplemented');
    }

    onLayoutMeasure() {
      throw new Error('unimplemented');
    }

    onMeasureChanged() {
      throw new Error('unimplemented');
    }

    user() {
      throw new Error('unimplemented');
    }
  }

  return AmpElementFactory(ReactBaseElement);
}


/**
 * @param {!Element} element
 * @param {!AmpElementOptions} opts
 * @return {!Object}
 */
function collectProps(element, opts) {
  const defs = opts.attrs || {};
  const props = {};

  // Attributes.
  const { attributes } = element;
  for (let i = 0, l = attributes.length; i < l; i++) {
    const { name, value } = attributes[i];
    const def = defs[name];
    if (def) {
      const v = def.type == 'number' ? Number(value) : value;
      props[def.prop] = v;
    } else if (name == 'style') {
      props.style = collectStyle(element);
    } else {
      props[name] = value;
    }
  }

  // Children.
  // There are plain "children" and there're slotted children assigned
  // as separate properties. Thus in a carousel the plain "children" are
  // slides, and the "arrowNext" children are passed via a "arrowNext"
  // property.
  if (opts.children) {
    const children = [];
    for (let i = 0; i < element.children.length; i++) {
      const childElement = element.children[i];
      const match = matchChild(childElement, opts.children);
      if (!match) {
        continue;
      }
      // TBD: assign keys, reuse slots, etc.
      const list =
        match == 'children' ?
        children :
        (props[match] || (props[match] = []));
      const slot = `i-amphtml-${match}-${list.length}`;
      childElement.setAttribute('slot', slot);
      const child = React.createElement('slot', {name: slot});
      list.push(child);
    }
    props.children = children;
  }

  return props;
}

/**
 * @param {!Element} element
 * @param {!Object} defs
 * @return {?string}
 */
function matchChild(element, defs) {
  // TBD: a little slow to do this repeatedly.
  for (const match in defs) {
    const expr = defs[match];
    if (element.matches(expr)) {
      return match;
    }
  }
  return null;
}

/**
 * @param {!Element} element
 * @return {!Object}
 */
function collectStyle(element) {
  const { style } = element;
  const styleMap = {};

  for (let i = 0, l = style.length; i < l; i++) {
    const name = style[i];
    styleMap[dashToCamelCase(name)] = style.getPropertyValue(name);
  }

  return styleMap;
}

function toUpperCase(_match, character) {
  return character.toUpperCase();
}

function dashToCamelCase(name) {
  return name.replace(/-([a-z])/g, toUpperCase);
}
