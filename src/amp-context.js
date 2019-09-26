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
  useContext,
} = React;


// TBD: I think Context is actually a good way to propagate renderable
// properties _out_ of components. But it might be better to provide
// context properties (along with services) as direct component properties.

/**
 * - renderable: whether this vDOM area is renderable. Analogous to
 *   `display-locking` CSS.
 * - playable: whether the playback is allowed in this vDOM area. If playback
 *   is not allow, the component must immediately stop the playback.
 */
export const AmpContext = React.createContext({
  renderable: true,
  playable: true,
});


export function withAmpContext(props) {
  const parent = useContext(AmpContext);
  const current = {
    renderable: parent.renderable && props.renderable,
    playable: parent.playable && props.playable,
  };
  return React.createElement(
    AmpContext.Provider,
    {value: current},
    props.children
  );
}
