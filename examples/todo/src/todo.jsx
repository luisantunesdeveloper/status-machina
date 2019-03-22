import React from 'react';

export default class Todo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <li>
        <input
          checked={this.props.completed}
          id={this.props.id}
          onChange={this.props.changeTodo}
          type="checkbox"
        />
        {this.props.description}
      </li>
    );
  }
}
