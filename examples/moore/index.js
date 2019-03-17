/**
 * A moore state machine works getting the output only as a function of a state:
 * X is a state
 * g is a function
 * y is the output
 * y=g(X)
 */

const StateMachine = require('../../src/index');

const action = data =>
  new Promise(resolve => {
    setTimeout(() => {
      data.inc = ++data.inc;
      resolve(data);
    }, 0);
  });

// configure the state machine
const getConfig = () => ({
  s0: {
    s1: {},
  },
  s1: {
    on: {
      actions: [action],
    },
  },
});

new Promise(resolve => {
  // create a new state machine
  // with states, initial state and
  // state changes observers
  const sm = new StateMachine();
  const states = getConfig();
  sm.config(states)('s0')
    .attach('s0', 'observerId', () =>
      console.log(
        `machine is on ${
          sm.currentState
        } with current output of ${JSON.stringify(sm.data)}`
      )
    )
    .attach('s1', 'observerId', () =>
      console.log(
        `machine is on ${
          sm.currentState
        } with current output of ${JSON.stringify(sm.data)}`
      )
    )
    .init({ inc: 0 });
  resolve(sm);
}).then(async sm => {
  try {
    await sm.transition('s1');
  } catch (error) {
    console.log(error);
  }
});
