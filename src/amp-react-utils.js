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

const {
  useEffect,
  useRef,
  useState,
} = React;


/**
 * Experimental hook to sync a state based on a property. The state is:
 * - Initialized from the property;
 * - Updated independently of the property when property is unchaged;
 * - Reset to the new property value when the property is updated.
 */
export function useStateFromProp(prop) {
  const valueRef = useRef(prop);
  const prevPropRef = useRef(prop);
  const [unusedCounter, setCounter] = useState(0);
  if (!Object.is(prop, prevPropRef.current)) {
    valueRef.current = prevPropRef.current = prop;
  }
  return [
    valueRef.current,
    // TBD/TODO: make a stable function. Per React's docs:
    // "React guarantees that setState function identity is stable and won't
    // change on re-renders."
    function set(value) {
      if (!Object.is(value, valueRef.current)) {
        valueRef.current = value;
        setCounter(state => state + 1);
      }
    }];
}


/**
 * @param {!Element} elementRef
 * @param {function(number, number)} callback
 */
export function useResizeEffect(elementRef, callback) {
  useEffect(() => {
    const element = elementRef.current;
    if (window.ResizeObserver) {
      // TBD: Is there a large cost for creating new resize observers for
      //      each invocation? If so, we can provide a shared instance
      //      via `useContext()`. Per related research, a single observer
      //      could be as 8x faster.
      //      See https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/z6ienONUb5A/F5-VcUZtBAAJ
      //      If we do use a single observer, we will need to do a
      //      single-observer-for-a-purpose to avoid subscribe/unsubscribe
      //      conflicts for different needs (or implement our wrapper with
      //      a counter).
      const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[entries.length - 1];
        const {width, height} = entry.contentRect;
        callback(width, height);
      });
      resizeObserver.observe(element);
      return function unmount() {
        resizeObserver.disconnect();
      };
    } else {
      // TBD: a "polyfill" can be supplied:
      // 1. As a `useContext(ResizeObserverService)` service.
      // 2. Always as a direct `ResizeObserver` polyfill. This could conflict
      //    with low-polyfill environments, e.g. in a plain-Bento case.

      // A dumb polyfill when nothing else is available: only handle window
      // resizing.
      function resizeHandler() {
        const [width, height] = [element.offsetWidth, element.offsetHeight];
        callback(width, height);
      }
      resizeHandler();
      const win = element.ownerDocument.defaultView;
      win.addEventListener('resize', resizeHandler);
      return function unmount() {
        win.removeEventListener('resize', resizeHandler);
      };
    }
  }, [/* mount-only effect*/]);
}
