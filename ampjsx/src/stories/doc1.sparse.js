
import React, {useState} from 'react';

import {Img} from '../elements';

import {Sparse} from '../infra';

export default function Doc() {
  const [showWarning, setShowWarning] = useState(false);
  return (
    <Sparse el="x-html">
      <Sparse el="x-head" skipContent/>

      <Sparse el="x-body">

        <Sparse el="h1" skipContent/>

        <Sparse el="p" skipContent/>

        <Sparse el="div" sid="s1">
          <Sparse el="button" sid="s2" skipContent onClick={() => setShowWarning(prev => !prev)} />
          <Sparse el="div" sid="s3" skipContent hidden={!showWarning}/>
        </Sparse>

        <Sparse el="span" skipContent />

        <Sparse
          el="div"
          sid="s4"
          skipContent
          getComponent={() => {
            const promise = import('../elementclones');
            return promise.then(module => module['Heavy']).then(Comp =>
              <Comp placeholder={ <Img/> } showWarning={showWarning}/>
            );
          }} />
      </Sparse>
    </Sparse>
  );
}
