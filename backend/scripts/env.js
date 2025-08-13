module.exports = {
  get JIRA_USER() { return process.env.JIRA_USER; },
  get JIRA_TOKEN() { return process.env.JIRA_TOKEN; },
  get JIRA_BASE_URL() { return process.env.JIRA_BASE_URL; },
  get ZEPHYR_TOKEN() { return process.env.ZEPHYR_TOKEN; },
  get ZEPHYR_PROJECT_KEY() { return process.env.ZEPHYR_PROJECT_KEY; },
  get GEMINI_API_KEY() { return process.env.GEMINI_API_KEY; },
  ZEPHYR_BASE_URL: 'https://api.zephyrscale.smartbear.com/v2'
};