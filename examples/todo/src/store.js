const machines = require('../../../src/index');

const states = {
  listTodos: {
    addTodo: {},
    changeTodo: {},
    listTodos: {},
  },
  addTodo: {
    listTodos: {},
  },
  changeTodo: {
    listTodos: {},
  },
};

// create a new state machine
// with states and initial state
export const store = new machines.MooreStateMachine(states, 'listTodos');