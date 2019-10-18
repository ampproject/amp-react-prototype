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
import {useResizeEffect, useStateFromProp} from './amp-react-utils.js';

const {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = preactHooks;

const LINE_HEIGHT_EM = 1.15;


export function AmpFitText(props) {
  const minFontSize = props.minFontSize || 6;
  const maxFontSize = props.maxFontSize || 72;

  const containerRef = useRef();
  const contentRef = useRef();
  const fontSizeRef = useRef();

  // TBD: hide the content on mount to reduce the font-size flashing.
  useLayoutEffect(() => {
    const el = contentRef.current;
    el.style.visibility = 'hidden';
  }, [/*mount only*/]);

  // TBD: there's an obvious delay here for async resize to arrive.
  useResizeEffect(containerRef, (maxWidth, maxHeight) => {
    const container = contentRef.current;
    const el = contentRef.current;

    // Reset overflow.
    el.style.overflow = '';
    el.style.display = '';
    el.style.webkitBoxOrient = '';
    el.style.webkitLineClamp = '';
    el.style.maxHeight = '';

    // TBD: Yes. This is horrible from blocking-layout point of view. But no
    // good way to do this w/o complete clonning, which would be really hard
    // to do with Shadow DOM slots.
    const fontSize = calculateFontSize(
      el,
      maxHeight,
      maxWidth,
      minFontSize,
      maxFontSize
    );

    // TBD: have to update font size as a side effect directly. Otherwise,
    // the state update will cause cyclical dependency because the children
    // array changes on each re-render. Thus we also have to update the
    // `fontSizeRef` to ensure the follow-up rendering does not overwrite
    // the style.
    el.style.fontSize = fontSizeRef.current = `${fontSize}px`;

    // Overflow logic.
    if (el.offsetHeight > maxHeight) {
      // Overflown: set line clamp.
      const lineHeight = fontSize * LINE_HEIGHT_EM;
      const numberOfLines = Math.floor(maxHeight / lineHeight);
      el.style.overflow = 'hidden';
      el.style.display = '-webkit-box';
      el.style.webkitBoxOrient = 'vertical';
      el.style.webkitLineClamp = numberOfLines;
      el.style.maxHeight = `${lineHeight * numberOfLines}px`;
    }

    el.style.visibility = '';
  });

  return preact.createElement('div', {
    ...props,
    style: {
      ...props.style,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      justifyContent: 'center',
    },
    ref: containerRef,
  }, preact.createElement('div', {
    ref: contentRef,
    style: {
      lineHeight: LINE_HEIGHT_EM,
      fontSize: fontSizeRef.current || '',
    },
  }, props.children));
}

/**
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 * @private  Visible for testing only!
 */
export function calculateFontSize(
  measurer,
  expectedHeight,
  expectedWidth,
  minFontSize,
  maxFontSize
) {
  maxFontSize++;
  // Binomial search for the best font size.
  while (maxFontSize - minFontSize > 1) {
    const mid = Math.floor((minFontSize + maxFontSize) / 2);
    measurer.style.fontSize = `${mid}px`;
    const height = measurer.offsetHeight;
    const width = measurer.offsetWidth;
    if (height > expectedHeight || width > expectedWidth) {
      maxFontSize = mid;
    } else {
      minFontSize = mid;
    }
  }
  return minFontSize;
}


const AmpReactFitText = ReactCompatibleBaseElement(AmpFitText, {
  className: 'i-amphtml-fill-content i-amphtml-replaced-content',
  attrs: {
    'min-font-size': {
      prop: 'minFontSize',
      type: 'number',
    },
    'max-font-size': {
      prop: 'maxFontSize',
      type: 'number',
    },
  },
  passthrough: true,
});
customElements.define('amp-fit-text', AmpReactFitText);
