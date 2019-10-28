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


/**
 * Most of AMP components should wrap inside this component to ensure the
 * correct adaptation to both CE and AmpWithLayout.
 */
export const AmpRoot = preactCompat.forwardRef((props, ref) => {
  return preact.createElement(
    props.tagName || 'div',
    {
      ...props,
      style: {
        ...props.style,
        overflow: 'hidden',
        // Only non-static positions are allowed.
        position:
          props.style &&
          props.style.position &&
          props.style.position != 'static' ?
          props.style.position :
          'relative',
      },
      ref,
    }
  );
});
