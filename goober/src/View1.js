import React from 'react';

import styles from './View1.css';

const Button = ({children}) => {
  return (
    <button className={`${styles.myButton} ${styles.specalButton}`}>
      <span className={styles.myLabel}>{children}</span>
    </button>
  );
}

const View1 = ({name}) => <Button>{name} Submit</Button>

export default View1;
