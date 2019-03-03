'use strict';

import { spy } from 'sinon';
import { test } from 'tape';
import { StateMachine } from '../lib/stateMachine';

test('Moore state-machine', suite => {
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
    },
  });

  test('with callbacks', sync => {
    const argsS2 = {
      prop2: 'value2',
    };

    const onS1 = args => args;

    const onS2 = args => args;

    const afterS1 = args => args;

    const beforeS1 = args => args;

    test('can have states defined', t => {
      t.plan(4);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isNot(sm, undefined, 'state machine is not undefined');
      t.isEqual(sm.initialState, 's1', 'initial state s1 is defined');
      t.isNot(sm.states.s1, undefined, 's1 state is defined');
      t.isNot(sm.states.s2, undefined, 's2 state is defined');
      t.end();
    });

    test('can execute actions on a state', t => {
      t.plan(2);

      const spyOnS1 = spy(onS1);

      const states = config(spyOnS1, onS2);
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      states.s2.on(argsS2);
      t.isNot(sm.states.s1.on, undefined, 's1 state on action is defined');
      t.isEqual(spyOnS1.calledOnce, true, 'onS1 is called once');
      t.end();
    });

    test('can execute actions before a transition', t => {
      t.plan(2);

      const spyOnS2 = spy(onS2);
      const spyBeforeS1 = spy(beforeS1);

      const states = config(undefined, spyOnS2, undefined, spyBeforeS1);
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isEqual(
        sm.states.s1.s2.before.length,
        1,
        'child states can have before actions to execute'
      );
      sm.transition('s1', 's2');
      t.isEqual(spyBeforeS1.calledOnce, true, 'spyBeforeS1 is called once');
      t.end();
    });

    test('can execute actions after a transition', t => {
      t.plan(2);

      const spyOnS2 = spy(onS2);
      const spyAfterS1 = spy(afterS1);

      const states = config(undefined, spyOnS2, spyAfterS1);
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isEqual(
        sm.states.s1.s2.after.length,
        1,
        'child states can have after actions to execute'
      );
      sm.transition('s1', 's2');
      t.isEqual(spyAfterS1.calledOnce, true, 'spyAfterS1 is called once');
      t.end();
    });

    test('can do a transition to a new state', t => {
      t.plan(2);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isEqual(sm.getState(), 's1', 'state is the initial state s1');
      sm.transition('s1', 's2');
      t.isEqual(sm.getState(), 's2', 'state transitioned from s1 to s2');

      t.end();
    });

    test('can do a transition to the same state', t => {
      t.plan(3);

      const spyOnS1 = spy(onS1);

      const states = config(spyOnS1);
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isEqual(sm.getState(), 's1', 'state is the initial state s1');
      sm.transition('s1', 's1');
      t.isEqual(
        spyOnS1.calledTwice,
        true,
        'onS1 is called twice, once during init and other during the transition'
      );
      t.isEqual(sm.getState(), 's1', 'state transitioned from s1 to s1');

      t.end();
    });
    sync.end();
  });

  suite.end();
});
