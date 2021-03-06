'use strict';

const Promise = require('bluebird');

class StateMachine {

  constructor(states, initialState, data) {
    this.states = states
    this.initialState = initialState;
    this.data = data;
    this.addBasicProps()
  }

  addBasicProps() {
    for(const name in this.states) {
      if (!this.states[name].on) {
        this.states[name].on = {};
      }
  
      if (!this.states[name].on.observers) {
        this.states[name].on.observers = {};
      }
    }
    return this;
  }

  attach(state, observerId, callback) {
    this.states[state].on.observers[observerId] = callback;
    return this;
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

  async init() {
    return await this._transition(undefined, this.initialState);
  }

  async transition(toState) {
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
    return Promise.map(actions, async action => {
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

  _inputSanitization(fromState, toState, input) {
    if (
      !this.states[fromState][toState] ||
      !this.states[fromState][toState].on ||
      !this.states[fromState][toState].on[input]
    ) {
      throw new Error(
        `Transition from ${fromState} to ${toState} does not have matching inputs!`
      );
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

    // resolve the promise
    return Promise.resolve({
      currentState: this.currentState,
      data: this.data,
    });
  }
}

class MealyStateMachine extends StateMachine {

  constructor(states, initialState, data) {
    super(states, initialState, data)
  }

  async transition(toState, input) {
    return await this._transitionMealy(this.currentState, toState, input);
  } 

  async _transitionMealy(fromState, toState, input) {
    this._basicSanitization(fromState, toState);
    this._inputSanitization(fromState, toState, input);

    // execute the transaction
    await this._executeTransition(toState, [
      this.states[fromState][toState].on[input],
    ]);

    return Promise.resolve({
      currentState: this.currentState,
      data: this.data,
    });
  }
}

class MooreStateMachine extends StateMachine {

  constructor(states, initialState, data) {
    super(states, initialState, data)
  }

  async transition(toState) {
    return await this._transitionMoore(this.currentState, toState);
  } 

  async _transitionMoore(fromState, toState) {
    this._basicSanitization(fromState, toState);
    this._outputSanitization(toState, this.states[toState]);

    // execute the transaction
    await this._executeTransition(toState, [this.states[toState].on.outputs]);

    return Promise.resolve({
      currentState: this.currentState,
      data: this.data,
    });
  }

  _outputSanitization(toState, config) {
    if (!config.on || !config.on.outputs) {
      throw new Error(`${toState} does should have outputs property defined!`);
    }
  }
}

module.exports = {
  StateMachine,
  MealyStateMachine,
  MooreStateMachine
};
