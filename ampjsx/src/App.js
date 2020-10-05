import React, {useEffect, useRef, useState, useCallback} from 'react';

import {extractDoc, hydrate} from './tools/extract-doc';

// import Doc from './stories/doc1.doc';
// import SparseDoc from './stories/doc1.sparse';

function App() {
  const [doc, setDoc] = useState(null);
  const ref = useRef();
  const iframeRef = useRef();
  const iframeRef2 = useRef();

  const createDoc = useCallback(async () => {
    const Doc = (await import('./stories/doc1.doc')).default;
    return <Doc />;
  }, []);

  useEffect(() => {
    createDoc().then(setDoc);
  }, [createDoc]);

  useEffect(() => {
    const iframe = iframeRef.current;
    createDoc().then(doc => {
      iframe.srcdoc = extractDoc(doc);
      iframe.onload = async () => {
        const SparseDoc = (await import('./stories/doc1.sparse')).default;
        hydrate(<SparseDoc />, iframe.contentDocument.body);
      };
    });
  }, [createDoc]);

  useEffect(() => {
    const iframe = iframeRef2.current;
    createDoc().then(doc => {
      iframe.srcdoc = `
        <script src="http://localhost:3001/dist/index.js" defer></script>

        <div id="root" src="/index.sparse.rollup.js">
          ${extractDoc(doc)}
        </div>

        <script async=false defer>
          document.addEventListener('DOMContentLoaded', function() {
            console.log('upgradeElement');
            MainThread.upgradeElement(
              document.querySelector('#root'),
              '/worker.js');
          });
        </script>
      `;
    });
  }, [createDoc]);

  return (
    <div ref={ref} className="App">
      {doc}
      <iframe style={{marginTop: 100}} ref={iframeRef} width="500" height="400"/>
      <iframe style={{marginTop: 100}} ref={iframeRef2} width="500" height="400"/>
    </div>
  );
}

export default App;
