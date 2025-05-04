// Get user notes for a specific article
export const getUserNotes = async (articleTitle) => {
    try {
      // In a real app, this would call an API endpoint
      // For this demo, we'll use localStorage
      const key = `wiki-notes-${articleTitle}`;
      const storedNotes = localStorage.getItem(key);
      
      if (storedNotes) {
        return JSON.parse(storedNotes);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user notes:', error);
      return [];
    }
  };
  
  // Save user notes for a specific article
  export const saveUserNotes = async (articleTitle, notes) => {
    try {
      // In a real app, this would call an API endpoint
      // For this demo, we'll use localStorage
      const key = `wiki-notes-${articleTitle}`;
      localStorage.setItem(key, JSON.stringify(notes));
      return true;
    } catch (error) {
      console.error('Error saving user notes:', error);
      return false;
    }
  };