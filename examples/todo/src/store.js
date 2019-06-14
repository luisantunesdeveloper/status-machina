const machines = require('../../../src/index');

const states = {
  listTodos: {
    on: {},
    addTodo: {},
    changeTodo: {},
    listTodos: {},
  },
  addTodo: {
    on: {},
    listTodos: {},
  },
  changeTodo: {
    on: {},
    listTodos: {},
  },
};

// create a new state machine
// with states and initial state
export const store = new machines.MooreStateMachine(states, 'listTodos');