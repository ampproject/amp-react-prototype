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
import {Slot} from './slot.js';

const {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = preactHooks;


export const AmpSelectorContext = preact.createContext();


export function AmpSelector(props) {
  const {value, defaultValue} = props;
  const [selectedState, setSelectedState] = useState(
    value ? [].concat(value) :
    defaultValue ? [].concat(defaultValue) :
    []);
  // TBD: controlled values require override of properties.
  const selected = value ? [].concat(value) : selectedState;
  const selectOption = option => {
    const {multiple, onChange} = props;
    let newValue = null;
    if (multiple) {
      newValue =
        selected.includes(option) ?
          selected.filter(v => v != option) :
          selected.concat(option);
    } else if (!selected.includes(option)) {
      newValue = [option];
    }
    if (newValue) {
      setSelectedState(newValue);
      if (onChange) {
        onChange({target: {value: multiple ? newValue : newValue[0]}});
      }
    }
  };
  return preact.createElement(
    props.tagName || 'div',
    {
      ...props,
    },
    preact.createElement(
      AmpSelectorContext.Provider,
      {
        value: {
          selected,
          selectOption,
        },
      },
      props.children
    )
  );
}

AmpSelector.Option = function(props) {
  const {option} = props;
  const selectorContext = useContext(AmpSelectorContext);
  const {selected, selectOption} = selectorContext;
  const optionProps = {
    ...props,
    option,
    selected: selected.includes(option),
    onClick: () => selectOption(option),
  };
  if (props.render) {
    return props.render(optionProps);
  }
  return preact.createElement(
    props.type || props.tagName || 'div',
    optionProps,
    props.children);
}


const AmpReactSelector = ReactCompatibleBaseElement(AmpSelector, {
  className: 'i-amphtml-fill-content i-amphtml-replaced-content',
  attrs: {
  },
  template: true,
  // TODO: simply override ReactBaseElement instead.
  init(reactBaseElement) {
    const {element} = reactBaseElement;
    const mu = new MutationObserver(records => {
      rebuild();
    });
    const rebuild = () => {
      const children = [];
      const optionChildren = element.querySelectorAll('[option]');
      const value = [];
      optionChildren.forEach(child => {
        // TODO: check that an option is not within another option.
        const option = child.getAttribute('option');
        const props = {
          option,
          type: Slot,
          retarget: true,
          assignedElements: [child],
          postRender: () => {
            // Skip mutations to avoid cycles.
            mu.takeRecords();
          },
        };
        if (child.hasAttribute('selected')) {
          value.push(option);
        }
        children.push(preact.createElement(AmpSelector.Option, props));
      });

      reactBaseElement.mutateProps({defaultValue: value, children});
    };
    mu.observe(element, {attributeFilter: ['option', 'selected'], subtree: true});

    // Run the first build.
    rebuild();
  },
});
customElements.define('amp-react-selector', AmpReactSelector);
