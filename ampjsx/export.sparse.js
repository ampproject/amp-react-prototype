import React from 'react';
import SparseDoc from './src/stories/doc1.sparse';
import {hydrate} from 'react-dom';
// import {hydrate} from './src/tools/extract-doc';

console.log('QQQQ: index.sparse.js');
hydrate(<SparseDoc />, document.body);
