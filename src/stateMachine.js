'use strict';

class StateMachine {
  currentState;
  initialState;
  states;

  attach(state, observerId, callback) {
    if (!this.states[state].on) {
      this.states[state].on = {};
    }

    this.states[state].on[observerId] = callback;
    return this;
  }

  config(states) {
    this._setStates(states);
    return initialState => this._setInitialState(initialState);
  }

  dettach(state, observerId) {
    delete this.states[state].on[observerId];
    return this;
  }

  dettachState(state) {
    for (const observerId in this.states[state].on) {
      delete this.states[state].on[observerId];
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
    this._transition(undefined, this.initialState);
    return this;
  }

  _notifyStateListeners(state) {
    if (
      this.states[state] &&
      this.states[state].on &&
      Object.keys(this.states[state].on).length > 0
    ) {
      for (const observerId in this.states[state].on) {
        this.states[state].on[observerId]();
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
