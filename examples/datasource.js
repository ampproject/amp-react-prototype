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


export class DataSource {

  /**
   * See https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader.
   * But some variances:
   * - render up to N items
   * - render as many as will arrive in the next rAF, but up to N.
   * - render all in the batch, e.g. for "https://example.com/data?page=X".
   *
   * @return {!Promise<{value:T, done: boolean}>}
   */
  next() {}

}


// Natural buffering vs BYOB?
export class PullChunkDataSource extends DataSource/*<T is Array<X>>*/ {

  /**
   * @return {!Promise<{value:!Array<T>, done: boolean}>}
   */
  next() {
    /*
      fetch(`url?page=${nextPage}`)
        .then(r => r.json())
        .then(d => {value: d.list, done: !d.hasMore})
    */
  }
}


export class SamplePullChunkDataSource {

  constructor(offset = 0) {
    this.chunkSize_ = 6;
    this.totalChunks_ = 4;
    this.chunk_ = 0;
    this.offset_ = offset;
    this.wait_ = Promise.resolve();
  }

  /**
   * @return {!Promise<!Array<number>>}
   */
  next() {
    return this.wait_ = this.wait_.then(() => this.fetch_());
  }

  fetch_() {
    return new Promise(resolve => {
      const chunk = this.chunk_++;
      if (chunk >= this.totalChunks_) {
        resolve({done: true});
        return;
      }
      // Pretend like it's taking some time.
      setTimeout(() => {
        const value = [];
        for (let i = 1; i <= this.chunkSize_; i++) {
          value.push(this.offset_ + chunk * this.chunkSize_ + i);
        }
        // Barrowing Stream API format.
        resolve({value, done: chunk >= this.totalChunks_ - 1});
      }, 2000);
    });
  }
}
