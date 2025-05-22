import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from './ApperIcon';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-orange-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-pink-500' }
];

const STATUSES = [
  { value: 'not-started', label: 'Not Started', color: 'bg-gray-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-amber-500' }
];

const MainFeature = ({ toast }) => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      {
        id: '1',
        title: 'Create project plan',
        description: 'Outline the project scope, timeline, and deliverables',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        createdAt: new Date().toISOString(),
        labels: ['planning', 'documentation']
      },
      {
        id: '2',
        title: 'Design UI mockups',
        description: 'Create initial designs for the dashboard interface',
        status: 'not-started',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        createdAt: new Date().toISOString(),
        labels: ['design', 'ui/ux']
      }
    ];
  });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'not-started',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Tomorrow
    labels: ''
  });
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddTask = (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast.error("Task title is required!");
      return;
    }
    
    const taskToAdd = {
      id: editingTaskId || Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      status: newTask.status,
      priority: newTask.priority,
      dueDate: new Date(newTask.dueDate).toISOString(),
      createdAt: editingTaskId ? tasks.find(t => t.id === editingTaskId).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      labels: newTask.labels.split(',').map(label => label.trim()).filter(Boolean)
    };
    
    if (editingTaskId) {
      setTasks(tasks.map(task => task.id === editingTaskId ? taskToAdd : task));
      toast.success("Task updated successfully!");
      setEditingTaskId(null);
    } else {
      setTasks([...tasks, taskToAdd]);
      toast.success("Task added successfully!");
    }
    
    setNewTask({
      title: '',
      description: '',
      status: 'not-started',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      labels: ''
    });
    
    setIsAddingTask(false);
  };
  
  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setNewTask({
        title: taskToEdit.title,
        description: taskToEdit.description,
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        dueDate: new Date(taskToEdit.dueDate).toISOString().slice(0, 10),
        labels: taskToEdit.labels.join(', ')
      });
      setEditingTaskId(taskId);
      setIsAddingTask(true);
    }
  };
  
  const handleDeleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully!");
    }
  };
  
  const handleChangeStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { 
          ...task, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        
        // If status is changed to completed, set completedAt
        if (newStatus === 'completed' && task.status !== 'completed') {
          updatedTask.completedAt = new Date().toISOString();
        } else if (newStatus !== 'completed') {
          delete updatedTask.completedAt;
        }
        
        return updatedTask;
      }
      return task;
    }));
    toast.info(`Task status updated to ${STATUSES.find(s => s.value === newStatus)?.label}`);
  };
  
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    
    // Priority filter
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.labels.some(label => label.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Group tasks by status for kanban view
  const tasksByStatus = {};
  STATUSES.forEach(status => {
    tasksByStatus[status.value] = filteredTasks.filter(task => task.status === status.value);
  });
  
  const getPriorityDetails = (priority) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[0];
  };
  
  const getStatusDetails = (status) => {
    return STATUSES.find(s => s.value === status) || STATUSES[0];
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full md:w-64 lg:w-80"
            />
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 h-5 w-5" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2 items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input py-2 w-full sm:w-auto"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input py-2 w-full sm:w-auto"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddingTask(true)}
            className="btn btn-primary flex items-center justify-center gap-2 ml-auto"
          >
            <ApperIcon name="Plus" size={18} />
            <span>Add Task</span>
          </motion.button>
        </div>
      </div>
      
      {/* Task Count Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATUSES.map(status => (
          <div 
            key={status.value}
            className="card flex items-center gap-3 hover:border-l-4 hover:border-l-blue-500 transition-all"
          >
            <div className={`${status.color} p-3 rounded-lg`}>
              <ApperIcon 
                name={
                  status.value === 'not-started' ? 'Circle' :
                  status.value === 'in-progress' ? 'Clock' :
                  status.value === 'completed' ? 'CheckCircle' : 'PauseCircle'
                }
                className="h-5 w-5 text-white"
              />
            </div>
            <div>
              <p className="text-surface-500 text-sm">{status.label}</p>
              <p className="font-semibold text-lg">
                {filteredTasks.filter(t => t.status === status.value).length}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Kanban Board View */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[768px]">
          {STATUSES.map(status => (
            <div key={status.value} className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className={`${status.color} h-3 w-3 rounded-full`}></div>
                <h3 className="font-medium">{status.label}</h3>
                <span className="text-sm text-surface-500 ml-auto">
                  {tasksByStatus[status.value]?.length || 0}
                </span>
              </div>
              
              <div className="bg-surface-100 dark:bg-surface-800/50 rounded-lg p-3 flex-1 min-h-[300px]">
                <AnimatePresence>
                  {tasksByStatus[status.value]?.length > 0 ? (
                    <div className="space-y-3">
                      {tasksByStatus[status.value].map(task => (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`task-card border-l-4 ${getPriorityDetails(task.priority).color.replace('bg-', 'border-')}`}
                        >
                          <div className="flex justify-between mb-2">
                            <span className={`task-status-chip ${getStatusDetails(task.status).color} text-white`}>
                              {getStatusDetails(task.status).label}
                            </span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleEditTask(task.id)}
                                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded"
                              >
                                <ApperIcon name="Edit2" size={14} className="text-surface-500" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded"
                              >
                                <ApperIcon name="Trash2" size={14} className="text-surface-500" />
                              </button>
                            </div>
                          </div>
                          
                          <h4 className="font-medium mb-1">{task.title}</h4>
                          
                          {task.description && (
                            <p className="text-sm text-surface-600 dark:text-surface-300 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex justify-between text-xs text-surface-500">
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Calendar" size={12} />
                              <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Flag" size={12} />
                              <span className="capitalize">{task.priority}</span>
                            </div>
                          </div>
                          
                          {task.labels?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {task.labels.map((label, idx) => (
                                <span 
                                  key={idx}
                                  className="text-xs bg-surface-200 dark:bg-surface-700 px-2 py-0.5 rounded-full"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Status Change Buttons */}
                          <div className="flex gap-1 mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
                            {STATUSES.filter(s => s.value !== task.status).map(s => (
                              <button
                                key={s.value}
                                onClick={() => handleChangeStatus(task.id, s.value)}
                                className="text-xs px-2 py-1 rounded bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
                              >
                                Move to {s.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-surface-400 p-4">
                      <ApperIcon name="ClipboardList" className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-sm">No tasks</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsAddingTask(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:transform md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-surface-800 p-6 rounded-t-2xl md:rounded-2xl shadow-xl z-50 max-w-lg w-full mx-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingTaskId ? "Edit Task" : "Add New Task"}
                </h2>
                <button 
                  onClick={() => {
                    setIsAddingTask(false);
                    setEditingTaskId(null);
                    setNewTask({
                      title: '',
                      description: '',
                      status: 'not-started',
                      priority: 'medium',
                      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                      labels: ''
                    });
                  }}
                  className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-full"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">Task Title <span className="text-red-500">*</span></label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    placeholder="Enter task description"
                    className="input min-h-[100px]"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={newTask.status}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={newTask.priority}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {PRIORITIES.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    id="dueDate"
                    type="date"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleInputChange}
                    className="input"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                
                <div>
                  <label htmlFor="labels" className="block text-sm font-medium mb-1">Labels</label>
                  <input
                    id="labels"
                    type="text"
                    name="labels"
                    value={newTask.labels}
                    onChange={handleInputChange}
                    placeholder="Enter labels separated by commas"
                    className="input"
                  />
                  <p className="mt-1 text-xs text-surface-500">Separate labels with commas (e.g., design, urgent, feature)</p>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTask(false);
                      setEditingTaskId(null);
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingTaskId ? "Update Task" : "Add Task"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;