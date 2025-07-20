import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../base_url'; 

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/tasks`,
        { title: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, res.data]);
      setNewTask('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleEdit = (task) => {
    setEditTaskId(task._id);
    setEditTitle(task.title);
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `${BASE_URL}/tasks/${editTaskId}`,
        { title: editTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(t => (t._id === editTaskId ? res.data : t)));
      setEditTaskId(null);
      setEditTitle('');
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/tasks/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-800 dark:text-blue-300">📝 My Task Manager</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all shadow"
        >
          Logout
        </button>
      </header>

      <div className="max-w-2xl mx-auto bg-white/60 dark:bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
            onClick={handleAdd}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl shadow transition"
          >
            Add
          </button>
        </div>

        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex justify-between items-center p-4 bg-white/90 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow hover:shadow-md transition"
            >
              {editTaskId === task._id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <button
                    onClick={handleUpdate}
                    className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={`flex-1 font-medium text-lg ${
                      task.completed ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleToggleComplete(task._id)}
                      className="text-green-600 hover:text-green-800 font-semibold transition"
                    >
                      {task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-800 font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-red-600 hover:text-red-800 font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskPage;
