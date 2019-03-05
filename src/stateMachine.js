'use strict';

class StateMachine {
  currentState;
  initialState;
  observers = {};
  states;

  attach(state, observerId, callback) {
    if (!this.observers[state]) {
      this.observers[state] = {};
    }

    this.observers[state][observerId] = callback;
    return this;
  }

  config(states) {
    this._setStates(states);
    return initialState => this._setInitialState(initialState);
  }

  dettach(state, observerId) {
    delete this.observers[state][observerId];
    return this;
  }

  dettachState(state) {
    for (const observerId in this.observers[state]) {
      delete this.observers[state][observerId];
    }
    return this;
  }

  _executeActionsByActionType(fromState, toState, actionType) {
    if (
      this.states[fromState][toState] &&
      this.states[fromState][toState][actionType] &&
      this.states[fromState][toState][actionType].length > 0
    ) {
      // TODO: if async need to await for it
      // parallel or sequential
      for (const actionType of this.states[fromState][toState][actionType]) {
        if (actionType.on) {
          actionType.on();
        }
      }
    }
  }

  getState() {
    return this.currentState;
  }

  init() {
    this._transition(undefined, this.initialState, {});
    return this;
  }

  _notifyStateListeners(state) {
    if (
      this.observers[state] &&
      Object.keys(this.observers[state]).length > 0
    ) {
      for (const observerId in this.observers[state]) {
        this.observers[state][observerId]();
      }
    }
    return this;
  }

  _setInitialState(initialState) {
    this.initialState = initialState;
    return this;
  }

  _setStates(states) {
    this.states = states;
    return this;
  }

  transition(toState) {
    this._transition(this.currentState, toState);
  }

  _transition(fromState, toState) {
    if (!this.states[toState]) {
      throw new Error(`${toState} does not exist!`);
    }

    // before actions to execute
    if (this.states[fromState]) {
      this._executeActionsByActionType(fromState, toState, 'before');
    }

    // execute action on state
    if (this.states[toState].on) {
      this.states[toState].on();
    }
    // set the new current state
    this.currentState = toState;
    this._notifyStateListeners(toState);

    // after actions to execute
    if (this.states[fromState]) {
      this._executeActionsByActionType(fromState, toState, 'after');
    }
    return this;
  }
}

export { StateMachine };
