// ------ File: src/services/api.js ------
import axios from 'axios';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

// Fetch article content in HTML format
export const fetchArticleContent = async (title) => {
  try {
    const params = {
      action: 'parse',
      page: title,
      format: 'json',
      prop: 'text|langlinks|categories|links|templates|images|externallinks|sections',
      origin: '*', // Required for CORS
      disablelimitreport: true,
      formatversion: 2
    };

    const url = new URL(WIKIPEDIA_API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await axios.get(url.toString());
    
    if (response.data.error) {
      throw new Error(response.data.error.info);
    }
    
    return response.data.parse;
  } catch (error) {
    console.error('Error fetching article content:', error);
    throw error;
  }
};

// Search Wikipedia
export const searchWikipedia = async (searchTerm) => {
  try {
    const params = {
      action: 'query',
      list: 'search',
      srsearch: searchTerm,
      format: 'json',
      origin: '*',
      srlimit: 20,
      formatversion: 2
    };

    const url = new URL(WIKIPEDIA_API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await axios.get(url.toString());
    
    if (response.data.error) {
      throw new Error(response.data.error.info);
    }
    
    return response.data.query.search;
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    throw error;
  }
};

export const fetchArticleMetadata = async (title) => {
  try {
    const params = {
      action: 'query',
      prop: 'info|contributors',
      titles: title,
      inprop: 'url|displaytitle',
      pclimit: 5, // Top 5 contributors
      format: 'json',
      origin: '*'
    };

    const url = new URL(WIKIPEDIA_API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await axios.get(url.toString());
    
    if (response.data.error) {
      throw new Error(response.data.error.info);
    }
    
    // Extract page data from response
    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    return pages[pageId];
  } catch (error) {
    console.error('Error fetching article metadata:', error);
    throw error;
  }
};

/**
 * Fetch links from an article
 * @param {string} title - Article title
 * @returns {Promise<Array>} - Promise resolving to array of linked article titles
 */
export const fetchArticleLinks = async (title) => {
  try {
    const params = {
      action: 'parse',
      page: title,
      format: 'json',
      prop: 'links',
      origin: '*',
      formatversion: 2
    };

    const url = new URL(WIKIPEDIA_API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await axios.get(url.toString());
    
    if (response.data.error) {
      throw new Error(response.data.error.info);
    }
    
    // Extract link titles
    const links = response.data.parse.links
      .filter(link => link.ns === 0) // Only main namespace links
      .map(link => link.title);
    
    return links;
  } catch (error) {
    console.error('Error fetching article links:', error);
    throw error;
  }
};

/**
 * Fetch categories an article belongs to
 * @param {string} title - Article title
 * @returns {Promise<Array>} - Promise resolving to array of category titles
 */
export const fetchCategoryMembers = async (title) => {
  try {
    const params = {
      action: 'query',
      titles: title,
      prop: 'categories',
      format: 'json',
      origin: '*',
      formatversion: 2
    };

    const url = new URL(WIKIPEDIA_API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await axios.get(url.toString());
    
    if (response.data.error) {
      throw new Error(response.data.error.info);
    }
    
    // Extract category titles
    const page = response.data.query.pages[0];
    const categories = page.categories
      ? page.categories
          .map(cat => cat.title)
          .map(cat => cat.replace(/^Category:/, '')) // Remove "Category:" prefix
      : [];
    
    return categories;
  } catch (error) {
    console.error('Error fetching category members:', error);
    throw error;
  }
};