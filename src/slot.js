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

import {
  AmpContext,
  withAmpContext,
} from './amp-context.js';
import {useMountEffect} from './amp-react-utils.js';

const {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} = preactHooks;


/**
 * @param {!Element} element
 * @param {string} name
 * @param {!Object|undefined} props
 * @return {!ReactElement}
 */
export function createSlot(element, name, props) {
  element.setAttribute('slot', name);
  const slotProps = Object.assign({name}, props || {});
  return preact.createElement(Slot, slotProps);
}

/**
 * Slot component.
 */
export function Slot(props) {
  const context = useContext(AmpContext);
  const ref = useRef();
  const slotProps = Object.assign({}, props, {ref});
  useEffect(() => {
    const slot = ref.current;
    const assignedElements = getAssignedElements(props, slot);
    slot.__assignedElements = assignedElements;

    // Retarget slots and content.
    if (props.retarget) {
      // TBD: retargetting here is for:
      // 1. `disabled` doesn't apply inside subtrees. This makes it more like
      //    `hidden`. Similarly do other attributes.
      // 2. Re-propagate click events to slots since React stops propagation.
      //    See https://github.com/facebook/react/issues/9242.
      assignedElements.forEach(node => {
        // Basic attributes:
        const { attributes } = slot;
        for (let i = 0, l = attributes.length; i < l; i++) {
          const { name, value } = attributes[i];
          if (name == 'name') {
            // This is the slot's name.
          } else if (!node.hasAttribute(name)) {
            // TBD: this means that attributes can be rendered only once?
            // TBD: what do we do with style and class?
            node.setAttribute(name, value);
          }
        }
        // Boolean attributes:
        node.disabled = slot.hasAttribute('disabled');
        node.hidden = slot.hasAttribute('hidden');
        toggleAttribute(node, 'selected', slot.hasAttribute('selected'));
        if (!node['i-amphtml-event-distr']) {
          node['i-amphtml-event-distr'] = true;
          node.addEventListener('click', e => {
            // Stop propagation on the original event to avoid deliving this
            // event twice with frameworks that correctly work with composed
            // boundaries.
            e.stopPropagation();
            e.preventDefault();
            const event = new Event('click', {
              bubbles: true,
              cancelable: true,
              composed: false,
            });
            slot.dispatchEvent(event);
          });
        }
      });

    }

    const oldContext = slot['i-amphtml-context'];
    if (!objectsEqualShallow(oldContext, context)) {
      slot['i-amphtml-context'] = context;
      // TODO: Switch to fast child-node discover. See Revamp for the algo.
      const affectedNodes = [];
      assignedElements.forEach(node => {
        affectedNodes.push(...getAmpElements(node));
      });
      affectedNodes.forEach(node => {
        const event = new Event('i-amphtml-context-changed', {
          bubbles: false,
          cancelable: true,
          composed: true,
        });
        event.data = context;
        node.dispatchEvent(event);
      });
    }

    // Post-rendering cleanup, if any.
    if (props.postRender) {
      props.postRender();
    }
  });

  // Register an unmount listener. This can't be joined with the previous
  // useEffect, because it must only be run once while the previous needs to
  // run every render.
  useMountEffect(() => {
    return () => {
      const slot = ref.current;
      const affectedNodes = [];
      getAssignedElements(props, slot).forEach(node => {
        affectedNodes.push(...getAmpElements(node));
      });
      affectedNodes.forEach(node => {
        const event = new Event('i-amphtml-unmounted', {
          bubbles: false,
          cancelable: true,
          composed: true,
        });
        node.dispatchEvent(event);
      });
    };
  });

  // TBD: Just for debug for now. but maybe can also be used for hydration?
  slotProps['i-amphtml-context'] = JSON.stringify(context);
  return preact.createElement('slot', slotProps);
}

function objectsEqualShallow(o1, o2) {
  if (o1 === null && o2 === null ||
      o1 === undefined && o2 === undefined) {
    return true;
  }
  if (o1 == null || o2 == null) {
    return false;
  }
  for (const k in o1) {
    if (!Object.is(o1[k], o2[k])) {
      return false;
    }
  }
  for (const k in o2) {
    if (!Object.is(o1[k], o2[k])) {
      return false;
    }
  }
  return true;
}

function getAmpElements(root) {
  const elements = [...root.querySelectorAll('.i-amphtml-element')];
  if (root.matches('.i-amphtml-element')) {
    elements.unshift(root);
  }
  return elements;
}

function getAssignedElements(props, slotElement) {
  return props.assignedElements || slotElement.assignedElements();
}

function toggleAttribute(element, attr, on) {
  if (on) {
    element.setAttribute(attr, '');
  } else {
    element.removeAttribute(attr);
  }
}
