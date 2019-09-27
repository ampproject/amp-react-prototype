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
import devAssert from './dev-assert.js';
import { AmpContext } from './amp-context.js';
import { useHasEverLoaded } from './amp-react-utils.js';

const {
  useContext,
  useEffect,
  useRef,
} = React;

/**
 * @param {!Object<string, *>} props
 * @param {!Array<string>} keys
 * @param {Array<string>=} renames
 * @return {!Object<string, *>}
 */
function pick(props, keys, renames = keys) {
  const out = {};
  for (let i = 0; i < keys.length; i++) {
    const value = props[keys[i]];
    if (value !== undefined) {
      out[renames[i]] = value;
    }
  }

  return out;
}

/**
 * @enum {number}
 * @private
 */
const PlayerFlags = {
  // Config to tell YouTube to hide annotations by default
  HIDE_ANNOTATION: 3,
};

/**
 * We'll implement all our new extensions as React/Preact Components (TBD).
 * They're true Components, not AmpElements/Amp.BaseElements.
 */
export function AmpYoutubeHooks(props) {
  const context = useContext(AmpContext);
  const iframeRef = useRef();

  useEffect(() => {
    if (!iframeRef.current) {
      return;
    }
    if (!context.playable) {
      // Pause.
      sendYtCommand(iframeRef.current, 'pauseVideo');
    }
  }, [context.playable]);

  const renderable = useHasEverLoaded();
  if (!renderable) {
    return null;
  }

  const attrs = {
    ...props,
    'ref': iframeRef,
    'frameBorder': 0,
    'allowFullScreen': true,
    'allow': 'autoplay;',
    'src': getVideoIframeSrc_(props),
  };
  return React.createElement('iframe', attrs);
}

/**
 * @return {string}
 * @private
 */
function getEmbedUrl_(props) {
  const {
    videoid,
    liveChannelid,
    credentials,
  } = props;
  devAssert((videoid || liveChannelid) && !(videoid && liveChannelid));

  let urlSuffix = '';
  if (credentials === 'omit') {
    urlSuffix = '-nocookie';
  }

  const baseUrl = `https://www.youtube${urlSuffix}.com/embed/`;

  let descriptor = '';
  if (videoid) {
    descriptor = `${encodeURIComponent(videoid)}?`;
  } else {
    descriptor =
      `live_stream?channel=${encodeURIComponent(liveChannelid)}&`;
  }
  return `${baseUrl}${descriptor}enablejsapi=1&amp=1`;
}

/**
 * @return {string}
 * @private
 */
function getVideoIframeSrc_(props) {
  let src = getEmbedUrl_(props);
  const params = pick(props, [
    'playsinline',
    'iv_load_policy',
    'loop',
    'autoplay',
    'playlist',
  ]);

  // Unless inline play policy is set explicitly, enable inline play for iOS
  // in all cases similar to Android. Inline play is the desired default for
  // video in AMP.
  if (!('playsinline' in params)) {
    params['playsinline'] = '1';
  }

  const hasAutoplay = props['autoplay'];
  if (hasAutoplay) {
    // Unless annotations policy is set explicitly, change the default to
    // hide annotations when autoplay is set.
    // We do this because we like the first user interaction with an
    // autoplaying video to be just unmute tso annotations are not
    // interactive during autoplay anyway.
    if (!('iv_load_policy' in params)) {
      params['iv_load_policy'] = `${PlayerFlags.HIDE_ANNOTATION}`;
    }

    // Inline play must be set for autoplay regardless of original value.
    params['playsinline'] = '1';
  }

  const loop = params['loop'] == '1';
  const playlist = 'playlist' in params;
  if (loop) {
    if (playlist) {
      // Use native looping for playlists
      params['loop'] = '1';
    } else if ('loop' in params) {
      // Use js-based looping for single videos
      delete params['loop'];
    }
  }

  return addParamsToUrl(src, params);
}

/**
 * @param {?HTMLIframeElement} iframe
 * @param {string} command
 * @param {*} opt_args
 */
function sendYtCommand(iframe, command, opt_args) {
  if (!iframe || !iframe.contentWindow) {
    return;
  }
  const message = JSON.stringify({
    'event': 'command',
    'func': command,
    'args': opt_args || '',
  });
  iframe.contentWindow.postMessage(message, '*');
}

/**
 * Appends query string fields and values to a url. The `params` objects'
 * `key`s and `value`s will be transformed into query string keys/values.
 * @param {string} url
 * @param {!JsonObject<string, string|!Array<string>>} params
 * @return {string}
 */
function addParamsToUrl(url, params) {
  return appendEncodedParamStringToUrl(url, serializeQueryString(params));
}

/**
 * Appends the string just before the fragment part (or optionally
 * to the front of the query string) of the URL.
 * @param {string} url
 * @param {string} paramString
 * @param {boolean=} opt_addToFront
 * @return {string}
 */
function appendEncodedParamStringToUrl(
  url,
  paramString,
  opt_addToFront
) {
  if (!paramString) {
    return url;
  }
  const mainAndFragment = url.split('#', 2);
  const mainAndQuery = mainAndFragment[0].split('?', 2);

  let newUrl =
    mainAndQuery[0] +
    (mainAndQuery[1]
      ? opt_addToFront
      ? `?${paramString}&${mainAndQuery[1]}`
      : `?${mainAndQuery[1]}&${paramString}`
      : `?${paramString}`);
  newUrl += mainAndFragment[1] ? `#${mainAndFragment[1]}` : '';
  return newUrl;
}

/**
 * Serializes the passed parameter map into a query string with both keys
 * and values encoded.
 * @param {!JsonObject<string, string|!Array<string>>} params
 * @return {string}
 */
function serializeQueryString(params) {
  const s = [];
  for (const k in params) {
    const v = params[k];
    if (v == null) {
      continue;
    } else if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const sv = /** @type {string} */ (v[i]);
        s.push(`${encodeURIComponent(k)}=${encodeURIComponent(sv)}`);
      }
    } else {
      const sv = /** @type {string} */ (v);
      s.push(`${encodeURIComponent(k)}=${encodeURIComponent(sv)}`);
    }
  }
  return s.join('&');
}

const AmpReactYoutubeHooks = ReactCompatibleBaseElement(AmpYoutubeHooks, {
  className: 'i-amphtml-fill-content i-amphtml-replaced-content',
  attrs: {
    'data-videoid': {
      prop: 'videoid',
      type: 'string',
    },
    'data-live-channelid': {
      prop: 'liveChannelid',
      type: 'string',
    },
    'credentials': {
      prop: 'credentials',
      type: 'string',
    },
    'data-playsinline': {
      prop: 'playsinline',
      type: 'string',
    },
    'data-iv_load_policy': {
      prop: 'iv_load_policy',
      type: 'string',
    },
    'loop': {
      prop: 'loop',
      type: 'string',
    },
    'autoplay': {
      prop: 'autoplay',
      type: 'string',
    },
    'data-playlist': {
      prop: 'playtlist',
      type: 'string',
    },
  },
});
customElements.define('amp-react-youtube-hooks', AmpReactYoutubeHooks);
