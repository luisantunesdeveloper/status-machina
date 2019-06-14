'use strict';

const sinon = require('sinon');
const tape = require('tape');
const machines = require('../src/machines');
const spy = sinon.spy;
const test = tape.test;

test('generic', generic => {
  const config = (afterS1, beforeS1) => ({
    s1: {
      s1: {}, // same state transition
      s2: {
        after: [afterS1],
        before: [beforeS1],
      },
    },
    s2: {
      s3: {
        after: [afterS1],
      },
    },
    s3: {},
  });

  const afterS1 = args => args;

  const beforeS1 = args => args;

  test('can have states defined', async t => {
    t.plan(4);

    const states = config();
    const sm = new machines.StateMachine(states, 's1')
    await sm.init()

    t.isNot(sm, undefined, 'state machine is not undefined');
    t.isEqual(sm.initialState, 's1', 'initial state s1 is defined');
    t.isNot(sm.states.s1, undefined, 's1 state is defined');
    t.isNot(sm.states.s2, undefined, 's2 state is defined');
    t.end();
  });

  test('can execute actions on a transition', async t => {
    t.plan(2);

    const _spy = spy(args => args);

    const states = config();
    states.s2.on = { actions: [_spy] };
    const sm = new machines.StateMachine(states, 's1');
    sm.init();

    t.isEqual(
      sm.states.s1.s2.after.length,
      1,
      'child states can have after actions to execute'
    );
    await sm.transition('s2');
    t.isEqual(_spy.calledOnce, true, 'spy is called once');
    t.end();
  });

  test('can execute actions before a transition', async t => {
    t.plan(2);

    const spyBeforeS1 = spy(beforeS1);

    const states = config(undefined, spyBeforeS1);
    const sm = new machines.StateMachine(states, 's1');
    sm.init();

    t.isEqual(
      sm.states.s1.s2.before.length,
      1,
      'child states can have before actions to execute'
    );
    await sm.transition('s2');
    t.isEqual(spyBeforeS1.calledOnce, true, 'spyBeforeS1 is called once');
    t.end();
  });

  test('can execute actions after a transition', async t => {
    t.plan(2);

    const spyAfterS1 = spy(afterS1);

    const states = config(spyAfterS1);
    const sm = new machines.StateMachine(states, 's1');
    sm.init();

    t.isEqual(
      sm.states.s1.s2.after.length,
      1,
      'child states can have after actions to execute'
    );
    await sm.transition('s2');
    t.isEqual(spyAfterS1.calledOnce, true, 'spyAfterS1 is called once');
    t.end();
  });

  test('cannot do a transition to an inexistent state', async t => {
    t.plan(1);

    const states = config();
    delete states.s2;
    const sm = new machines.StateMachine(states, 's1');
    sm.init();

    try {
      await sm.transition('s2');
    } catch (error) {
      t.isEqual(
        error.message,
        's2 does not exist!',
        'cannot do a transition to a non-existent state'
      );
    }

    t.end();
  });

  test('can do a transition to a new state', async t => {
    t.plan(2);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    sm.init();

    t.isEqual(sm.currentState, 's1', 'state is the initial state s1');
    await sm.transition('s2');
    t.isEqual(sm.currentState, 's2', 'state transitioned from s1 to s2');

    t.end();
  });

  test('can do a transition to the same state', async t => {
    t.plan(2);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    sm.init();

    t.isEqual(sm.currentState, 's1', 'state is the initial state s1');
    await sm.transition('s1');
    t.isEqual(sm.currentState, 's1', 'state transitioned from s1 to s1');

    t.end();
  });

  test('cannot do a transition to the same state if not defined', async t => {
    t.plan(2);

    const states = config();
    const sm = new machines.StateMachine(states, 's2');
    sm.init();

    t.isEqual(sm.currentState, 's2', 'state is the initial state s1');
    try {
      await sm.transition('s2');
    } catch (error) {
      t.isEqual(
        error.message,
        's2 does not exist as a possible transition!',
        'state cannot have a transition to itself if not defined'
      );
    }

    t.end();
  });

  test('can be ready to have listeners attached', t => {
    t.plan(1);

    const states = config();
    delete states.s2.on;
    const sm = new machines.StateMachine(states, 's1');
    sm.attach('s2', '1', () => {})
      .init();
    t.isEqual(
      sm.states['s2'].on === undefined,
      false,
      'state s2 on prop is defined'
    );

    t.end();
  });

  test('can be ready to have listeners attached', t => {
    t.plan(1);

    const states = config();
    delete states.s2.on;
    const sm = new machines.StateMachine(states, 's1');
    sm.attach('s2', '1', () => {})
      .init();
    t.isEqual(
      sm.states['s2'].on.observers === undefined,
      false,
      'state s2 on.observers prop is defined'
    );

    t.end();
  });

  test('can attach a listener to a state', async t => {
    t.plan(1);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s2', '1', () => {});
    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      1,
      'state s2 has one observer'
    );

    t.end();
  });

  test('can dettach a listener from a state', async t => {
    t.plan(1);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s2', '1', () => {})
      .dettach('s2', '1');

    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      0,
      'state s2 has zero observers'
    );

    t.end();
  });

  test('can attach more than a listener to a state', async t => {
    t.plan(1);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s2', '1', () => {})
      .attach('s2', '2', () => {});

    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      2,
      'state s2 has two observers'
    );

    t.end();
  });

  test('can dettach more than a listener from a state', async t => {
    t.plan(1);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s2', '1', () => {})
      .attach('s2', '2', () => {})
      .dettach('s2', '1')
      .dettach('s2', '2');

    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      0,
      'state s2 has zero observers'
    );

    t.end();
  });

  test('can attach one listener to different states', async t => {
    t.plan(2);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s1', '1', () => {})
      .attach('s2', '2', () => {});

    t.isEqual(
      Object.keys(sm.states['s1'].on.observers).length,
      1,
      'state s1 has one observer'
    );

    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      1,
      'state s2 has one observer'
    );

    t.end();
  });

  test('can dettach one listener from different states', async t => {
    t.plan(2);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s1', '1', () => {})
      .attach('s2', '2', () => {})
      .dettach('s1', '1')
      .dettach('s1', '2');

    t.isEqual(
      Object.keys(sm.states['s1'].on.observers).length,
      0,
      'state s1 has zero observers'
    );

    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      1,
      'state s2 has one observer'
    );

    t.end();
  });

  test('can attach more than one listener to different states', async t => {
    t.plan(2);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s1', '1', () => {})
      .attach('s1', '2', () => {})
      .attach('s2', '1', () => {})
      .attach('s2', '2', () => {});

    t.isEqual(
      Object.keys(sm.states['s1'].on.observers).length,
      2,
      'state s1 has two observers'
    );

    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      2,
      'state s2 has two observers'
    );

    t.end();
  });

  test('can dettach more than one listener from different states', async t => {
    t.plan(2);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s1', '1', () => {})
      .attach('s1', '2', () => {})
      .attach('s2', '1', () => {})
      .attach('s2', '2', () => {})
      .dettach('s1', '1')
      .dettach('s1', '2')
      .dettach('s2', '1')
      .dettach('s2', '2');

    t.isEqual(
      Object.keys(sm.states['s1'].on.observers).length,
      0,
      'state s1 has zero observers'
    );

    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      0,
      'state s2 has zero observers'
    );

    t.end();
  });

  test('can notify state listeners on state transitions', async t => {
    t.plan(2);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s1', '1', () => {})
      .attach('s1', '2', () => {})
      .attach('s2', '1', () => {
        t.pass('s2 observer, id 1 got called');
      })
      .attach('s2', '2', () => {
        t.pass('s2 observer, id 2 got called');
      });

    await sm.transition('s2');

    t.end();
  });

  test('can dettach every listener from a state', async t => {
    t.plan(1);

    const states = config();
    const sm = new machines.StateMachine(states, 's1');
    await sm.init()
    sm.attach('s1', '1', () => {})
      .attach('s1', '2', () => {})
      .attach('s2', '1', () => {})
      .attach('s2', '2', () => {})
      .dettachState('s2');

    await sm.transition('s2');

    t.isEqual(
      Object.keys(sm.states['s2'].on.observers).length,
      0,
      'state s2 has zero observers'
    );

    t.end();
  });

  test('can pass data all the way to the state listeners without any changes', async t => {
    t.plan(1);

    const states = config();
    const initData = { prop1: 'value1' };
    const sm = new machines.StateMachine(states, 's1', initData);
    await sm.init()
    sm.attach('s2', '1', observedData => {
        t.isEqual(
          initData,
          observedData,
          'observed data is equal to init data'
        );
      });

    await sm.transition('s2');

    t.end();
  });

  test('can pass data all the way to the state listeners with changes before a transition', async t => {
    t.plan(1);

    const before = data =>
      new Promise(resolve => {
        data.prop1 = 'value2';
        resolve(data);
      });

    const states = config(undefined, before);
    const initData = { prop1: 'value1' };
    const sm = new machines.StateMachine(states, 's1', initData);
    await sm.init()
    sm.attach('s2', '1', observedData => {
        t.isEqual(
          observedData.prop1,
          'value2',
          'observed data was changed before the callback'
        );
      });

    await sm.transition('s2');

    t.end();
  });

  test('can pass data all the way to the state listeners with changes after a transition', async t => {
    t.plan(2);

    const after = data =>
      new Promise(resolve => {
        data.prop1 = 'value3';
        data.prop2 = 'value1';
        resolve(data);
      });

    const states = config(after);
    const initData = { prop1: 'value1' };
    const sm = new machines.StateMachine(states, 's1', initData);
    await sm.init()
    sm.attach('s2', '1', observedData => {
        t.isEqual(
          observedData.prop1,
          'value3',
          'observed data was changed before and after the callback'
        );

        t.isEqual(
          observedData.prop2,
          'value1',
          'observed data was changed before and after the callback'
        );
      });

    await sm.transition('s2');

    t.end();
  });

  test('can pass data all the way to the state listeners with changes before and after a transition', async t => {
    t.plan(2);

    const after = data =>
      new Promise(resolve => {
        data.prop1 = 'value3';
        data.prop2 = 'value1';
        resolve(data);
      });

    const before = data =>
      new Promise(resolve => {
        data.prop1 = 'value2';
        resolve(data);
      });

    const states = config(after, before);
    const initData = { prop1: 'value1' };
    const sm = new machines.StateMachine(states, 's1', initData);
    await sm.init()
    sm.attach('s2', '1', observedData => {
        t.isEqual(
          observedData.prop1,
          'value3',
          'observed data was changed before and after the callback'
        );

        t.isEqual(
          observedData.prop2,
          'value1',
          'observed data was changed before and after the callback'
        );
      });

    await sm.transition('s2');

    t.end();
  });

  test('can pass data all the way to the state listeners with changes before and after each transition with promises', async t => {
    t.plan(2);

    let prop1 = 0;

    const changeState = data =>
      new Promise(resolve => {
        data.prop1 = ++prop1;
        setTimeout(() => {
          resolve(data);
        }, 0);
      });

    const states = config(changeState, changeState);
    const initData = { prop1 };
    const sm = new machines.StateMachine(states, 's1', initData);

    await sm.init()
    sm.attach('s2', '1', observedData => {
        t.isEqual(
          observedData.prop1,
          2,
          'observed data was changed after the transition to state s2'
        );
      })
      .attach('s3', '1', observedData => {
        t.isEqual(
          observedData.prop1,
          3,
          'observed data was changed after the transition to state s3'
        );
      });

    await sm.transition('s2');
    await sm.transition('s3');

    t.end();
  });

  test('cannot do a transition to an error occurred while executing a function before', async t => {
    t.plan(1);
    const errorMessage = 'error message here';
    const before = () =>
      new Promise((resolve, reject) => {
        reject(new Error(errorMessage));
      });

    const states = config(undefined, before);
    const sm = new machines.StateMachine(states, 's1');
    await sm.init();

    try {
      await sm.transition('s2');
    } catch (error) {
      t.isEqual(
        error.message,
        errorMessage,
        'error is captured while executing a function'
      );
    }

    t.end();
  });

  test('cannot do a transition to an error occurred while executing a function after', async t => {
    t.plan(1);
    const errorMessage = 'error message here';
    const after = () =>
      new Promise((resolve, reject) => {
        reject(new Error(errorMessage));
      });

    const states = config(after);
    const sm = new machines.StateMachine(states, 's1');
    await sm.init();

    try {
      await sm.transition('s2');
    } catch (error) {
      t.isEqual(
        error.message,
        errorMessage,
        'error is captured while executing a function'
      );
    }

    t.end();
  });

  generic.end();
});

test('moore', moore => {
  const outputFn0 = data =>
    new Promise(resolve => {
      resolve(data + '0');
    });

  const outputFn1 = data =>
    new Promise(resolve => {
      resolve(data + '1');
    });

  const states = {
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

  test('can execute a transition on a moore state machine', async t => {
    t.plan(2);

    const _spy = spy(outputFn0);

    states.s1.on = { outputs: _spy };

    const sm = new machines.MooreStateMachine(states, 's1', '');

    await sm.init();
    await sm.transition('s1');

    t.isEqual(_spy.calledOnce, true, 'spy is called once');
    t.isEqual(sm.data, '0', 'data for the state is changed');
    t.end();
  });

  test('can execute more than one transition on a moore state machine', async t => {
    t.plan(1);

    const _spy = spy(outputFn0);

    states.s1.on = { outputs: _spy };

    const sm = new machines.MooreStateMachine(states, 's0', '');
    await sm.init();

    await sm.transition('s1');
    await sm.transition('s2');
    t.isEqual(sm.data, '01', 'data for the state is changed');
    t.end();
  });

  test('can execute more than one transition on a moore state machine', async t => {
    t.plan(1);

    delete states.s1.on.outputs;

    const sm = new machines.MooreStateMachine(states, 's0', '');
    await sm.init();

    try {
      await sm.transition('s1');
    } catch (error) {
      t.isEqual(
        error.message,
        's1 does should have outputs property defined!',
        'cannot do a transition to a state without outpus configuration'
      );
    }
    t.end();
  });

  moore.end();
});

test('mealy', mealy => {
  const outputFn0 = data =>
    new Promise(resolve => {
      resolve(data + '0');
    });

  const outputFn1 = data =>
    new Promise(resolve => {
      resolve(data + '1');
    });

  const states = {
    s0: {
      s1: {
        on: {
          input0: outputFn0,
        },
      },
    },
    s1: {
      s2: {
        on: {
          input1: outputFn1,
        },
      },
    },
    s2: {},
  };

  test('can execute a transition on a mealy mealy machine', async t => {
    t.plan(2);

    const _spy = spy(outputFn0);

    states.s0.s1.on = { input0: _spy };

    const sm = new machines.MealyStateMachine(states, 's0', '');
    await sm.init();
    await sm.transition('s1', 'input0');

    t.isEqual(_spy.calledOnce, true, 'spy is called once');
    t.isEqual(sm.data, '0', 'data for the state is changed');
    t.end();
  });

  test('can execute more than one transition on a mealy state machine', async t => {
    t.plan(1);

    const _spy0 = spy(outputFn0);
    const _spy1 = spy(outputFn1);

    states.s0.s1.on = { input0: _spy0 };
    states.s1.s2.on = { input1: _spy1 };

    const sm = new machines.MealyStateMachine(states, 's0', '');
    await sm.init();
    await sm.transition('s1', 'input0');
    await sm.transition('s2', 'input1');

    t.isEqual(sm.data, '01', 'data for the state is changed');
    t.end();
  });

  test('can execute more than one transition on a mealy state machine', async t => {
    t.plan(1);

    delete states.s0.s1.on.input0;

    const sm = new machines.MealyStateMachine(states, 's0', '');
    await sm.init();

    try {
      await sm.transition('s1', 'input0');
    } catch (error) {
      t.isEqual(
        error.message,
        'Transition from s0 to s1 does not have matching inputs!',
        'cannot do a transition to a state without matching inputs'
      );
    }
    t.end();
  });

  mealy.end();
});
