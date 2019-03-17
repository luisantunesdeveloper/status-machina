'use strict';

const bluebird = require('bluebird');
const map = bluebird.map;

class StateMachine {
  attach(state, observerId, callback) {
    if (!this.states[state].on) {
      this.states[state].on = {};
    }

    if (!this.states[state].on.observers) {
      this.states[state].on.observers = {};
    }

    this.states[state].on.observers[observerId] = callback;
    return this;
  }

  config(states) {
    this._setStates(states);
    return initialState => this._setInitialState(initialState);
  }

  dettach(state, observerId) {
    delete this.states[state].on.observers[observerId];
    return this;
  }

  dettachState(state) {
    for (const observerId in this.states[state].on.observers) {
      delete this.states[state].on.observers[observerId];
    }
    return this;
  }

  getState() {
    return this.currentState;
  }

  /**
   * TODO: should we keep the data inside or build a new
   * store in order to diff the data from previousState
   * @param {*} initData
   */
  init(initData) {
    this.data = initData;
    this._transition(undefined, this.initialState);
    return this;
  }

  async transition(toState) {
    return await this._transition(this.currentState, toState);
  }

  /**
   * TODO: should we keep the data inside or build a new
   * store in order to diff the data from previousState
   * @param {*} actions
   */
  _executeActions(actions) {
    return map(actions, async action => {
      if (action) {
        this.data = await action(this.data);
      }
      return action;
    });
  }

  _executeActionsByActionType(fromState, toState, actionType) {
    if (
      this.states[fromState][toState] &&
      this.states[fromState][toState][actionType] &&
      this.states[fromState][toState][actionType].length > 0
    ) {
      return this._executeActions(this.states[fromState][toState][actionType]);
    }
    return Promise.all([]);
  }

  _notifyStateListeners(state) {
    if (
      this.states[state] &&
      this.states[state].on &&
      this.states[state].on.observers &&
      Object.keys(this.states[state].on.observers).length > 0
    ) {
      for (const observerId in this.states[state].on.observers) {
        this.states[state].on.observers[observerId](this.data);
      }
    }
    return this;
  }

  _setCurrentState(toState) {
    this.currentState = toState;
    if (
      this.states[toState] &&
      this.states[toState].on &&
      this.states[toState].on.actions
    ) {
      return this._executeActions(this.states[toState].on.actions);
    }
    return Promise.all([]);
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

    if (fromState && toState && !this.states[fromState][toState]) {
      throw new Error(`${toState} does not exist as a possible transition!`);
    }

    // before actions to execute
    if (this.states[fromState]) {
      await this._executeActionsByActionType(fromState, toState, 'before');
    }

    this._setCurrentState(toState);

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
