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
import {withAmpContext, AmpContext} from './amp-context.js';

const {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useContext,
} = React;

/**
 * This is just a demo to demonstrate forced unloading of child components.
 * It'll remove the children from the DOM tree when outside viewport, and
 * reinsert new children when in viewport.
 */
export function AmpUnloadOutsideViewport(props) {
  const wrapper = useRef(null);
  const [loaded, setLoad] = useState(false);
  const context = useContext(AmpContext);

  useEffect(() => {
    const io = new IntersectionObserver((records) => {
      const last = records.length
        ? records[records.length - 1]
        : { isIntersecting: false };
      const isVisible = last.isIntersecting;

      setLoad(isVisible);
    });
    io.observe(wrapper.current, { threshold: 0 });

    return function unmount() {
      io.disconnect();
    };
  }, []);

  const children = loaded ? props.children : null;

  return React.createElement(
    withAmpContext,
    context,
    React.createElement('div', { ref: wrapper }, children)
  );
}

const AmpReactUnloadOutsideViewport = ReactCompatibleBaseElement(AmpUnloadOutsideViewport, {
  children: {
    'children': '*',
  },
});
customElements.define('amp-react-unload-outside-viewport', AmpReactUnloadOutsideViewport);
