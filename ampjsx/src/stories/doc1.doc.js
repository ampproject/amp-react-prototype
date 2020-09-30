
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

      <div>
        <button onClick={() => setShowWarning(prev => !prev)}>Show warning</button>
        <div className="warning" hidden={!showWarning}>WARNING!</div>
      </div>

      <Img />

      <Heavy placeholder={
        <Img />
      } />
    </AmpDoc>
  );
}
