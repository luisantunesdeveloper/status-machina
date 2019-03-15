'use strict';

const bluebird = require('bluebird');
const map = bluebird.map;

class StateMachine {
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

  getState() {
    return this.currentState;
  }

  init(initData) {
    this.data = initData;
    this._transition(undefined, this.initialState);
    return this;
  }

  async transition(toState) {
    return await this._transition(this.currentState, toState);
  }

  _executeActionsByActionType(fromState, toState, actionType) {
    if (
      this.states[fromState][toState] &&
      this.states[fromState][toState][actionType] &&
      this.states[fromState][toState][actionType].length > 0
    ) {
      return map(this.states[fromState][toState][actionType], async action => {
        if (action) {
          this.data = await action(this.data);
        }
        return action;
      });
    }
    return Promise.all([]);
  }

  _notifyStateListeners(state) {
    if (
      this.states[state] &&
      this.states[state].on &&
      Object.keys(this.states[state].on).length > 0
    ) {
      for (const observerId in this.states[state].on) {
        this.states[state].on[observerId](this.data);
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

  async _transition(fromState, toState) {
    if (!this.states[toState]) {
      throw new Error(`${toState} does not exist!`);
    }

    // before actions to execute
    if (this.states[fromState]) {
      await this._executeActionsByActionType(fromState, toState, 'before');
    }

    // set the new current state
    this.currentState = toState;

    // after actions to execute
    if (this.states[fromState]) {
      await this._executeActionsByActionType(fromState, toState, 'after');
    }

    // notify every state listener
    this._notifyStateListeners(toState);
    return Promise.resolve({
      currentState: this.currentState,
      data: this.data,
    });
  }
}

module.exports = StateMachine;
