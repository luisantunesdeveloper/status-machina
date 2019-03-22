import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Todos from './todos';

class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Todos />
      </React.Fragment>
    );
  }
}

var mountNode = document.getElementById('app');
ReactDOM.render(<App />, mountNode);
