/**
 * Task-Label Service - Provides methods for managing relationships between tasks and labels
 */

const TABLE_NAME = 'task_label';

// Field names from the table definition
const FIELDS = [
  'Name',
  'Tags',
  'Owner',
  'CreatedOn',
  'CreatedBy',
  'ModifiedOn',
  'ModifiedBy',
  'task',
  'label'
];

// Fields that can be updated by users
const UPDATEABLE_FIELDS = [
  'Name',
  'Tags',
  'Owner',
  'task',
  'label'
];

// Get ApperClient instance
const getClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Get all task-label relationships
export const getTaskLabels = async () => {
  try {
    const apperClient = getClient();
    
    const params = {
      fields: FIELDS,
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching task-label relationships:', error);
    throw error;
  }
};

// Get labels for a specific task
export const getLabelsForTask = async (taskId) => {
  try {
    const apperClient = getClient();
    
    const params = {
      fields: FIELDS,
      where: [
        {
          fieldName: 'task',
          operator: 'ExactMatch',
          values: [taskId]
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching labels for task:', error);
    throw error;
  }
};

// Create a task-label relationship
export const createTaskLabel = async (taskId, labelId, name = 'Task Label') => {
  try {
    const apperClient = getClient();
    
    const record = {
      Name: name,
      task: taskId,
      label: labelId
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, {
      records: [record]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to create task-label relationship');
  } catch (error) {
    console.error('Error creating task-label relationship:', error);
    throw error;
  }
};

// Delete a task-label relationship
export const deleteTaskLabel = async (taskLabelId) => {
  try {
    const apperClient = getClient();
    
    const response = await apperClient.deleteRecord(TABLE_NAME, {
      RecordIds: [taskLabelId]
    });
    
    if (response && response.success) {
      return true;
    }
    
    throw new Error('Failed to delete task-label relationship');
  } catch (error) {
    console.error('Error deleting task-label relationship:', error);
    throw error;
  }
};

// Delete all labels for a task
export const deleteAllLabelsForTask = async (taskId) => {
  try {
    // First get all task-label relationships for this task
    const taskLabels = await getLabelsForTask(taskId);
    
    if (taskLabels.length === 0) {
      return true;
    }
    
    const apperClient = getClient();
    
    const response = await apperClient.deleteRecord(TABLE_NAME, {
      RecordIds: taskLabels.map(tl => tl.Id)
    });
    
    if (response && response.success) {
      return true;
    }
    
    throw new Error('Failed to delete labels for task');
  } catch (error) {
    console.error('Error deleting labels for task:', error);
    throw error;
  }
};