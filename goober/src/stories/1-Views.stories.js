import React from 'react';
import { action } from '@storybook/addon-actions';
import View1 from '../View1';
import View2 from '../View2';
import {text, withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Views',
  decorators: [withKnobs],
};

export const View1Story = () => {
  const name = text('name', 'lightcoral');
  return <View1 name={name}/>;
};

export const View2Story = () => <View2/>;
