class StateMachine {
  currentState;
  initialState;
  states;

  constructor(states, initialState) {
    this.currentState = initialState;
    this.initialState = initialState;
    this.states = states;
    this.init();
  }

  init() {
    // for every state let's intercept every function call so we can
    // evaluate if it's possible to reach a certain state from the current one
    this.initOnStateFunctions();
    this.initOnBeforeChildStateFunctions();
    this.transition(undefined, this.initialState);
  }

  initOnStateFunctions() {
    for (const state in this.states) {
      // save the trigger function
      this.states[state].action = this.states[state].on;
      // replace the trigger function
      this.states[state].on = args => {
        // see if it's possible to transit
        if (this.currentState !== state) {
          // save the action args
          // TODO: deal with multiple args params
          this.states[state].actionArgs = args;
          // do the transition
          this.transition(this.currentState, state);
        }
      };
    }
  }

  initOnBeforeChildStateFunctions() {
    for (const state in this.states) {
      const childStates = this.getChildStatesForState(state);
      for (const childState in this.states[state]) {
        if (childStates.indexOf(childState) > -1) {
          for (const before of this.states[state][childState].before) {
            // TODO: replace the following chunk for an abstracted function
            // save the trigger function
            before.action = before.on;
            // replace the trigger function
            before.on = args => {
              // save the action args
              // TODO: deal with multiple args params
              before.actionArgs = args;
            };
          }

          for (const after of this.states[state][childState].after) {
            // TODO: replace the following chunk for an abstracted function
            // save the trigger function
            after.action = after.on;
            // replace the trigger function
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

  getChildStatesForState(state) {
    return Object.keys(this.states).filter(_state => _state !== state);
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
        this.states[fromState][toState].before
      ) {
        // TODO: if async need to await for it
        // parallel or sequential
        for (const before of this.states[fromState][toState].before) {
          before.action(before.args);
        }
      }
    }

    // during
    // executeTriggerFunction
    this.states[toState].action(this.states[toState].actionArgs);
    // set the new current state
    this.currentState = toState;

    // after
    // if it's not the initial state
    if (this.states[fromState]) {
      // let's execute every after action, after the transition
      if (
        this.states[fromState][toState] &&
        this.states[fromState][toState].after
      ) {
        // TODO: if async need to await for it
        // parallel or sequential
        for (const after of this.states[fromState][toState].after) {
          after.action(after.args);
        }
      }
    }
  }

  validTransition(fromState, toState) {
    return Object.keys(this.states[fromState])
      .filter(key => !key.startsWith('_')) // filter system props
      .includes(toState);
  }
}

export { StateMachine };
