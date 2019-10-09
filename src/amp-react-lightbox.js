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
import {useStateFromProp} from './amp-react-utils.js';

const {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = preactHooks;


export function AmpLightbox(props) {
  const content = props.children || [];

  // TBD: `closeConfirm` prop vs `onValidateClose` callback.
  //      Another alternative is `onCloseRequested`.
  const {
    closeConfirm,
    onClose,
    transitionAnchor,
  } = props;

  const [isOpen, setOpen] = useOpenState(props.open || false, closeConfirm);

  const backdropRef = useRef();

  // The lightbox can be closed by:
  // - Back button
  // - Escape key
  // - Click on the backdrop

  // Back button support.
  // TBD: is back button support belongs here or the caller? QA:
  // [+] CloseOnEsc and CloseOnClick are both supported here.
  // [+] Logic for cancelation is complicated. This creates a weird vetoable
  //     property concept.
  // [-] There's no any kind of consensus on history API support between
  //     frameworks. Lots of features are missing everywhere, such as
  //     correct onPop, popPrompt, etc. Thus requesting a particular interface
  //     implementation is a hurdle. For instance, vetoable close has to
  //     re-push history states when the pop is canceled.
  // [-] What should be a behavior when a lightbox is closed by the caller by
  //     setting prop `open` to `false`?
  const backButtonService = props.deps && props.deps.backButton;
  const backButtonStateRef = useRef();
  if (backButtonStateRef.current) {
    // TBD: either way here looks ugly because history is pushed only once on
    // activation. We either have to track the closeConfirm in a ref, or
    // re-assign onPop each time. I'm leaning toward a ref.
    backButtonStateRef.current.onPop = () => setOpen(false);
  }

  // An effect whenever the isOpen state changes.
  useEffect(() => {
    if (isOpen) {
      // Do open.
      if (backButtonService) {
        const backButtonMarker = backButtonService.push();
        backButtonMarker.onPop = () => setOpen(false);
        backButtonStateRef.current = backButtonMarker;
      }
      function closeOnEsc(e) {
        if (e.key == 'Escape') {
          setOpen(false);
        }
      }
      document.addEventListener('keyup', closeOnEsc);
      // TODO: Transition: a pretty stupid sample code.
      const transitionAnchorEl = transitionAnchor && transitionAnchor.current;
      if (transitionAnchorEl) {
        const backdrop = backdropRef.current;
        backdrop.style.opacity = 0;
        backdrop.style.transition = 'opacity 0.3s';
        transitionAnchorEl.style.transition = 'transform 0.3s';
        transitionAnchorEl.style.transform = 'scale(3) translate(50px, 50px)';
        transitionAnchorEl.addEventListener('transitionend', () => {
          backdrop.style.opacity = 1;
          backdrop.addEventListener('transitionend', () => {
            backdrop.style.transition = '';
            transitionAnchorEl.style.transition = '';
            transitionAnchorEl.style.transform = '';
          }, {once: true});
        }, {once: true});
      }
      return function unlisten() {
        document.removeEventListener('keyup', closeOnEsc);
      };
    } else {
      // Do close.
      setOpen(false);
      const backButtonMarker = backButtonStateRef.current;
      if (backButtonMarker) {
        backButtonMarker.pop();
        backButtonStateRef.current = null;
      }
      if (onClose) {
        onClose();
      }
    }
  }, [isOpen]);



  // Render. Imagine JSX here.

  // Navigation arrows.
  const closeButton = () => {
    // Default button.
    const outs = {
      onClick: () => setOpen(false),
    };
    outs['style'] = {
      position: 'absolute',
      width: '32px',
      height: '32px',
      top: '8px',
      right: '8px',
      // Other styles.
      background: 'rgba(0, 0, 0, 0.25)',
    };
    return preact.createElement('button', outs, 'x');
  };

  // Creates scroller element with `overflow-x: auto`.
  const container = () => {
    const outs = {
      ref: backdropRef,
      onClick: e => {
        if (e.target == backdropRef.current) {
          setOpen(false);
        }
      },
    };
    outs['style'] = {
      display: isOpen ? 'block' : 'none',
      // TBD: how is lightbox's background customized with the backdrop?
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      border: '1px dotted black',
      paddingTop: '16px',
      zIndex: 10000000,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      boxSizing: 'border-box',
      // Lightbox is immediately scrollable by default.
      overscrollBehavior: 'contain',
      overflowX: 'auto',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    };
    return preact.createElement('div', outs, closeButton(), content);
  };

  return container();
}

function useOpenState(prop, closeConfirm) {
  const [isOpen, setOpen] = useStateFromProp(prop || false);
  return [
    isOpen,
    // TBD/TODO: make a stable function. Per React's docs:
    // "React guarantees that setState function identity is stable and won't
    // change on re-renders."
    function set(value) {
      if (isOpen && !value && closeConfirm) {
        const msg =
          typeof closeConfirm == 'string' ?
          closeConfirm :
          'Are you sure you want to close?';
        if (window.confirm(msg)) {
          setOpen(value);
        }
      } else {
        setOpen(value);
      }
    },
  ];
}

const AmpReactLightbox = ReactCompatibleBaseElement(AmpLightbox, {
  attrs: {
    'transition-anchor': {
      prop: 'transitionAnchor',
      type: 'Element',
    },
  },
  passthrough: true,
  // TBD: do property->dep mapping instead?
  // TBD: required vs optional?
  deps: ['backButton'],

  // TBD: this API extensions may warrant overriding the base-base
  // ReactBaseElement. Any other approach better here?
  init(reactBaseElement) {
    const {element} = reactBaseElement;
    element.style.position = 'fixed';
    element.style.zIndex = 11111111;
    return {
      onClose() {
        element.setAttribute('hidden', '');
        reactBaseElement.mutateProps({open: false});
      },
    };
  },
  executeAction(reactBaseElement, invocation) {
    // TODO: keep ugly private calls until the API extension question is
    // resolved.
    const {element} = reactBaseElement;
    switch (invocation.action) {
      case 'activate':
      case 'open':
        element.removeAttribute('hidden');
        reactBaseElement.mutateProps({open: true});
        break;
    }
  },
});
customElements.define('amp-react-lightbox', AmpReactLightbox);
