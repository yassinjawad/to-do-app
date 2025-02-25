import React from 'react';
import './App.css';
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

const db = new Dexie('todoApp');
db.version(1).stores({
  todos: '++id,task,completed,date'
});

const { todos } = db;

const TaskTracker = ({ allItems }) => {
  const totalTasks = allItems?.length || 0;
  const completedTasks = allItems?.filter(item => item.completed).length || 0;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="card task-tracker">
      <div className="card-content">
        <h4 className="teal-text">Task Progress</h4>
        <div className="progress">
          <div 
            className="determinate teal lighten-2" 
            style={{ width: `${percentage}%`, transition: 'width 0.3s ease' }}
          ></div>
        </div>
        <div className="stats teal-text">
          <p>
            <span className="completed">{completedTasks}</span> completed out of 
            <span className="total"> {totalTasks}</span> tasks ({percentage}%)
          </p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const allItems = useLiveQuery(() => todos.toArray(), []);

  const addTask = async (event) => {
    event.preventDefault();
    const taskField = document.querySelector('#taskInput');

    await todos.add({
      task: taskField.value,
      completed: false
    });

    taskField.value = '';
  };

  const deleteTask = async (id) => todos.delete(id);

  const toggleStatus = async (id, event) => {
    await todos.update(id, { completed: event.target.checked });
  };

  return (
    <div className="container">
      <TaskTracker allItems={allItems} />
      <h3 className="teal-text center-align">Todo App</h3>
      
      <form className="add-item-form" onSubmit={addTask}>
        <input
          type="text"
          id="taskInput"
          className="itemField"
          placeholder="What do you want to do today?"
          required
        />
        <button type="submit" className="waves-effect btn teal right">
          Add
        </button>
      </form>

      <div className="card white darken-1">
        <div className="card-content">
          {allItems?.map(({ id, completed, task }) => (
            <div className="row" key={id}>
              <p className="col s10">
                <label>
                  <input 
                    type="checkbox" 
                    checked={completed} 
                    className="checkbox-blue"
                    onChange={(event) => toggleStatus(id, event)}
                  />
                  <span className={`black-text ${completed && 'strike-text'}`}>
                    {task}
                  </span>
                </label>
              </p>
              <i 
                onClick={() => deleteTask(id)} 
                className="col s2 material-icons delete-button"
              >
                delete
              </i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;