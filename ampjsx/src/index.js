import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

console.log('QQQQ: index.js');
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


// import React from 'react';
// import SparseDoc from './stories/doc1.sparse';
// import {hydrate} from './tools/extract-doc';

// console.log('QQQQ: index.sparse.js');
// hydrate(<SparseDoc />, document.body);
