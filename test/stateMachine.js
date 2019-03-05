'use strict';

import { spy } from 'sinon';
import { test } from 'tape';
import { StateMachine } from '../src/stateMachine';

test('state-machine', suite => {
  const config = (afterS1, beforeS1) => ({
    s1: {
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
    s2: {},
  });

  test('with callbacks', sync => {
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

    test('can execute actions before a transition', t => {
      t.plan(2);

      const spyBeforeS1 = spy(beforeS1);

      const states = config(undefined, spyBeforeS1);
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isEqual(
        sm.states.s1.s2.before.length,
        1,
        'child states can have before actions to execute'
      );
      sm.transition('s2');
      t.isEqual(spyBeforeS1.calledOnce, true, 'spyBeforeS1 is called once');
      t.end();
    });

    test('can execute actions after a transition', t => {
      t.plan(2);

      const spyAfterS1 = spy(afterS1);

      const states = config(spyAfterS1);
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isEqual(
        sm.states.s1.s2.after.length,
        1,
        'child states can have after actions to execute'
      );
      sm.transition('s2');
      t.isEqual(spyAfterS1.calledOnce, true, 'spyAfterS1 is called once');
      t.end();
    });

    test('cannot do a transition to an inexistent state', t => {
      t.plan(1);

      const states = config();
      delete states.s2;
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      try {
        sm.transition('s2');
      } catch (error) {
        t.isEqual(
          error.message,
          's2 does not exist!',
          'cannot do a transition to a non-existent state'
        );
      }

      t.end();
    });

    test('can do a transition to a new state', t => {
      t.plan(2);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isEqual(sm.getState(), 's1', 'state is the initial state s1');
      sm.transition('s2');
      t.isEqual(sm.getState(), 's2', 'state transitioned from s1 to s2');

      t.end();
    });

    test('can do a transition to the same state', t => {
      t.plan(2);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1').init();

      t.isEqual(sm.getState(), 's1', 'state is the initial state s1');
      sm.transition('s1');
      t.isEqual(sm.getState(), 's1', 'state transitioned from s1 to s1');

      t.end();
    });

    test('can attach a listener to a state', t => {
      t.plan(1);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s2', '1', () => {});
      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        1,
        'state s2 has one observer'
      );

      t.end();
    });

    test('can dettach a listener from a state', t => {
      t.plan(1);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s2', '1', () => {})
        .dettach('s2', '1');

      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        0,
        'state s2 has zero observers'
      );

      t.end();
    });

    test('can attach more than a listener to a state', t => {
      t.plan(1);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s2', '1', () => {})
        .attach('s2', '2', () => {});

      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        2,
        'state s2 has two observers'
      );

      t.end();
    });

    test('can dettach more than a listener from a state', t => {
      t.plan(1);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s2', '1', () => {})
        .attach('s2', '2', () => {})
        .dettach('s2', '1')
        .dettach('s2', '2');

      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        0,
        'state s2 has zero observers'
      );

      t.end();
    });

    test('can attach one listener to different states', t => {
      t.plan(2);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s1', '1', () => {})
        .attach('s2', '2', () => {});

      t.isEqual(
        Object.keys(sm.states['s1'].on).length,
        1,
        'state s1 has one observer'
      );

      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        1,
        'state s2 has one observer'
      );

      t.end();
    });

    test('can dettach one listener from different states', t => {
      t.plan(2);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s1', '1', () => {})
        .attach('s2', '2', () => {})
        .dettach('s1', '1')
        .dettach('s1', '2');

      t.isEqual(
        Object.keys(sm.states['s1'].on).length,
        0,
        'state s1 has zero observers'
      );

      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        1,
        'state s2 has one observer'
      );

      t.end();
    });

    test('can attach more than one listener to different states', t => {
      t.plan(2);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s1', '1', () => {})
        .attach('s1', '2', () => {})
        .attach('s2', '1', () => {})
        .attach('s2', '2', () => {});

      t.isEqual(
        Object.keys(sm.states['s1'].on).length,
        2,
        'state s1 has two observers'
      );

      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        2,
        'state s2 has two observers'
      );

      t.end();
    });

    test('can dettach more than one listener from different states', t => {
      t.plan(2);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s1', '1', () => {})
        .attach('s1', '2', () => {})
        .attach('s2', '1', () => {})
        .attach('s2', '2', () => {})
        .dettach('s1', '1')
        .dettach('s1', '2')
        .dettach('s2', '1')
        .dettach('s2', '2');

      t.isEqual(
        Object.keys(sm.states['s1'].on).length,
        0,
        'state s1 has zero observers'
      );

      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        0,
        'state s2 has zero observers'
      );

      t.end();
    });

    test('can notify state listeners on state transitions', t => {
      t.plan(2);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s1', '1', () => {})
        .attach('s1', '2', () => {})
        .attach('s2', '1', () => {
          t.pass('s2 observer, id 1 got called');
        })
        .attach('s2', '2', () => {
          t.pass('s2 observer, id 2 got called');
        });

      sm.transition('s2');

      t.end();
    });

    test('can dettach every listener from a state', t => {
      t.plan(1);

      const states = config();
      const sm = new StateMachine();
      sm.config(states)('s1')
        .init()
        .attach('s1', '1', () => {})
        .attach('s1', '2', () => {})
        .attach('s2', '1', () => {})
        .attach('s2', '2', () => {})
        .dettachState('s2');

      sm.transition('s2');

      t.isEqual(
        Object.keys(sm.states['s2'].on).length,
        0,
        'state s2 has zero observers'
      );

      t.end();
    });

    sync.end();
  });

  suite.end();
});
