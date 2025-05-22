/**
 * Task Service - Provides methods for CRUD operations on tasks
 */

const TABLE_NAME = 'task34';

// Field names from the table definition
const FIELDS = [
  'Name',
  'Tags',
  'Owner',
  'CreatedOn',
  'CreatedBy',
  'ModifiedOn',
  'ModifiedBy',
  'title',
  'description',
  'status',
  'priority',
  'dueDate',
  'completedAt',
  'updatedAt'
];

// Fields that can be updated by users
const UPDATEABLE_FIELDS = [
  'Name',
  'Tags',
  'Owner',
  'title',
  'description',
  'status',
  'priority',
  'dueDate',
  'completedAt',
  'updatedAt'
];

// Get ApperClient instance
const getClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Get all tasks with optional filtering
export const getTasks = async (filters = {}) => {
  try {
    const apperClient = getClient();
    
    // Set up the query parameters
    const params = {
      fields: FIELDS,
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };
    
    // Add filters if provided
    if (Object.keys(filters).length > 0) {
      params.where = [];
      
      // Process status filter
      if (filters.status && filters.status !== 'all') {
        params.where.push({
          fieldName: 'status',
          operator: 'ExactMatch',
          values: [filters.status]
        });
      }
      
      // Process priority filter
      if (filters.priority && filters.priority !== 'all') {
        params.where.push({
          fieldName: 'priority',
          operator: 'ExactMatch',
          values: [filters.priority]
        });
      }
      
      // Process search query
      if (filters.searchQuery) {
        params.whereGroups = [{
          operator: 'OR',
          subGroups: [
            {
              conditions: [{
                fieldName: 'title',
                operator: 'Contains',
                values: [filters.searchQuery]
              }],
              operator: ''
            },
            {
              conditions: [{
                fieldName: 'description',
                operator: 'Contains',
                values: [filters.searchQuery]
              }],
              operator: ''
            },
            {
              conditions: [{
                fieldName: 'Tags',
                operator: 'Contains',
                values: [filters.searchQuery]
              }],
              operator: ''
            }
          ]
        }];
      }
    }
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const apperClient = getClient();
    
    // Format tags for database storage
    const tags = Array.isArray(taskData.labels) 
      ? taskData.labels.join(',') 
      : taskData.labels;
    
    // Prepare the record with only updateable fields
    const record = {
      Name: taskData.title,
      Tags: tags,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      updatedAt: new Date().toISOString()
    };
    
    // Add completedAt if status is completed
    if (taskData.status === 'completed') {
      record.completedAt = new Date().toISOString();
    }
    
    const response = await apperClient.createRecord(TABLE_NAME, {
      records: [record]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      // Return the created task with its ID
      return response.results[0].data;
    }
    
    throw new Error('Failed to create task');
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  try {
    const apperClient = getClient();
    
    // Format tags for database storage
    const tags = Array.isArray(taskData.labels) 
      ? taskData.labels.join(',') 
      : taskData.labels;
    
    // Prepare the record with only updateable fields
    const record = {
      Id: taskId,
      Name: taskData.title,
      Tags: tags,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      updatedAt: new Date().toISOString()
    };
    
    // Add completedAt if status is completed
    if (taskData.status === 'completed') {
      record.completedAt = new Date().toISOString();
    }
    
    const response = await apperClient.updateRecord(TABLE_NAME, {
      records: [record]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to update task');
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const apperClient = getClient();
    
    const response = await apperClient.deleteRecord(TABLE_NAME, {
      RecordIds: [taskId]
    });
    
    if (response && response.success) {
      return true;
    }
    
    throw new Error('Failed to delete task');
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (taskId, newStatus) => {
  try {
    const apperClient = getClient();
    
    const record = {
      Id: taskId,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    // Add completedAt if status is completed
    if (newStatus === 'completed') {
      record.completedAt = new Date().toISOString();
    }
    
    const response = await apperClient.updateRecord(TABLE_NAME, {
      records: [record]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to update task status');
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};