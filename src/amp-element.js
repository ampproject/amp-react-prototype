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

export default function AmpElementFactory(BaseElement) {
  return class AmpElement extends HTMLElement {
    constructor() {
      super(...arguments)

      this.implementation_ = new BaseElement(this);
      this.intersection_ = null;
      this.mutations_ = null;
    }

    connectedCallback() {
      this.implementation_.buildCallback();

      const io = new IntersectionObserver((records) => {
        for (const r of records) {
          if (r.isIntersecting) {
            this.implementation_.layoutCallback();
            break;
          }
        }
      });
      this.intersection_ = io;
      io.observe(this);

      const mo = new MutationObserver((records) => {
        const map = { __proto__: null };
        for (const r of records) {
          const { attributeName } = r;
          map[attributeName] = this.getAttribute(attributeName);
        }

        this.implementation_.mutatedAttributesCallback(map);
      });
      this.mutations_ = mo;
      mo.observe(this, { attributes: true });
    }

    disconnectedCallback() {
      this.intersection_.disconnect();
      this.intersection_ = null;
      this.mutations_.disconnect();
      this.mutations_ = null;
    }
  }
}
