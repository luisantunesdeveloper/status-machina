/**
 * A moore state machine works getting the output only as a function of a state:
 * X is a state
 * g is a function
 * y is the output
 * y=g(X)
 */

const StateMachine = require('../../src/index');

const outputFn0 = data =>
  new Promise(resolve => {
    resolve(data + '0');
  });

const outputFn1 = data =>
  new Promise(resolve => {
    resolve(data + '1');
  });

const config = {
  // initial: 's0',
  // inputs: ['0', '1'],
  s0: {
    on: {
      outputs: outputFn0,
    },
    s1: {},
  },
  s1: {
    on: {
      outputs: outputFn0,
    },
    s1: {},
    s2: {},
  },
  s2: {
    on: {
      outputs: outputFn1,
    },
  },
};

new Promise(resolve => {
  // create a new state machine
  // with states, initial state and
  // state changes observers
  const sm = new StateMachine();
  sm.configMoore(config)('s0').init('');
  resolve(sm);
}).then(async sm => {
  try {
    await sm.transition('s1');
    console.log(
      `machine is on ${
        sm.currentState
      } state with current output of ${JSON.stringify(sm.data)}`
    );
    await sm.transition('s2');
    console.log(
      `machine is on ${
        sm.currentState
      } state with current output of ${JSON.stringify(sm.data)}`
    );
  } catch (error) {
    console.log(error);
  }
});
