const StateMachine = require('../../../src/index');

const config = {
  listTodos: {
    on: {},
    addTodo: {},
    changeTodo: {},
    listTodos: {},
    removeTodo: {},
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
const store = new StateMachine();
store.configMoore(config)('listTodos');

export default store;
