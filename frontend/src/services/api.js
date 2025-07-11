import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // ajuste para a porta do seu backend

function getCustomTokens() {
  // Busca todos os tokens salvos no localStorage
  return {
    JIRA_USER: localStorage.getItem('JIRA_USER') || '',
    JIRA_TOKEN: localStorage.getItem('JIRA_TOKEN') || '',
    JIRA_BASE_URL: localStorage.getItem('JIRA_BASE_URL') || '',
    ZEPHYR_TOKEN: localStorage.getItem('ZEPHYR_TOKEN') || '',
    ZEPHYR_PROJECT_KEY: localStorage.getItem('ZEPHYR_PROJECT_KEY') || '',
    GEMINI_API_KEY: localStorage.getItem('GEMINI_API_KEY') || '',
  };
}

export const createTestCases = async (issueKey) => {
  const tokens = getCustomTokens();
  const response = await axios.post(`${API_BASE_URL}/testcases`, { issueKey, tokens });
  return response.data;
};

export const generateAndApplyUserStory = async (issueKey, description) => {
  const tokens = getCustomTokens();
  const response = await axios.post('http://localhost:3001/userstory', { issueKey, description, tokens });
  return response.data;
};