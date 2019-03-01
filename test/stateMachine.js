'use strict';

import { test } from 'tape';
import { spy } from 'sinon';
import { StateMachine } from '../lib/stateMachine';

test('fsm', suite => {
  const config = (onS1, onS2, afterS1, beforeS1) => ({
    s1: {
      on: onS1,
      s2: {
        after: [
          {
            on: afterS1,
          },
        ],
        before: [
          {
            on: beforeS1,
          },
        ],
      },
    },
    s2: {
      on: onS2,
      self: {
        after: [{ on: () => {} }],
        before: [{ on: () => {} }],
      },
    },
  });

  test('with callbacks', sync => {
    const argsS2 = {
      prop2: 'value2',
    };

    const onS1 = args => {
      console.log('on s1', args);
    };

    const onS2 = args => {
      console.log('on s2', args);
    };

    const afterS1 = args => {
      console.log('on s2, after s1');
    };

    const beforeS1 = args => {
      console.log('on s2, before s1');
    };

    test('should have states defined', t => {
      t.plan(4);

      const myConfig = config(onS1);
      const sm = new StateMachine(myConfig, 's1');
      t.isNot(sm, undefined, 'state machine is not undefined');
      t.isEqual(sm.initialState, 's1', 'initial state s1 is defined');
      t.isNot(sm.states.s1, undefined, 's1 state is defined');
      t.isNot(sm.states.s2, undefined, 's2 state is defined');
      t.end();
    });

    test('should have listeners on a state', t => {
      t.plan(2);

      const spyOnS1 = spy(onS1);
      const myConfig = config(spyOnS1, onS2);
      const sm = new StateMachine(myConfig, 's1');
      myConfig.s2.on(argsS2);
      t.isNot(sm.states.s1.on, undefined, 's1 state on listener is defined');
      t.isEqual(spyOnS1.calledOnce, true, 'onS1 is called once');
      t.end();
    });

    test('can execute actions before entering a state', t => {
      t.plan(4);

      const spyOnS1 = spy(onS1);
      const spyOnS2 = spy(onS2);
      const spyBeforeS1 = spy(beforeS1);
      const myConfig = config(spyOnS1, spyOnS2, undefined, spyBeforeS1);
      const sm = new StateMachine(myConfig, 's1');
      myConfig.s2.on(argsS2);
      t.isEqual(
        sm.states.s1.s2.before.length,
        1,
        'child states can have before actions to execute'
      );
      t.isEqual(spyOnS1.calledOnce, true, 'onS1 is called once');
      t.isEqual(
        spyOnS2.calledWith(argsS2),
        true,
        'onS2 is called once with args'
      );
      t.isEqual(spyBeforeS1.calledOnce, true, 'beforeS1 is called once');
      t.end();
    });

    test('can execute actions after entering a state', t => {
      t.plan(4);

      const spyOnS1 = spy(onS1);
      const spyOnS2 = spy(onS2);
      const spyAfterS1 = spy(afterS1);
      const myConfig = config(spyOnS1, spyOnS2, spyAfterS1);
      const sm = new StateMachine(myConfig, 's1');
      myConfig.s2.on(argsS2);
      t.isEqual(
        sm.states.s1.s2.after.length,
        1,
        'child states can have after actions to execute'
      );
      t.isEqual(spyOnS1.calledOnce, true, 'onS1 is called once');
      t.isEqual(
        spyOnS2.calledWith(argsS2),
        true,
        'onS2 is called once with args'
      );
      t.isEqual(spyAfterS1.calledOnce, true, 'spyAfterS1 is called once');
      t.end();
    });
    sync.end();
  });

  suite.end();
});
