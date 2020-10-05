var MainThread = (function (exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

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
  var ReadableMutationType = {
    0: 'ATTRIBUTES',
    1: 'CHARACTER_DATA',
    2: 'CHILD_LIST',
    3: 'PROPERTIES',
    4: 'EVENT_SUBSCRIPTION',
    5: 'GET_BOUNDING_CLIENT_RECT',
    6: 'LONG_TASK_START',
    7: 'LONG_TASK_END'
  };

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
  var EVENT_SUBSCRIPTION_LENGTH = 2;

  /**
   * Instead of a whitelist of elements that need their value tracked, use the existence
   * of a property called value to drive the decision.
   * @param node node to check if values should be tracked.
   * @return boolean if the node should have its value property tracked.
   */

  var shouldTrackChanges = function shouldTrackChanges(node) {
    return node && 'value' in node;
  };
  /**
   * When a node that has a value needing synced doesn't already have an event listener
   * listening for changed values, ensure the value is synced with a default listener.
   * @param worker whom to dispatch value toward.
   * @param node node to listen to value changes on.
   */


  var applyDefaultChangeListener = function applyDefaultChangeListener(workerContext, node) {
    shouldTrackChanges(node) && node.onchange === null && (node.onchange = function () {
      return fireValueChange(workerContext, node);
    });
  };
  /**
   * Tell WorkerDOM what the value is for a Node.
   * @param worker whom to dispatch value toward.
   * @param node where to get the value from.
   */


  var fireValueChange = function fireValueChange(workerContext, node) {
    var _, _workerContext$messag;

    return workerContext.messageToWorker((_workerContext$messag = {}, _defineProperty(_workerContext$messag, 12
    /* type */
    , 4), _defineProperty(_workerContext$messag, 40
    /* sync */
    , (_ = {}, _defineProperty(_, 7
    /* index */
    , node._index_), _defineProperty(_, 21
    /* value */
    , node.value), _)), _workerContext$messag));
  };
  /**
   * Tell WorkerDOM what the window dimensions are.
   * @param workerContext
   * @param cachedWindowSize
   */


  var fireResizeChange = function fireResizeChange(workerContext, cachedWindowSize) {
    var _workerContext$messag2;

    return workerContext.messageToWorker((_workerContext$messag2 = {}, _defineProperty(_workerContext$messag2, 12
    /* type */
    , 5), _defineProperty(_workerContext$messag2, 40
    /* sync */
    , cachedWindowSize), _workerContext$messag2));
  };

  function EventSubscriptionProcessor(strings, nodeContext, workerContext) {
    var knownListeners = [];
    var cachedWindowSize = [window.innerWidth, window.innerHeight];
    /**
     * Register an event handler for dispatching events to worker thread
     * @param worker whom to dispatch events toward
     * @param index node index the event comes from (used to dispatchEvent in worker thread).
     * @return eventHandler function consuming event and dispatching to worker thread
     */

    var eventHandler = function eventHandler(index) {
      return function (event) {
        var _2, _workerContext$messag3;

        if (shouldTrackChanges(event.currentTarget)) {
          fireValueChange(workerContext, event.currentTarget);
        } else if (event.type === 'resize') {
          var _window = window,
              innerWidth = _window.innerWidth,
              innerHeight = _window.innerHeight;

          if (cachedWindowSize[0] === innerWidth && cachedWindowSize[1] === innerHeight) {
            return;
          }

          cachedWindowSize = [window.innerWidth, window.innerHeight];
          fireResizeChange(workerContext, cachedWindowSize);
        }

        workerContext.messageToWorker((_workerContext$messag3 = {}, _defineProperty(_workerContext$messag3, 12
        /* type */
        , 1), _defineProperty(_workerContext$messag3, 39
        /* event */
        , (_2 = {}, _defineProperty(_2, 7
        /* index */
        , index), _defineProperty(_2, 25
        /* bubbles */
        , event.bubbles), _defineProperty(_2, 26
        /* cancelable */
        , event.cancelable), _defineProperty(_2, 27
        /* cancelBubble */
        , event.cancelBubble), _defineProperty(_2, 28
        /* currentTarget */
        , [event.currentTarget._index_ || 0]), _defineProperty(_2, 29
        /* defaultPrevented */
        , event.defaultPrevented), _defineProperty(_2, 30
        /* eventPhase */
        , event.eventPhase), _defineProperty(_2, 31
        /* isTrusted */
        , event.isTrusted), _defineProperty(_2, 32
        /* returnValue */
        , event.returnValue), _defineProperty(_2, 13
        /* target */
        , [event.target._index_ || 0]), _defineProperty(_2, 33
        /* timeStamp */
        , event.timeStamp), _defineProperty(_2, 12
        /* type */
        , event.type), _defineProperty(_2, 35
        /* keyCode */
        , 'keyCode' in event ? event.keyCode : undefined), _2)), _workerContext$messag3));
      };
    };
    /**
     * If the worker requests to add an event listener to 'change' for something the foreground thread is already listening to,
     * ensure that only a single 'change' event is attached to prevent sending values multiple times.
     * @param target node to change listeners on
     * @param addEvent is this an 'addEvent' or 'removeEvent' change
     * @param type event type requested to change
     * @param index number in the listeners array this event corresponds to.
     */


    var processListenerChange = function processListenerChange(target, addEvent, type, index) {
      var changeEventSubscribed = target.onchange !== null;
      var shouldTrack = shouldTrackChanges(target);
      var isChangeEvent = type === 'change';
      var isResizeEvent = type === 'resize';

      if (addEvent) {
        if (isResizeEvent && target === nodeContext.baseElement) {
          addEventListener(type, knownListeners[index] = eventHandler(1));
          return;
        }

        if (isChangeEvent) {
          changeEventSubscribed = true;
          target.onchange = null;
        }

        target.addEventListener(type, knownListeners[index] = eventHandler(target._index_));
      } else {
        if (isResizeEvent && target === nodeContext.baseElement) {
          removeEventListener(type, knownListeners[index]);
          return;
        }

        if (isChangeEvent) {
          changeEventSubscribed = false;
        }

        target.removeEventListener(type, knownListeners[index]);
      }

      if (shouldTrack && !changeEventSubscribed) {
        applyDefaultChangeListener(workerContext, target);
      }
    };

    return {
    execute: function execute(mutations, startPosition, target) {
        var addEventListenerCount = mutations[startPosition + 3
        /* AddEventListenerCount */
        ];
        var removeEventListenerCount = mutations[startPosition + 2
        /* RemoveEventListenerCount */
        ];
        var addEventListenersPosition = startPosition + 4
        /* Events */
        + removeEventListenerCount * EVENT_SUBSCRIPTION_LENGTH;
        var endPosition = startPosition + 4
        /* Events */
        + (addEventListenerCount + removeEventListenerCount) * EVENT_SUBSCRIPTION_LENGTH;

        if (target) {
          for (var iterator = startPosition + 4
          /* Events */
          ; iterator < endPosition; iterator += EVENT_SUBSCRIPTION_LENGTH) {
            processListenerChange(target, iterator <= addEventListenersPosition, strings.get(mutations[iterator]), mutations[iterator + 1]);
          }
        } else {
          console.error("getNode() yields null \u2013 ".concat(target));
        }

        return endPosition;
      }
  };
  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  function BoundingClientRectProcessor(workerContext) {
    return {
    execute: function execute(mutations, startPosition, target) {
        if (target) {
          var _workerContext$messag;

          var boundingRect = target.getBoundingClientRect();
          workerContext.messageToWorker((_workerContext$messag = {}, _defineProperty(_workerContext$messag, 12
          /* type */
          , 6), _defineProperty(_workerContext$messag, 13
          /* target */
          , [target._index_]), _defineProperty(_workerContext$messag, 38
          /* data */
          , [boundingRect.top, boundingRect.right, boundingRect.bottom, boundingRect.left, boundingRect.width, boundingRect.height]), _workerContext$messag));
        } else {
          console.error("getNode() yields null \u2013 ".concat(target));
        }

        return startPosition + 2
        /* End */
        ;
      }
  };
  }

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
  function ChildListProcessor(_ref) {
    var getNode = _ref.getNode;
    return {
    execute: function execute(mutations, startPosition, target) {
        var appendNodeCount = mutations[startPosition + 4
        /* AppendedNodeCount */
        ];
        var removeNodeCount = mutations[startPosition + 5
        /* RemovedNodeCount */
        ];

        if (removeNodeCount > 0) {
          mutations.slice(startPosition + 6
          /* Nodes */
          + appendNodeCount, startPosition + 6
          /* Nodes */
          + appendNodeCount + removeNodeCount).forEach(function (removeId) {
            var node = getNode(removeId);

            if (!node) {
              console.error("getNode() yields null \u2013 ".concat(removeId));
              return;
            }

            node.remove();
          });
        }

        if (appendNodeCount > 0) {
          mutations.slice(startPosition + 6
          /* Nodes */
          , startPosition + 6
          /* Nodes */
          + appendNodeCount).forEach(function (addId) {
            var nextSibling = mutations[startPosition + 2
            /* NextSibling */
            ];
            var newNode = getNode(addId);

            if (newNode) {
              // TODO: Handle this case ---
              // Transferred nodes that are not stored were previously removed by the sanitizer.
              target.insertBefore(newNode, nextSibling && getNode(nextSibling) || null);
            }
          });
        }

        return startPosition + 6
        /* End */
        + appendNodeCount + removeNodeCount;
      }
  };
  }

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
  function AttributeProcessor(strings, config) {
    return {
    execute: function execute(mutations, startPosition, target) {
        var attributeName = strings.get(mutations[startPosition + 2
        /* Name */
        ]); // Value is sent as 0 when it's the default value or removal.
        // Value is sent as index + 1 when it's a valid value.

        var rawValue = mutations[startPosition + 4
        /* Value */
        ] === 0 ? null : strings.get(mutations[startPosition + 4
        /* Value */
        ] - 1);
        var value = rawValue != null ? String(rawValue) : null;

        if (attributeName != null) {
          if (value == null) {
            target.removeAttribute(attributeName);
          } else {
            if (!config.sanitizer || config.sanitizer.validAttribute(target.nodeName, attributeName, value)) {
              target.setAttribute(attributeName, value);
            }
          }
        }

        return startPosition + 5
        /* End */
        ;
      }
  };
  }

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
  function CharacterDataProcessor(strings) {
    return {
    execute: function execute(mutations, startPosition, target) {
        var value = mutations[startPosition + 2
        /* Value */
        ];

        if (value) {
          // Sanitization not necessary for textContent.
          target.textContent = strings.get(value);
        }

        return startPosition + 3
        /* End */
        ;
      }
  };
  }

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
  function PropertyProcessor(strings, config) {
    return {
    execute: function execute(mutations, startPosition, target) {
        var name = strings.get(mutations[startPosition + 2
        /* Name */
        ]);
        var isBooleanProperty = mutations[startPosition + 3
        /* IsBoolean */
        ] === 1
        /* TRUE */
        ;
        var value = isBooleanProperty ? mutations[startPosition + 4
        /* Value */
        ] === 1
        /* TRUE */
        : mutations[startPosition + 4
        /* Value */
        ] !== 0 && strings.get(mutations[startPosition + 4
        /* Value */
        ]) || null;

        if (name && value != null) {
          if (!config.sanitizer || config.sanitizer.validProperty(target.nodeName, name, String(value))) {
            target[name] = value;
          }
        }

        return startPosition + 5
        /* End */
        ;
      }
  };
  }

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
  function LongTaskExecutor(config) {
    var index = 0;
    var currentResolver;
    return {
    execute: function execute(mutations, startPosition, target) {
        if (config.longTask) {
          if (mutations[startPosition] === 6
          /* LONG_TASK_START */
          ) {
              index++;

              if (!currentResolver) {
                config.longTask(new Promise(function (resolve) {
                  return currentResolver = resolve;
                }));
              }
            } else if (mutations[startPosition] === 7
          /* LONG_TASK_END */
          ) {
              index--;

              if (currentResolver && index <= 0) {
                currentResolver();
                currentResolver = null;
                index = 0;
              }
            }
        }

        return startPosition + 2
        /* End */
        ;
      },
		get active() {
        return currentResolver !== null;
      }
  };
  }

  var MutatorProcessor =
  /*#__PURE__*/
  function () {
    /**
     * @param strings
     * @param nodeContext
     * @param workerContext
     * @param sanitizer Sanitizer to apply to content if needed.
     */
    function MutatorProcessor(strings, nodeContext, workerContext, config) {
      var _this = this,
          _this$executors;

      _classCallCheck(this, MutatorProcessor);

      this.mutationQueue = [];
      this.pendingMutations = false;
      /**
       * Apply all stored mutations syncronously. This method works well, but can cause jank if there are too many
       * mutations to apply in a single frame.
       *
       * Investigations in using asyncFlush to resolve are worth considering.
       */

      this.syncFlush = function () {

        _this.mutationQueue.forEach(function (mutationArray) {
          var operationStart = 0;
          var length = mutationArray.length;

          while (operationStart < length) {
            var target = _this.nodeContext.getNode(mutationArray[operationStart + 1]);

            if (!target) {
              console.error("getNode() yields null \u2013 ".concat(target));
              return;
            }

            operationStart = _this.executors[mutationArray[operationStart]].execute(mutationArray, operationStart, target);
          }
        });

        _this.mutationQueue = [];
        _this.pendingMutations = false;
      };

      this.strings = strings;
      this.nodeContext = nodeContext;
      this.sanitizer = config.sanitizer;
      this.mutationPumpFunction = config.mutationPump || requestAnimationFrame.bind(null);
      var LongTaskExecutorInstance = LongTaskExecutor(config);
      this.executors = (_this$executors = {}, _defineProperty(_this$executors, 2
      /* CHILD_LIST */
      , ChildListProcessor(nodeContext)), _defineProperty(_this$executors, 0
      /* ATTRIBUTES */
      , AttributeProcessor(strings, config)), _defineProperty(_this$executors, 1
      /* CHARACTER_DATA */
      , CharacterDataProcessor(strings)), _defineProperty(_this$executors, 3
      /* PROPERTIES */
      , PropertyProcessor(strings, config)), _defineProperty(_this$executors, 4
      /* EVENT_SUBSCRIPTION */
      , EventSubscriptionProcessor(strings, nodeContext, workerContext)), _defineProperty(_this$executors, 5
      /* GET_BOUNDING_CLIENT_RECT */
      , BoundingClientRectProcessor(workerContext)), _defineProperty(_this$executors, 6
      /* LONG_TASK_START */
      , LongTaskExecutorInstance), _defineProperty(_this$executors, 7
      /* LONG_TASK_END */
      , LongTaskExecutorInstance), _this$executors);
    }
    /**
     * Process MutationRecords from worker thread applying changes to the existing DOM.
     * @param phase Current Phase Worker Thread exists in.
     * @param nodes New nodes to add in the main thread with the incoming mutations.
     * @param stringValues Additional string values to use in decoding messages.
     * @param mutations Changes to apply in both graph shape and content of Elements.
     */


    _createClass(MutatorProcessor, [{
      key: "mutate",
      value: function mutate(phase, nodes, stringValues, mutations) {
        this.strings.storeValues(stringValues);
        this.nodeContext.createNodes(nodes, this.sanitizer);
        this.mutationQueue = this.mutationQueue.concat(mutations);

        if (!this.pendingMutations) {
          this.pendingMutations = true;
          this.mutationPumpFunction(this.syncFlush, phase);
        }
      }
    }]);

    return MutatorProcessor;
  }();

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  var NodeContext =
  /*#__PURE__*/
  function () {
    /**
     * Called when initializing a Worker, ensures the nodes in baseElement are
     * known for transmission into the Worker and future mutation events from the
     * Worker.
     * @param baseElement Element that will be controlled by a Worker
     */
    function NodeContext(strings, baseElement) {
      var _this = this;

      _classCallCheck(this, NodeContext);

      this.createNodes = function (buffer, sanitizer) {
        var nodeBuffer = new Uint16Array(buffer);
        var nodeBufferLength = nodeBuffer.length;

        for (var iterator = 0; iterator < nodeBufferLength; iterator += 5
        /* End */
        ) {
          var node = void 0;

          if (nodeBuffer[iterator + 1
          /* NodeType */
          ] === 3
          /* TEXT_NODE */
          ) {
              node = document.createTextNode(_this.strings.get(nodeBuffer[iterator + 3
              /* TextContent */
              ]));
            } else if (nodeBuffer[iterator + 1
          /* NodeType */
          ] === 8
          /* COMMENT_NODE */
          ) {
              node = document.createComment(_this.strings.get(nodeBuffer[iterator + 3
              /* TextContent */
              ]));
            } else if (nodeBuffer[iterator + 1
          /* NodeType */
          ] === 11
          /* DOCUMENT_FRAGMENT_NODE */
          ) {
              node = document.createDocumentFragment();
            } else {
            var nodeName = _this.strings.get(nodeBuffer[iterator + 2
            /* NodeName */
            ]);

            node = nodeBuffer[iterator + 4
            /* Namespace */
            ] !== 0 ? document.createElementNS(_this.strings.get(nodeBuffer[iterator + 4
            /* Namespace */
            ]), nodeName) : document.createElement(nodeName); // TODO(KB): Restore Properties
            // skeleton.properties.forEach(property => {
            //   node[`${property.name}`] = property.value;
            // });
            // ((skeleton as TransferrableElement)[TransferrableKeys.childNodes] || []).forEach(childNode => {
            //   if (childNode[TransferrableKeys.transferred] === NumericBoolean.FALSE) {
            //     node.appendChild(this.createNode(childNode as TransferrableNode));
            //   }
            // });
            // If `node` is removed by the sanitizer, don't store it and return null.

            if (sanitizer && !sanitizer.sanitize(node)) {
              continue;
            }
          }

          _this.storeNode(node, nodeBuffer[iterator]);
        }
      };
      /**
       * Returns the real DOM Element corresponding to a serialized Element object.
       * @param id
       * @return RenderableElement | null
       */


      this.getNode = function (id) {
        var node = _this.nodes.get(id);

        if (node && node.nodeName === 'BODY') {
          // If the node requested is the "BODY"
          // Then we return the base node this specific <amp-script> comes from.
          // This encapsulates each <amp-script> node.
          return _this.baseElement;
        }

        return node;
      };
      /**
       * Store the requested node and all of its children.
       * @param node node to store.
       */


      this.storeNodes = function (node) {
        _this.storeNode(node, ++_this.count);

        node.childNodes.forEach(function (n) {
          return _this.storeNodes(n);
        });
      };

      this.count = 2;
      this.strings = strings; // The nodes map is populated with two default values pointing to baseElement.
      // These are [document, document.body] from the worker.

      this.nodes = new Map([[1, baseElement], [2, baseElement]]);
      this.baseElement = baseElement; // To ensure a lookup works correctly from baseElement
      // add an index equal to the background thread document.body.

      baseElement._index_ = 2; // Lastly, it's important while initializing the document that we store
      // the default nodes present in the server rendered document.

      baseElement.childNodes.forEach(function (n) {
        return _this.storeNodes(n);
      });
    }
    /**
     * Establish link between DOM `node` and worker-generated identifier `id`.
     *
     * These _shouldn't_ collide between instances of <amp-script> since
     * each element creates it's own pool on both sides of the worker
     * communication bridge.
     * @param node
     * @param id
     */


    _createClass(NodeContext, [{
      key: "storeNode",
      value: function storeNode(node, id) {
        node._index_ = id;
        this.nodes.set(id, node);
      }
    }]);

    return NodeContext;
  }();

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  var Strings =
  /*#__PURE__*/
  function () {
    function Strings() {
      _classCallCheck(this, Strings);

      this.strings = [];
    }
    /**
     * Return a string for the specified index.
     * @param index string index to retrieve.
     * @returns string in map for the index.
     */


    _createClass(Strings, [{
      key: "get",
      value: function get(index) {
        return this.strings[index] || '';
      }
      /**
       * Stores a string in mapping and returns the index of the location.
       * @param value string to store
       * @return location in map
       */

    }, {
      key: "store",
      value: function store(value) {
        this.strings.push(value);
      }
      /**
       * Stores a set of strings.
       * @param values
       */

    }, {
      key: "storeValues",
      value: function storeValues(values) {
        values.forEach(this.store.bind(this));
      }
    }]);

    return Strings;
  }();

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  var NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT = [8
  /* COMMENT_NODE */
  , 3
  /* TEXT_NODE */
  ];
  /**
   * Serializes a DOM element for transport to the worker.
   * @param element
   * @param minimizeString Function for minimizing strings for optimized ferrying across postMessage.
   */

  function createHydrateableNode(element, minimizeString) {
    var _hydrated;

    var hydrated = (_hydrated = {}, _defineProperty(_hydrated, 7
    /* index */
    , element._index_), _defineProperty(_hydrated, 11
    /* transferred */
    , 0), _defineProperty(_hydrated, 0
    /* nodeType */
    , element.nodeType), _defineProperty(_hydrated, 1
    /* localOrNodeName */
    , minimizeString(element.localName || element.nodeName)), _defineProperty(_hydrated, 4
    /* childNodes */
    , [].map.call(element.childNodes || [], function (child) {
      return createHydrateableNode(child, minimizeString);
    })), _defineProperty(_hydrated, 2
    /* attributes */
    , [].map.call(element.attributes || [], function (attribute) {
      return [minimizeString(attribute.namespaceURI || 'null'), minimizeString(attribute.name), minimizeString(attribute.value)];
    })), _hydrated);

    if (element.namespaceURI !== null) {
      hydrated[6
      /* namespaceURI */
      ] = minimizeString(element.namespaceURI);
    }

    if (NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT.includes(element.nodeType) && element.textContent !== null) {
      hydrated[5
      /* textContent */
      ] = minimizeString(element.textContent);
    }

    return hydrated;
  }
  /**
   * @param element
   */


  function createHydrateableRootNode(element) {
    var strings = [];
    var stringMap = new Map();

    var storeString = function storeString(value) {
      if (stringMap.has(value)) {
        // Safe to cast since we verified the mapping contains the value.
        return stringMap.get(value);
      }

      var count = strings.length;
      stringMap.set(value, count);
      strings.push(value);
      return count;
    };

    var skeleton = createHydrateableNode(element, storeString);
    return {
      skeleton: skeleton,
      strings: strings
    };
  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

  var WorkerContext =
  /*#__PURE__*/
  function () {
    /**
     * @param baseElement
     * @param nodeContext
     * @param workerDOMScript
     * @param authorScript
     * @param config
     */
    function WorkerContext(baseElement, nodeContext, workerDOMScript, authorScript, config) {
      _classCallCheck(this, WorkerContext);

      this.nodeContext = nodeContext;
      this.config = config; // TODO(KB): Minify this output during build process.

      var keys = [];

      var _createHydrateableRoo = createHydrateableRootNode(baseElement),
          skeleton = _createHydrateableRoo.skeleton,
          strings = _createHydrateableRoo.strings;

      for (var key in baseElement.style) {
        keys.push(key);
      }

      var code = "\n      'use strict';\n      ".concat(workerDOMScript, "\n      (function() {\n        var self = this;\n        var window = this;\n        var document = this.document;\n        var localStorage = this.localStorage;\n        var location = this.location;\n        var defaultView = document.defaultView;\n        var Node = defaultView.Node;\n        var Text = defaultView.Text;\n        var Element = defaultView.Element;\n        var SVGElement = defaultView.SVGElement;\n        var Document = defaultView.Document;\n        var Event = defaultView.Event;\n        var MutationObserver = defaultView.MutationObserver;\n\n        function addEventListener(type, handler) {\n          return document.addEventListener(type, handler);\n        }\n        function removeEventListener(type, handler) {\n          return document.removeEventListener(type, handler);\n        }\n        window.innerWidth = ").concat(window.innerWidth, ";\n        window.innerHeight = ").concat(window.innerHeight, ";\n        this.initialize(document, ").concat(JSON.stringify(strings), ", ").concat(JSON.stringify(skeleton), ", ").concat(JSON.stringify(keys), ");\n        document.observe(window);\n        ").concat(authorScript, "\n      }).call(WorkerThread.workerDOM);\n  //# sourceURL=").concat(encodeURI(config.authorURL));
      this[55
      /* worker */
      ] = new Worker(URL.createObjectURL(new Blob([code])));

      if (config.onCreateWorker) {
        config.onCreateWorker(baseElement, strings, skeleton, keys);
      }
    }
    /**
     * Returns the private worker.
     */


    _createClass(WorkerContext, [{
      key: "messageToWorker",

      /**
       * @param message
       */
      value: function messageToWorker(message) {

        if (this.config.onSendMessage) {
          this.config.onSendMessage(message);
        }

        this.worker.postMessage(message);
      }
    }, {
      key: "worker",
      get: function get() {
        return this[55
        /* worker */
        ];
      }
    }]);

    return WorkerContext;
  }();

  var ALLOWABLE_MESSAGE_TYPES = [3
  /* MUTATE */
  , 2
  /* HYDRATE */
  ];
  /**
   * @param baseElement
   * @param authorScriptURL
   * @param workerDOMURL
   * @param callbacks
   * @param sanitizer
   * @param debug
   */

  function fetchAndInstall(baseElement, config) {
    var fetchPromise = Promise.all([// TODO(KB): Fetch Polyfill for IE11.
    fetch(config.domURL).then(function (response) {
      return response.text();
    }), fetch(config.authorURL).then(function (response) {
      return response.text();
    })]);
    return install(fetchPromise, baseElement, config);
  }
  /**
   * @param fetchPromise
   * @param baseElement
   * @param config
   */

  function install(fetchPromise, baseElement, config) {
    var strings = new Strings();
    var nodeContext = new NodeContext(strings, baseElement);
    return fetchPromise.then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          domScriptContent = _ref2[0],
          authorScriptContent = _ref2[1];

      if (domScriptContent && authorScriptContent && config.authorURL) {
        var workerContext = new WorkerContext(baseElement, nodeContext, domScriptContent, authorScriptContent, config);
        var mutatorContext = new MutatorProcessor(strings, nodeContext, workerContext, config);

        workerContext.worker.onmessage = function (message) {
          var data = message.data;

          if (!ALLOWABLE_MESSAGE_TYPES.includes(data[12
          /* type */
          ])) {
            return;
          }

          mutatorContext.mutate(data[54
          /* phase */
          ], data[37
          /* nodes */
          ], data[41
          /* strings */
          ], new Uint16Array(data[36
          /* mutations */
          ]));

          if (config.onReceiveMessage) {
            config.onReceiveMessage(message);
          }
        };

        return workerContext.worker;
      }

      return null;
    });
  }

  /**
   * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  function upgradeElement(baseElement, domURL) {
    var authorURL = baseElement.getAttribute('src');

    if (authorURL) {
      fetchAndInstall(baseElement, {
        authorURL: authorURL,
        domURL: domURL
      });
    }

    return Promise.resolve(null);
  }

  exports.upgradeElement = upgradeElement;

  return exports;

}({}));
//# sourceMappingURL=worker-main-thread.js.map
