'use strict';

class StateMachine {
  currentState;
  initialState;
  observers = {};
  states;

  constructor() {}

  attach(state, observerId, callback) {
    if (!this.observers[state]) {
      this.observers[state] = [];
    }

    this.observers[state].push({ observerId, callback });
    return this;
  }

  config(states) {
    this.setStates(states);
    return initialState => {
      return this.setInitialState(initialState);
    };
  }

  dettach(state, observerId) {
    this.observers = this.observers[state].filter(
      observer => observer.observerId !== observerId
    );
    return this;
  }

  getState() {
    return this.currentState;
  }

  init() {
    // for every state let's intercept every function call so we can
    // evaluate if it's possible to reach a certain state from the current one
    this.initStateCallbacks();
    this.initStateAfterAndBeforeCallbacks();
    this.transition(undefined, this.initialState);
    return this;
  }

  initStateCallbacks() {
    for (const state in this.states) {
      if (this.states[state].on) {
        // save the trigger function
        this.states[state].action = this.states[state].on;
        // monkey patch the trigger function
        this.states[state].on = args => {
          // see if it's possible to transit
          if (this.currentState !== state) {
            // save the action args
            // TODO: deal with multiple args params
            this.states[state].actionArgs = args;
          }
        };
      }
    }
  }

  initStateAfterAndBeforeCallbacks() {
    for (const state in this.states) {
      const childStates = this.getChildStatesForState(state);
      for (const childState in this.states[state]) {
        if (childStates.indexOf(childState) > -1) {
          // if we have actions to execute before
          if (
            this.states[state][childState].before &&
            this.states[state][childState].before.length > 0
          ) {
            for (const before of this.states[state][childState].before) {
              // TODO: replace the following chunk for an abstracted function
              // save the trigger function
              before.action = before.on;
              // monkey patch the trigger function
              before.on = args => {
                // save the action args
                // TODO: deal with multiple args params
                before.actionArgs = args;
              };
            }
          }

          // if we have actions to execute after
          if (
            this.states[state][childState].after &&
            this.states[state][childState].after.length > 0
          ) {
            for (const after of this.states[state][childState].after) {
              // TODO: replace the following chunk for an abstracted function
              // save the trigger function
              after.action = after.on;
              // monkey patch the trigger function
              after.on = args => {
                // save the action args
                // TODO: deal with multiple args params
                after.actionArgs = args;
              };
            }
          }
        }
      }
    }
  }

  getChildStatesForState(state) {
    return Object.keys(this.states).filter(_state => _state !== state);
  }

  notifyStateListeners(state) {
    if (this.observers[state] && this.observers[state].length > 0) {
      for (observer of this.observers[state]) {
        observer.callback();
      }
    }
    return this;
  }

  setInitialState(initialState) {
    this.initialState = initialState;
    return this;
  }

  setStates(states) {
    this.states = states;
    return this;
  }

  transition(fromState, toState) {
    if (!this.states[toState]) {
      throw new Error(`${state} does not exist!`);
    }

    // before
    // if it's not the initial state
    if (this.states[fromState]) {
      // let's execute every before action, before the transition
      if (
        this.states[fromState][toState] &&
        this.states[fromState][toState].before &&
        this.states[fromState][toState].before.length > 0
      ) {
        // TODO: if async need to await for it
        // parallel or sequential
        for (const before of this.states[fromState][toState].before) {
          if (before.action) {
            before.action(before.actionArgs);
          }
        }
      }
    }

    // execute action on state
    if (this.states[toState].action) {
      this.states[toState].action(this.states[toState].actionArgs);
    }
    // set the new current state
    this.currentState = toState;
    this.notifyStateListeners(this.currentState);

    // after
    // if it's not the initial state
    if (this.states[fromState]) {
      // let's execute every after action, after the transition
      if (
        this.states[fromState][toState] &&
        this.states[fromState][toState].after &&
        this.states[fromState][toState].after.length > 0
      ) {
        // TODO: if async need to await for it
        // parallel or sequential
        for (const after of this.states[fromState][toState].after) {
          if (after.action) {
            after.action(after.actionArgs);
          }
        }
      }
    }
    return this;
  }

  validTransition(fromState, toState) {
    return Object.keys(this.states[fromState])
      .filter(key => !key.startsWith('_')) // filter system props
      .includes(toState);
  }
}

export { StateMachine };
