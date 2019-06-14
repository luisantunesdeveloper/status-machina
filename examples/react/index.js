/**
 * The idea behind this example is to have a simple
 * and descriptive state management, without too much
 * boilerplate.
 *
 * In this case every time a click is made a
 * transition is triggered calling the listeners
 * at the end of the transition. That includes
 * every before or after function.
 */

import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
const machines = require('../../src/index');

// the Services user mock
const user = {
  name: 'John',
  surname: 'Doe',
};

class Services {
  async getUser() {
    // simulates an api call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(user);
      }, 1000);
    });
  }
}

// configure the state machine
// it's ok, to configure the machine up front
// with all the listeners, but this could be
// done afterwards
const getConfig = beforeSecondState => ({
  firstState: {
    secondState: {
      before: [beforeSecondState],
    },
  },
  secondState: {
    firstState: {},
  },
});

// create a new state machine
// with states, initial state and
// state changes observers
const beforeSecondState = new Services().getUser;
const states = getConfig(beforeSecondState);
const sm = new machines.StateMachine(states, 'firstState');

class SMExample extends React.Component {
  componentDidMount() {
    // first attach the listeners and then start the state machine
    sm.attach('firstState', 'SMExample', () => this.setState({ data: {} }))
      .attach('secondState', 'SMExample', data => this.setState({ data }))
      .init();
  }

  componentWillUnmount() {
    this.sm.dettachState('firstState').dettachState('secondState');
  }

  render() {
    // the important part is the transitions
    // a state machine changes state on a certain event
    // who decides when is up to the user
    // in this case the two onClicks below
    return (
      <div>
        <p>{sm.getState()}</p>
        <button onClick={() => sm.transition('secondState')}> Click</button>
        <span> </span>
        {sm.getState() !== 'firstState' && (
          <button onClick={() => sm.transition('firstState')}> Back</button>
        )}
        {this.state && this.state.data && this.state.data.name && (
          <p>{this.state.data.name}</p>
        )}
      </div>
    );
  }
}

var mountNode = document.getElementById('app');
ReactDOM.render(<SMExample />, mountNode);
