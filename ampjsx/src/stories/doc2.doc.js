
import {AmpDoc} from '@ampproject/doc';
import {Img, Carousel} from '@ampproject/elements';

export default function Doc() {
  const [showMore, setShowMore] = useState(false);
  return (
    <AmpDoc>
      <h1>Document 1</h1>

      <Img src="./hero.jpg" width="800" height="600" />

      <p>
        Some very long text.
        ...
        ...
        ...
      </p>

      <h3>See more images:</h3>

      <Carousel>
        <Img src="./slide1.jpg" ... />
        <Img src="./slide2.jpg" ... />
        <Img src="./slide3.jpg" ... />
        {showMore && <Img src="./slide4.jpg" ... /> }
      </Carousel>

      <button onClick={() => setShowMore(true)}>Show more</button>
    </AmpDoc>
  );
}
