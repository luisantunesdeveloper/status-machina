import React from 'react';
import { initData, getTodos, postTodo, putTodo } from './services';
import store from './store';
import Todo from './todo';

export default class Todos extends React.Component {
  componentWillMount() {
    store.init(initData);
    this.addTodo = this.addTodo.bind(this);
    this.changeTodo = this.changeTodo.bind(this);
    this.listFilteredTodos = this.listFilteredTodos.bind(this);
  }

  async addTodo(event) {
    event.preventDefault();
    store.states.addTodo.on.outputs = postTodo({
      description: event.currentTarget[0].value,
      completed: false,
    });
    // the following line is not needed, just to fire up render of the current state
    this.setState(store.data);
    await store.transition('addTodo');
    store.states.listTodos.on.outputs = getTodos(store.data.filter);
    await store.transition('listTodos');
    this.setState(store.data);
  }

  async changeTodo(event) {
    event.preventDefault();
    store.states.changeTodo.on.outputs = putTodo(
      Number(event.currentTarget.id),
      event.target.checked
    );
    await store.transition('changeTodo');
    store.states.listTodos.on.outputs = getTodos(store.data.filter);
    await store.transition('listTodos');
    this.setState(store.data);
  }

  async listFilteredTodos(event) {
    store.data.filter = event.currentTarget.id;
    store.states.listTodos.on.outputs = getTodos(event.currentTarget.id);
    // the following line is not needed, just to fire up render of the current state
    this.setState(store.data);
    await store.transition('listTodos');
    this.setState(store.data);
  }

  renderTodosList() {
    return store.data.todos.map(
      (todo, index) =>
        todo.show && (
          <Todo
            changeTodo={this.changeTodo}
            completed={todo.completed}
            description={todo.description}
            id={todo.id}
            key={index}
          />
        )
    );
  }

  renderFilters() {
    return (
      <div>
        <span>Filters: </span>
        <label htmlFor="none">None</label>
        <input
          id="none"
          name="todosFilter"
          onChange={this.listFilteredTodos}
          type="radio"
        />
        <label htmlFor="completed">Completed</label>
        <input
          id="completed"
          name="todosFilter"
          onChange={this.listFilteredTodos}
          type="radio"
        />
        <label htmlFor="notCompleted">Not completed</label>
        <input
          id="notCompleted"
          name="todosFilter"
          onChange={this.listFilteredTodos}
          type="radio"
        />
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <form onSubmit={this.addTodo}>
          <label htmlFor="todoName">
            Add a todo (press enter at the end):{' '}
          </label>
          <input id="todoName" type="text" name="todoName" />
        </form>
        <ul style={{ listStyleType: 'none' }}>{this.renderTodosList()}</ul>
        {this.renderFilters()}
        <br />
        <div>Current state: {store.currentState}</div>
      </React.Fragment>
    );
  }
}
