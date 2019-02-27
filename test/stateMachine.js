'use strict';

import { test } from 'tape';
import { StateMachine } from '../lib/stateMachine';

test('fsm startup', suite => {
  const config = onS2 => ({
    s1: {
      on: () => {
        console.log('here s1');
      },
      s2: {
        after: [
          {
            get: [],
            set: [],
            on: () => {
              console.log('after s1');
            },
          },
        ],
        before: [
          {
            get: [],
            set: [],
            on: () => {
              console.log('before s1');
            },
          },
        ],
      },
    },
    s2: {
      on: onS2,
      self: {
        after: [{ get: [], set: [], on: () => {} }],
        before: [{ get: [], set: [], on: () => {} }],
      },
    },
  });

  test('it should have states defined', t => {
    t.plan(4);
    const onS2 = args => {
      console.log('here s2', args);
    };
    const myConfig = config(onS2);
    const sm = new StateMachine(myConfig, 's1');
    t.isNot(sm, undefined, 'state machine is undefined');
    t.isEqual(sm.initialState, 's1', 'initial state s1 is defined');
    t.isNot(sm.states.s1, undefined, 's1 state is defined');
    t.isNot(sm.states.s2, undefined, 's2 state is defined');
    t.end();
  });

  test('a state should have on listeners', t => {
    t.plan(1);
    const argsS2 = {
      prop2: 'value2',
    };

    const onS2 = args => {
      console.log('here s2', args);
    };

    const myConfig = config(onS2);
    const sm = new StateMachine(myConfig, 's1');
    myConfig.s2.on(argsS2);
    t.isNot(sm.states.s1.on, undefined, 's1 state on listener is defined');
    t.end();
  });

  test('a state can have before actions to execute', t => {
    t.plan(1);
    const argsS2 = {
      prop2: 'value2',
    };

    const onS2 = args => {
      console.log('here s2', args);
    };

    const myConfig = config(onS2);
    const sm = new StateMachine(myConfig, 's1');
    myConfig.s2.on(argsS2);
    t.isEqual(
      sm.states.s1.s2.before.length,
      1,
      'child states can have before actions to execute'
    );
    t.end();
  });

  test('a state can have after actions to execute', t => {
    t.plan(1);
    const argsS2 = {
      prop2: 'value2',
    };

    const onS2 = args => {
      console.log('here s2', args);
    };

    const myConfig = config(onS2);
    const sm = new StateMachine(myConfig, 's1');
    myConfig.s2.on(argsS2);
    t.isEqual(
      sm.states.s1.s2.after.length,
      1,
      'child states can have after actions to execute'
    );
    t.end();
  });

  suite.end();
});
