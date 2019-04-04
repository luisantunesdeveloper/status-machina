export const initData = {
  todos: [],
};

export const getTodos = async filterBy => {
  return data => {
    // simulates an api call
    return new Promise(resolve => {
      setTimeout(() => {
        if (filterBy && filterBy !== 'none') {
          data.todos.map(todo => {
            if (filterBy === 'completed') {
              todo.show = todo.completed;
            } else if (filterBy === 'notCompleted') {
              todo.show = !todo.completed;
            } else {
              todo.show = false;
            }
            return todo;
          });
          resolve(data);
        } else {
          data.todos.map(todo => {
            todo.show = true;
            return todo;
          });
          resolve(data);
        }
      }, 500);
    });
  };
};

export const postTodo = async todo => {
  return data => {
    // simulates an api call
    return new Promise(resolve => {
      setTimeout(() => {
        const newTodo = Object.assign(todo, { id: data.todos.length });
        data.todos.push(newTodo);
        resolve(data);
      }, 4000);
    });
  };
};

export const putTodo = async (id, completed) => {
  return data => {
    // simulates an api call
    return new Promise(resolve => {
      setTimeout(() => {
        data.todos.map(todo => {
          if (id === todo.id) {
            return Object.assign(todo, { completed });
          }
          return todo;
        });
        resolve(data);
      }, 100);
    });
  };
};
