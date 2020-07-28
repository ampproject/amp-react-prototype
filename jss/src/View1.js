import React from 'react';

import {createUseStyles} from 'react-jss'
import styles from './View1.css';

const useStyles = createUseStyles(styles);

const Button = ({children}) => {
  const classes = useStyles();
  return (
    <button className={classes.myButton}>
      <span className={classes.myLabel}>{children}</span>
    </button>
  );
}

const View1 = () => <Button>Submit</Button>

export default View1;
