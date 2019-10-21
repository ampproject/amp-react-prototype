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
import {withAmpContext} from './amp-context.js';

const {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = preactHooks;

let autokeyCounter = 0;


export const AmpAccordionContext = preact.createContext();


export function AmpAccordion(props) {
  const {multiple} = props;
  const [expanded, setExpanded] = useState({});
  return preact.createElement(
    'div',
    {
      ...props,
    },
    preact.createElement(
      AmpAccordionContext.Provider,
      {
        ...props,
        value: {
          multiple,
          // TBD: controlled values require override of properties.
          expanded,
          setExpanded,
        },
      }
    )
  );
}

AmpAccordion.Section = function(props) {
  const autokey = useRef(++autokeyCounter).current;
  const {expanded: expandedProp, defaultExpanded, onExpand} = props;
  const accordionContext = useContext(AmpAccordionContext);
  const {expanded: expandedMap, setExpanded: setExpandedMap, multiple} = accordionContext;
  const expanded =
      expandedProp !== undefined ? expandedProp :
      Object.keys(expandedMap).length > 0 ? !!expandedMap[autokey] :
      defaultExpanded !== undefined ? defaultExpanded :
      false;
  const sectionProps = {
    ...props,
    header: undefined,
    expanded,
  };
  const headerProps = {
    onClick: () => {
      if (onExpand) {
        onExpand();
      }
      toggleExpanded(autokey, multiple, expandedMap, setExpandedMap);
    },
  };
  return preact.createElement(
    props.type || props.tagName || 'section',
    sectionProps,
    [
      preact.createElement(
        'span',
        headerProps,
        props.header
      ),
      preact.createElement(
        withAmpContext,
        {
          renderable: expanded,
          playable: expanded,
        },
        preact.createElement(
          'div',
          {
            style: {
              display: expanded ? 'contents' : 'none',
            },
          },
          props.children
        )
      ),
    ]);
}

function toggleExpanded(autokey, multiple, expandedMap, setExpandedMap) {
  const current = !!expandedMap[autokey];
  if (multiple) {
    setExpandedMap(Object.assign(
      {},
      expandedMap,
      {[autokey]: !current}
    ));
  } else {
    setExpandedMap({[autokey]: !current});
  }
}


const AmpReactAccordion = ReactCompatibleBaseElement(AmpAccordion, {
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
      const sectionChildren = element.querySelectorAll(':scope > section');
      const postRender = () => {
        // Skip mutations to avoid cycles.
        mu.takeRecords();
      };
      sectionChildren.forEach((section, index) => {
        // TODO: make it a lot more efficient.
        const [headerElement, ...contentElements] = section.children;
        // TODO: check that an section is not within another section.
        const header = preact.createElement(
          Slot,
          {
            name: `section[${index}]>header`,
            retarget: true,
            assignedElements: [headerElement],
            postRender,
          }
        );
        const content = preact.createElement(
          Slot,
          {
            name: `section[${index}]>content`,
            retarget: false,
            assignedElements: contentElements,
            postRender,
          }
        );
        const props = {
          defaultExpanded: section.hasAttribute('expanded'),
          type: Slot,
          name: `section[${index}]`,
          retarget: true,
          assignedElements: [section],
          postRender,
          header,
        };
        children.push(preact.createElement(
          AmpAccordion.Section,
          props,
          content
        ));
      });

      reactBaseElement.mutateProps({children});
    };
    // TODO: no need to observe subtree: 1-level-deep is better to observe manually
    // node-by-node.
    mu.observe(element, {attributeFilter: ['section', 'expanded'], subtree: true});

    // Run the first build.
    rebuild();
  },
});
customElements.define('amp-react-accordion', AmpReactAccordion);
