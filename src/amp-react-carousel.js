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
import {withAmpContext} from './amp-context.js';

/**
 * We'll implement all our new extensions as React/Preact Components (TBD).
 * They're true Components, not AmpElements/Amp.BaseElements.
 */
export class AmpCarousel extends preact.Component {

  /**
   * @param {!Object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      currentSlide: props.currentSlide || 0,
    };

    this.scrollerRef_ = preact.createRef();
  }

  /**
   * @return {*}
   */
  render() {
    const slideCount = this.props.children && this.props.children.length || 0;

    // Creates scroller element with `overflow-x: auto`.
    const scroller = () => {
      const props = {
        ref: this.scrollerRef_,
        onScroll: this.scrollHandler_.bind(this),
      };
      props['style'] = {
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
      const slides = (this.props.children || []).map((child, index) => {
        // TBD: assign keys.
        const props = {};
        props['style'] = {
          boxSizing: 'border-box',
          flex: '0 0 100%',
          height: '100%',
          border: '1px dashed lightgreen',
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
            renderable: index == this.state.currentSlide,
            playable: index == this.state.currentSlide,
          },
          preact.createElement('div', props, child)
        );
      });

      return preact.createElement('div', props, slides);
    };

    // Navigation arrows.
    const arrow = dir => {
      let button;
      const arrowInProps = this.props[`arrow${dir < 0 ? 'Prev' : 'Next'}`];
      if (arrowInProps) {
        // A button is passed in the properties: `arrowNext` or `arrowPrev`.
        button = arrowInProps;
      } else {
        // Default button.
        const props = {};
        props['style'] = {
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
        button = preact.createElement('button', props, dir < 0 ? '<<' : '>>');
      }

      const nextSlide = this.state.currentSlide + dir;
      return preact.cloneElement(button, {
        // TBD: For some reason this click listener is not working on a slot.
        //      It works fine on the default button though.
        onClick: this.navHandler_.bind(this, dir),
        // TBD: this is cute, but `[disabled]` doesn't propagate from slot to
        // the actual button.
        disabled: nextSlide < 0 || nextSlide >= slideCount,
      });
    };

    return preact.createElement('div', {
      style: {
        position: 'relative',
        overflow: 'hidden',
        height: '100px',
      },
    }, [
      scroller(),
      arrow(-1),
      arrow(1),
    ]);
  }

  /**
   * @param {boolean} onLayout
   * @param {!../../../src/preconnect.Preconnect} preconnect
   */
  ampPreconnectCallback(onLayout, preconnect) {
  }

  /**
   * @param {!../../../src/layout.Layout} layout
   * @return {boolean}
   */
  ampIsLayoutSupported(layout) {
    return true;
  }

  /** @override */
  componentDidMount() {
    // TBD: the scrolling _has_ to be restored post rendering. Otherwise,
    // `scrollLeft` is not updatable.
    this.scrollToCurrentSlide_();
  }

  /** @override */
  componentDidUpdate(prevProps) {
    // Reset state.currentSlide if a property (attribute) changes.
    // TBD: everything about this fragment is ugly! To start with: a property
    // update causes two physical renders for no good reason.
    if (prevProps.currentSlide != this.props.currentSlide) {
      this.setState({currentSlide: this.props.currentSlide});
    } else {
      // TBD: the scrolling _has_ to be restored post rendering. Otherwise,
      // `scrollLeft` is not updatable.
      this.scrollToCurrentSlide_();
    }
  }

  /** @private */
  scrollToCurrentSlide_() {
    const scroller = this.scrollerRef_.current;
    scroller.scrollLeft = scroller.offsetWidth * this.state.currentSlide;
  }

  /** @private */
  scrollHandler_() {
    // TBD: Is this a good idea to manage currentSlide via state? Amount of
    // re-rendering is very small and mostly affects `scrollLeft`, which is
    // not renderable at all.
    // TBD: Ideally we need to wait for scrolling to complete. A lot of
    // problems caused by snapping and smooth scrolling here.
    this.setState(state => {
      const scroller = this.scrollerRef_.current;
      const x = scroller.scrollLeft;
      const slide = Math.round(x / scroller.offsetWidth);
      // TBD: Dispatch the "slide-change" event. But how to do this in React?
      return {currentSlide: slide};
    });
  }

  /**
   * @param {number} dir
   * @private
   */
  navHandler_(dir) {
    // TBD: the updater is probably not really useful here. It's ok to always
    // navigate from the currently known state.
    this.setState({currentSlide: this.state.currentSlide + dir});
  }
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
