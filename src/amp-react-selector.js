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

const {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = preactHooks;


export const AmpSelectorContext = preact.createContext();


export function AmpSelector(props) {
  const {multiple, value, defaultValue} = props;
  const [selected, setSelectedState] = useState(
    value ? [].concat(value) :
    defaultValue ? [].concat(defaultValue) :
    []);
  const setSelectedRef = useRef(value => {
    if (props.onChange) {
      props.onChange({target: {value: multiple ? value : value[0]}});
    }
    setSelectedState(value);
  });
  return preact.createElement(
    props.tagName || 'div',
    {
      ...props,
    },
    preact.createElement(
      AmpSelectorContext.Provider,
      {
        ...props,
        value: {
          multiple,
          // TBD: controlled values require override of properties.
          selected: value ? [].concat(value) : selected,
          setSelected: setSelectedRef.current,
        },
      }
    )
  );
}

AmpSelector.Option = function(props) {
  const {option} = props;
  const selectorContext = useContext(AmpSelectorContext);
  const {selected, setSelected, multiple} = selectorContext;
  const optionProps = {
    ...props,
    option,
    selected: selected.includes(option),
    onClick: () => selectOption(option, multiple, selected, setSelected),
  };
  if (props.render) {
    return props.render(optionProps);
  }
  return preact.createElement(
    props.tagName || 'div',
    optionProps,
    props.children);
}

function selectOption(option, multiple, selected, setSelected) {
  if (multiple) {
    setSelected(
      selected.includes(option) ?
      selected.filter(v => v != option) :
      selected.concat(option));
  } else {
    if (!selected.includes(option)) {
      setSelected([option]);
    }
  }
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
          render: props => {
            // TBD: This is sort of similar to our Slot logic.
            if (props.selected) {
              child.setAttribute('selected', '');
            } else {
              child.removeAttribute('selected');
            }
            child.onclick = props.onClick;

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
    setTimeout(rebuild);
  },
});
customElements.define('amp-react-selector', AmpReactSelector);
