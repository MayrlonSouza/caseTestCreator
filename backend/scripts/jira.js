require('dotenv').config();
const axios = require('axios');

// Busca a descrição da issue no Jira
async function getJiraDescription(issueKey) {
    const JIRA_USER = process.env.JIRA_USER;
    const JIRA_TOKEN = process.env.JIRA_TOKEN;
    const JIRA_BASE_URL = process.env.JIRA_BASE_URL;



    const response = await axios.get(
        `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`,
        { auth: { username: JIRA_USER, password: JIRA_TOKEN } }
    );
    // Ajuste conforme o formato do seu Jira
    const descField = response.data.fields.description;
    if (!descField || !descField.content) return '';
    return descField.content
        .map(c => c.content?.map(cc => cc.text).join('') || '')
        .join('\n');
}

// Adiciona um comentário formatado (ADF) na issue do Jira
async function addCommentToJiraIssue(issueKey, testCases) {
    const JIRA_USER = process.env.JIRA_USER;
    const JIRA_TOKEN = process.env.JIRA_TOKEN;
    const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
    const ZEPHYR_PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY;


    const content = [
        {
            type: "paragraph",
            content: [
                { type: "text", text: "Cenários de teste criados automaticamente no Zephyr Scale:" }
            ]
        },
        ...testCases.map(tc => ({
            type: "paragraph",
            content: [
                { type: "text", text: `${tc.key}: ` },
                {
                    type: "text",
                    text: tc.scenario,
                    marks: [
                        { type: "link", attrs: { href: `${JIRA_BASE_URL}projects/${ZEPHYR_PROJECT_KEY}?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCase/${tc.key}` } }
                    ]
                }
            ]
        }))
    ];

    await axios.post(
        `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/comment`,
        {
            body: {
                type: "doc",
                version: 1,
                content
            }
        },
        {
            auth: { username: JIRA_USER, password: JIRA_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

module.exports = { getJiraDescription, addCommentToJiraIssue };