import React, { useState } from 'react';
import './App.css';
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

const db = new Dexie('todoApp');
db.version(2).stores({
  todoLists: '++id,name',
  todos: '++id,task,completed,date,listId'
});

const { todoLists, todos } = db;

const TaskTracker = ({ allItems }) => {
  const totalTasks = allItems?.length || 0;
  const completedTasks = allItems?.filter(item => item.completed).length || 0;
  //const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const progressText = `${completedTasks}/${totalTasks}`;

  let message = "Let's get started!";
  if (completedTasks > 0 && completedTasks < totalTasks / 2) {
    message = "Keep going!";
  } else if (completedTasks >= totalTasks / 2 && completedTasks < totalTasks) {
    message = "Almost there!";
  } else if (completedTasks === totalTasks) {
    message = "Great job! All tasks completed!";
  }

  return (
    <div className="task-tracker-container">
      <div className="task-circle">{progressText}</div>
      <p className="task-message">{message}</p>
    </div>
  );
};

const App = () => {
  const [selectedListId, setSelectedListId] = useState(null);
  const lists = useLiveQuery(() => todoLists.toArray(), []);
  const allItems = useLiveQuery(() => selectedListId ? todos.where({ listId: selectedListId }).toArray() : [], [selectedListId]);

  const addTask = async (event) => {
    event.preventDefault();
    const taskField = document.querySelector('#taskInput');
    if (!selectedListId) return;
    await todos.add({
      task: taskField.value,
      completed: false,
      listId: selectedListId
    });
    taskField.value = '';
  };

  const deleteTask = async (id) => todos.delete(id);
  const toggleStatus = async (id, event) => {
    await todos.update(id, { completed: event.target.checked });
  };

  const addTodoList = async () => {
    const name = prompt("Enter new list name:");
    if (name) {
      const id = await todoLists.add({ name });
      setSelectedListId(id);
    }
  };

  const deleteTodoList = async (id) => {
    if (lists.length > 1) {
      await todoLists.delete(id);
      await todos.where({ listId: id }).delete();
      setSelectedListId(lists[0]?.id || null);
    }
  };

  return (
    <div className="container">
      <h3 className="teal-text center-align">Todo App</h3>
      <button onClick={addTodoList} className="waves-effect btn teal">Add Another List</button>
      <div className="list-container">
        {lists?.map(({ id, name }) => (
          <div key={id} className={`list-item ${selectedListId === id ? 'active' : ''}`} onClick={() => setSelectedListId(id)}>
            {name}
            {lists.length > 1 && (
              <i onClick={(e) => { e.stopPropagation(); deleteTodoList(id); }} className="material-icons delete-button">delete</i>
            )}
          </div>
        ))}
      </div>

      {selectedListId && (
        <>
          <form className="add-item-form" onSubmit={addTask}>
            <input type="text" id="taskInput" className="itemField" placeholder="What do you want to do today?" required />
            <button type="submit" className="waves-effect btn teal right">Add</button>
          </form>

          <div className="card white darken-1">
            <div className="card-content">
              {allItems?.map(({ id, completed, task }) => (
                <div className="row" key={id}>
                  <p className="col s10">
                    <label>
                      <input type="checkbox" checked={completed} className="checkbox-blue" onChange={(event) => toggleStatus(id, event)} />
                      <span className={`black-text ${completed && 'strike-text'}`}>{task}</span>
                    </label>
                  </p>
                  <i onClick={() => deleteTask(id)} className="col s2 material-icons delete-button">delete</i>
                </div>
              ))}
            </div>
          </div>
          <TaskTracker allItems={allItems} />
        </>
      )}
    </div>
  );
};

export default App;