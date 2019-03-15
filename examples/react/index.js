import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
const StateMachine = require('../../src/index');

const user = {
  name: 'John',
  surname: 'Doe',
};

const getConfig = beforeSecondState => ({
  firstState: {
    secondState: {
      before: [beforeSecondState],
    },
  },
  secondState: {},
});

class Services {
  async getUser() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(user);
      }, 1000);
    });
  }
}

const sm = new StateMachine();
const states = getConfig(new Services().getUser);
sm.config(states)('firstState');

class SMExample extends React.Component {
  state;
  constructor(props) {
    super(props);
    this.state = sm.getState() || { data: {} };
  }

  componentDidMount() {
    sm.init().attach('secondState', 'SMExample', data => {
      this.setState({ data });
    });
  }

  componentWillUnmount() {
    this.sm.dettachState('firstState').dettachState('secondState');
  }

  render() {
    return (
      <div>
        <button onClick={() => sm.transition('secondState')}> Click</button>
        {this.state.data && this.state.data.name && (
          <p>{this.state.data.name}</p>
        )}
      </div>
    );
  }
}

var mountNode = document.getElementById('app');
ReactDOM.render(<SMExample />, mountNode);
