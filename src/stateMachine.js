'use strict';

const bluebird = require('bluebird');
const map = bluebird.map;

const types = {
  moore: 'moore',
};

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

  configMoore(states) {
    this.type = types.moore;
    return this.config(states);
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
    if (this.type && this.type === types.moore) {
      return await this._transitionMoore(this.currentState, toState);
    }
    return await this._transition(this.currentState, toState);
  }

  _basicSanitization(fromState, toState) {
    if (!this.states[toState]) {
      throw new Error(`${toState} does not exist!`);
    }

    if (fromState && toState && !this.states[fromState][toState]) {
      throw new Error(`${toState} does not exist as a possible transition!`);
    }
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

  _executeTransition(toState, actions = []) {
    this.currentState = toState;
    if (actions.length > 0) {
      return this._executeActions(actions);
    }
    return Promise.all([]);
  }

  _mooreSanitization(toState) {
    if (!this.states[toState].on || !this.states[toState].on.outputs) {
      throw new Error(`${toState} does should have outputs property defined!`);
    }
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

  _setInitialState(initialState) {
    this.initialState = initialState;
    return this;
  }

  _setStates(states) {
    this.states = states;
    return this;
  }

  async _transitionMoore(fromState, toState) {
    this._basicSanitization(fromState, toState);
    this._mooreSanitization(toState);

    // execute the transaction
    await this._executeTransition(toState, [this.states[toState].on.outputs]);

    return Promise.resolve({
      currentState: this.currentState,
      data: this.data,
    });
  }

  async _transition(fromState, toState) {
    this._basicSanitization(fromState, toState);

    // actions to execute before the transaction
    if (this.states[fromState]) {
      await this._executeActionsByActionType(fromState, toState, 'before');
    }

    // execute the transaction
    await this._executeTransition(
      toState,
      this.states[toState].on && this.states[toState].on.actions
    );

    // actions to execute after the transaction
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
