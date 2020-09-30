
import {roboto} from './fonts.css';
import {css, keyframes} from './use-goober';

/*
 * TBD:
 * - Extensions do not seem to work with `css`. E.g. `css(roboto)` doesn't
 *   work. However, it's possible to do `css({...extend, ...overrides})`.
 * - No num -> px conversion consistent with React's style.
 */

const specalButton = css``;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const myButton = css`
  color: green;
  display: flex;
  transform: translateX(100px);
  margin: 5px 0 0 1rem;

  & span {
    font-weight: bold;
  }
  &.${specalButton}:hover {
    outline: 2px solid red;
  }
  animation: 4s linear 0s 2 alternate ${rotate};
`;

const myLabel = css({
  fontStyle: 'italic',
  fontSize: '20px',
});

export default {
  myButton,
  myLabel,
  specalButton,
};
