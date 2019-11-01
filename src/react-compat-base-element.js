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
import {
  AmpContext,
  withAmpContext,
} from './amp-context.js';
import {Slot, createSlot} from './slot.js';
import {useMountEffect} from './amp-react-utils.js';

const {
  useContext,
  useEffect,
  useRef,
} = preactHooks;

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

      this.customProps_ = {};

      this.win = self;

      this.scheduledRender_ = 0;

      this.context_ = {
        renderable: false,
        playable: false,
      };

      // TBD: Yep. Very ugly. See notes in `opts` decl in
      // `amp-react-lightbox.js`.
      if (opts.init) {
        const props = opts.init(this);
        if (props) {
          Object.assign(this.customProps_, props);
        }
      }
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
      this.scheduleRender_();
      this.element.addEventListener('i-amphtml-context-changed', e => {
        e.stopPropagation();
        this.scheduleRender_();
      });
      this.element.addEventListener('i-amphtml-unmounted', e => {
        e.stopPropagation();
        this.unmount_();
      });
    }

    /** @override */
    layoutCallback() {
      this.context_.renderable = true;
      this.context_.playable = true;
      this.scheduleRender_();
    }

    /** @override */
    mutatedAttributesCallback(mutations) {
      if (!this.container_) {
        return;
      }
      this.scheduleRender_();
    }

    /** @override */
    mutatedChildrenCallback() {
      if (!this.container_) {
        return;
      }
      this.scheduleRender_();
    }

    /** @override */
    onMeasureChanged() {
      // TBD: If the component cares about its width, it has to do it
      // independently. Otherwise, it will break React-only mode.
    }

    /** @override */
    viewportCallback(inViewport) {
      // TBD: Ditto: if it's important for the component to know intersection
      // with the viewport - it has to track it independently.
    }

    mutateProps(props) {
      Object.assign(this.customProps_, props);
      this.scheduleRender_();
    }

    /** @private */
    scheduleRender_() {
      if (this.scheduledRender_ === 0) {
        this.scheduledRender_ = requestAnimationFrame(() => {
          this.scheduledRender_ = 0;
          this.rerender_();
        });
      }
    }

    /** @private */
    unmount_() {
      if (this.scheduledRender_ !== 0) {
        cancelAnimationFrame(this.scheduledRender_);
        this.scheduledRender_ = 0;
      }
      if (this.container_) {
        preact.render(preact.Fragment, this.container_);
      }
    }

    /** @private */
    rerender_() {
      if (!this.container_) {
        // TBD: create container/shadow in the amp-element.js?
        this.container_ = this.getWin().document.createElement(
          opts.template ? 'template' : 'i-amphtml-c');
        // TBD: we want `position:absolute` in a few layouts only.
        this.container_.style.display = 'block';
        this.container_.style.position = 'absolute';
        this.container_.style.top = '0';
        this.container_.style.left = '0';
        this.container_.style.right = '0';
        this.container_.style.bottom = '0';
        this.customProps_.style = {width: '100%', height: '100%'};
        if (opts.template) {
          // Do not attach container. It will be used as a disconnected
          // fragment, never attached to DOM. This mode is useful for more
          // in-depth DOM mapping where simple SD slot distribution is not
          // applicable because of SD limitations. For instance, a
          // `amp-selector > ul > li[option]` structure where `li` is a mapped
          // child, separated from the `amp-selector` by a necessary `ul`
          // intermediary. The `li[option]` is, conceptually, still a mapped
          // slot, but SD does not allow distribution of nested children.
        } else if (opts.children || opts.passthrough) {
          const shadowRoot = this.element.attachShadow({mode: 'open'});
          const sizerSlot = this.getWin().document.createElement('slot');
          sizerSlot.setAttribute('name', 'i-amphtml-sizer');
          shadowRoot.appendChild(sizerSlot);
          shadowRoot.appendChild(this.container_);
        } else {
          this.element.appendChild(this.container_);
        }
      }

      const props = {
        ...collectProps(this.element, opts),
        ...this.customProps_,
      };

      // While this "creates" a new element, React's diffing will not create
      // a second instance of Component. Instead, the existing one already
      // rendered into this element will be reusued.
      const cv = preact.createElement(Component, props);

      const context = getContextFromDom(this.element, this.context_);
      const v = preact.createElement(withAmpContext, context, cv);

      preact.render(v, this.container_);
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
      if (opts.executeAction) {
        return opts.executeAction(this, invocation);
      }
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
  const props = {};

  // Class.
  if (opts.className) {
    props['className'] = opts.className;
  }

  // Attributes.
  const defs = opts.attrs || {};
  for (const name in defs) {
    const def = defs[name];
    const value = element.getAttribute(name);
    if (value == null) {
      if (def.default != null) {
        props[def.prop] = def.default;
      }
    } else {
      const v =
        def.type == 'number' ?
        Number(value) :
        def.type == 'Element' ?
        // TBD: what's the best way for element referencing compat between
        // React and AMP? Currently modeled as a Ref.
        {current: element.getRootNode().getElementById(value)} :
        value;
      props[def.prop] = v;
    }
  }

  // Children.
  // There are plain "children" and there're slotted children assigned
  // as separate properties. Thus in a carousel the plain "children" are
  // slides, and the "arrowNext" children are passed via a "arrowNext"
  // property.
  if (opts.passthrough) {
    props.children = [preact.createElement(Slot)];
  } else if (opts.children) {
    const children = [];
    for (let i = 0; i < element.children.length; i++) {
      const childElement = element.children[i];
      const match = matchChild(childElement, opts.children);
      if (!match) {
        continue;
      }
      const def = opts.children[match];
      const slotProps = typeof def == 'object' && def.props || {};

      // TBD: assign keys, reuse slots, etc.
      if (def.single) {
        props[match] =
          createSlot(childElement, `i-amphtml-${match}`, slotProps);
      } else {
        const list =
          match == 'children' ?
          children :
          (props[match] || (props[match] = []));
        list.push(createSlot(
          childElement, `i-amphtml-${match}-${list.length}`, slotProps));
      }
    }
    props.children = children;
  }

  // Dependencies.
  // TBD: what would really happen is that we will subscribe to dependencies
  // via revamp.
  // TBD: direct props vs context props.
  if (opts.deps) {
    props.deps = {};
    opts.deps.forEach(id => {
      props.deps[id] = resolveDep(id);
    });
  }

  return props;
}

/**
 * Stub implementation. This will actually be something very different.
 * @param {!Id<T>} id
 * @return {?T}
 */
function resolveDep(id) {
  switch (id) {
    case 'backButton':
      class BackButtonMarkerFake {
        constructor() {
          this.closed = false;
          /** @type {?function()} */
          this.onPop = null;

          /** @private {boolean} */
          this.popped_ = false;
          this.popHandler_ = () => {
            this.popped_ = true;
            this.pop();
          };
          window.addEventListener('popstate', this.popHandler_);
          history.pushState({index: 1}, '');
        }

        pop() {
          if (this.closed) {
            return;
          }
          this.closed = true;
          if (this.onPop) {
            this.onPop();
            this.onPop = null;
          }
          if (!this.popped_) {
            this.popped_ = true;
            history.go(-1);
          }
          if (this.popHandler_) {
            window.removeEventListener('popstate', this.popHandler_);
            this.popHandler_ = null;
          }
        }
      }
      class BackButtonServiceFake {
        /** @return BackButtonMarker */
        push() {
          return new BackButtonMarkerFake();
        }
      }
      return new BackButtonServiceFake();
  }
  return null;
}

/**
 * @param {!Element} element
 * @param {!Object} defs
 * @return {?string}
 */
function matchChild(element, defs) {
  if (/^I-/.test(element.tagName) ||
      element.hasAttribute('placeholder') ||
      element.hasAttribute('fallback') ||
      element.hasAttribute('i-amphtml')) {
    return null;
  }
  // TBD: a little slow to do this repeatedly.
  for (const match in defs) {
    const def = defs[match];
    const selector = typeof def == 'string' ? def : def.selector;
    if (element.matches(selector)) {
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

function getContextFromDom(node, context) {
  // TBD: This can be made a lot faster using effects and dedicated context
  // tree in AMP. See Revamp.

  // Go up the DOM hierarchy. Traverse Shadow DOM.
  let n = node;
  while (n) {
    const nodeContext = n['i-amphtml-context'];
    if (nodeContext) {
      Object.assign(context, nodeContext);
      break;
    }
    n = n.assignedSlot || n.parentNode || n.host;
  }

  return context;
}
