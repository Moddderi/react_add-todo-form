import { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { TodoList } from './components/TodoList';

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  user: User;
};

export const App = () => {
  const [todos, setTodos] = useState<Todo[]>(() =>
    todosFromServer.map(todo => ({
      ...todo,
      user: usersFromServer.find(user => user.id === todo.userId)!,
    })),
  );

  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState(0);

  const [titleError, setTitleError] = useState(false);
  const [userError, setUserError] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const isTitleValid = title.trim().length > 0;
    const isUserValid = userId !== 0;

    setTitleError(!isTitleValid);
    setUserError(!isUserValid);

    if (!isTitleValid || !isUserValid) {
      return;
    }

    const newTodo: Todo = {
      id: Math.max(0, ...todos.map(todo => todo.id)) + 1,
      title: title.trim(),
      completed: false,
      userId,
      user: usersFromServer.find(u => u.id === userId)!,
    };

    setTodos(prev => [...prev, newTodo]);
    setTitle('');
    setUserId(0);
  };

  const handleTitleChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '');

    setTitle(cleaned);
    if (titleError) {
      setTitleError(false);
    }
  };

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <input
            type="text"
            placeholder="Enter todo title"
            data-cy="titleInput"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
          />
          {titleError && <span className="error">Please enter a title</span>}
        </div>

        <div className="field">
          <select
            data-cy="userSelect"
            value={userId}
            onChange={e => {
              setUserId(Number(e.target.value));
              if (userError) {
                setUserError(false);
              }
            }}
          >
            <option value="0" disabled>
              Choose a user
            </option>
            {usersFromServer.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {userError && <span className="error">Please choose a user</span>}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={todos} />
    </div>
  );
};
