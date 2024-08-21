import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FixedSizeList } from '../.';
import './index.css';

const App = () => {
  return <FixedSizeList />;
};

ReactDOM.render(<App />, document.getElementById('root'));
