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

// Atualiza a descrição da issue no Jira usando ADF
async function updateJiraDescription(issueKey, userStoryText) {
    // Separa a user story dos critérios de aceite
    const lines = userStoryText.split('\n').map(l => l.trim()).filter(Boolean);
    const userStoryLine = lines[0] || '';
    const criteriaStart = lines.findIndex(line => line.toLowerCase().includes('critério'));
    const criteriaLines = criteriaStart >= 0 ? lines.slice(criteriaStart + 1) : [];
    const criteria = criteriaLines
        .map(line => line.replace(/^[-–•]\s*/, '').trim())
        .filter(Boolean);

    // Monta o ADF
    const adfContent = {
        type: "doc",
        version: 1,
        content: [
            {
                type: "paragraph",
                content: [{ type: "text", text: userStoryLine }]
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Critérios de Aceite" }]
            },
            ...criteria.map(crit => ({
                type: "paragraph",
                content: [{ type: "text", text: crit }]
            }))
        ]
    };

    await axios.put(
        `${env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`,
        {
            fields: {
                description: adfContent
            }
        },
        {
            auth: { username: env.JIRA_USER, password: env.JIRA_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

module.exports = { getJiraDescription, addCommentToJiraIssue, updateJiraDescription };