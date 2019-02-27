'use strict';

import { test } from 'tape';
import { StateMachine } from '../lib/stateMachine';

test('fsm startup', suite => {
  const argsS2 = {
    prop2: 'value2',
  };

  const onS2 = args => {
    console.log('here s2', args);
  };

  const config = {
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
  };

  test('it should have props defined', t => {
    t.plan(1);
    const sm = new StateMachine(config, 's1');
    config.s2.on(argsS2);
    t.isNot(sm, undefined, 'sm is not undefined');
    t.end();
  });

  suite.end();
});
