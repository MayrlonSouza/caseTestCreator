require('dotenv').config();
const axios = require('axios');
const env = require('./env');

// Busca a descrição da issue no Jira
async function getJiraDescription(issueKey) {

    const response = await axios.get(
        `${env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`,
        { auth: { username: env.JIRA_USER, password: env.JIRA_TOKEN } }
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
                    text: tc.scenario.title,
                    marks: [
                        { type: "link", attrs: { href: `${env.JIRA_BASE_URL}projects/${env.ZEPHYR_PROJECT_KEY}?selectedItem=com.atlassian.plugins.atlassian-connect-plugin:com.kanoah.test-manager__main-project-page#!/v2/testCase/${tc.key}` } }
                    ]
                }
            ]
        }))
    ];

    await axios.post(
        `${env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/comment`,
        {
            body: {
                type: "doc",
                version: 1,
                content
            }
        },
        {
            auth: { username: env.JIRA_USER, password: env.JIRA_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

module.exports = { getJiraDescription, addCommentToJiraIssue };