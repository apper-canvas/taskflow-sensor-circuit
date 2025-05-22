/**
 * Label Service - Provides methods for CRUD operations on labels
 */

const TABLE_NAME = 'label';

// Field names from the table definition
const FIELDS = [
  'Name',
  'Tags',
  'Owner',
  'CreatedOn',
  'CreatedBy',
  'ModifiedOn',
  'ModifiedBy'
];

// Fields that can be updated by users
const UPDATEABLE_FIELDS = [
  'Name',
  'Tags',
  'Owner'
];

// Get ApperClient instance
const getClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Get all labels
export const getLabels = async () => {
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
    console.error('Error fetching labels:', error);
    throw error;
  }
};

// Create a new label
export const createLabel = async (labelName) => {
  try {
    const apperClient = getClient();
    
    const record = {
      Name: labelName
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, {
      records: [record]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to create label');
  } catch (error) {
    console.error('Error creating label:', error);
    throw error;
  }
};

// Update an existing label
export const updateLabel = async (labelId, labelName) => {
  try {
    const apperClient = getClient();
    
    const record = {
      Id: labelId,
      Name: labelName
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, {
      records: [record]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to update label');
  } catch (error) {
    console.error('Error updating label:', error);
    throw error;
  }
};

// Delete a label
export const deleteLabel = async (labelId) => {
  try {
    const apperClient = getClient();
    
    const response = await apperClient.deleteRecord(TABLE_NAME, {
      RecordIds: [labelId]
    });
    
    if (response && response.success) {
      return true;
    }
    
    throw new Error('Failed to delete label');
  } catch (error) {
    console.error('Error deleting label:', error);
    throw error;
  }
};

// Create multiple labels in one call
export const createLabels = async (labelNames) => {
  try {
    const apperClient = getClient();
    
    const records = labelNames.map(name => ({ Name: name }));
    
    const response = await apperClient.createRecord(TABLE_NAME, {
      records: records
    });
    
    if (response && response.success && response.results) {
      return response.results.filter(r => r.success).map(r => r.data);
    }
    
    throw new Error('Failed to create labels');
  } catch (error) {
    console.error('Error creating labels:', error);
    throw error;
  }
};