
import React, {useState} from 'react';

import {AmpDoc, Style} from '../doc';
import {Img, Heavy} from '../elements';

export default function Doc() {
  const [showWarning, setShowWarning] = useState(false);
  return (
    <AmpDoc>
      <Style>
        {`
          h1 {
            --value: qqqq;
            background: pink;
          }
          .warning {
            background: red;
          }
        `}
      </Style>
      <Style>
        {`
          .heavy {
            background: cyan;
          }
        `}
      </Style>

      <h1>Doc1</h1>

      <p>some very long content</p>

      <div data-sparse-id="s1" data-full-rendering-only-value="true">
        <button data-sparse-id="s2" onClick={() => setShowWarning(prev => !prev)}>Show warning</button>
        <div data-sparse-id="s3" className="warning" hidden={!showWarning}>WARNING!</div>
      </div>

      <Img />

      <Heavy data-sparse-id="s4" placeholder={ <Img /> } showWarning={showWarning} />
    </AmpDoc>
  );
}
