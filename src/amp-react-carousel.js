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

import {AmpRoot} from './amp-root.js';
import ReactCompatibleBaseElement from './react-compat-base-element.js';
import {useStateFromProp} from './amp-react-utils.js';
import {withAmpContext} from './amp-context.js';

const {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = preactHooks;


export function AmpCarousel(props) {
  const slides = props.children || [];

  const [currentSlide, setCurrentSlide] =
    useStateFromProp(props.currentSlide || 0);

  const scrollerRef = useRef();

  // Note: this has to be useLayoutEffect, not useEffect.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    scroller.scrollLeft = scroller.offsetWidth * currentSlide;
  }, [currentSlide]);

  // Event. Don't need to be render-blocking.
  useEffect(() => {
    if (props.onSlideChange) {
      props.onSlideChange({currentSlide});
    }
  }, [currentSlide]);

  function scrollHandler() {
    // TBD: Is this a good idea to manage currentSlide via state? Amount of
    // re-rendering is very small and mostly affects `scrollLeft`, which is
    // not renderable at all.
    // TBD: Ideally we need to wait for "scrollend" event, that's still WIP
    // in most of browsers.
    const scroller = scrollerRef.current;
    const x = scroller.scrollLeft;
    const slide = Math.round(x / scroller.offsetWidth);
    setCurrentSlide(slide);
  }


  // Render. Imagine JSX here.

  // Creates scroller element with `overflow-x: auto`.
  const scroller = () => {
    const outs = {
      key: 'container',
      ref: scrollerRef,
      onScroll: scrollHandler,
    };
    outs['style'] = {
      border: '1px dashed lightgray',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowX: 'auto',
      overflowY: 'hidden',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      boxSizing: 'border-box',
      // TBD: smooth behavior causes a lot of `setState` problems.
      // scrollBehavior: 'smooth',
      WebkitOverflowScrolling: 'touch',
      scrollSnapType: 'x mandatory',
    };

    // All slides are rendered inside the scroller. It's absolutely
    // unimportant whether they are slots or actual children.
    const slideElements = slides.map((child, index) => {
      const outs = {};
      outs['style'] = {
        boxSizing: 'border-box',
        flex: '0 0 100%',
        height: '100%',
        border: '1px dashed lightpink',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        scrollSnapAlign: 'start',
      };
      return preact.createElement(
        withAmpContext,
        {
          key: `slide-${child.key || index}`,
          renderable: index == currentSlide,
          playable: index == currentSlide,
        },
        preact.createElement('div', outs, child)
      );
    });

    return preact.createElement('div', outs, slideElements);
  };

  // Navigation arrows.
  const arrow = dir => {
    let button;
    const arrowName = `arrow${dir < 0 ? 'Prev' : 'Next'}`;
    const arrowInProps = props[arrowName];
    if (arrowInProps) {
      // A button is passed in the properties: `arrowNext` or `arrowPrev`.
      button = arrowInProps;
    } else {
      // Default button.
      const outs = {};
      outs['style'] = {
        position: 'absolute',
        width: '32px',
        height: '32px',
        // Offset button from the edge.
        [dir < 0 ? 'left' : 'right']: '8px',
        // Center the button vertically.
        top: '50%',
        transform: 'translateY(-50%)',
        // Other styles.
        background: 'rgba(0, 0, 0, 0.25)',
      };
      button = preact.createElement('button', outs, dir < 0 ? '<<' : '>>');
    }

    const nextSlide = currentSlide + dir;
    return preact.cloneElement(button, {
      key: arrowName,
      onClick: () => {
        setCurrentSlide(currentSlide + dir);
      },
      disabled: nextSlide < 0 || nextSlide >= slides.length,
    });
  };

  return preact.createElement(
    AmpRoot,
    {
      ...props,
      // Just for debugging.
      'debug-current-slide': currentSlide,
    },
    [
      scroller(),
      arrow(-1),
      arrow(1),
    ]);
}

const AmpReactCarousel = ReactCompatibleBaseElement(AmpCarousel, {
  attrs: {
    'current-slide': {
      prop: 'currentSlide',
      type: 'number',
    },
  },
  children: {
    'arrowNext': {
      selector: '[arrow-next]',
      props: {retarget: true},
      single: true,
    },
    'arrowPrev': {
      selector: '[arrow-prev]',
      props: {retarget: true},
      single: true,
    },
    'children': '*',
  },
});
customElements.define('amp-react-carousel', AmpReactCarousel);
