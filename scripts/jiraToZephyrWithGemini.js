// Requer: axios, dotenv (npm install axios dotenv)
// Crie um arquivo .env com JIRA_USER, JIRA_TOKEN, JIRA_BASE_URL, ZEPHYR_TOKEN, ZEPHYR_PROJECT_KEY, ZEPHYR_BASE_URL, GEMINI_API_KEY

require('dotenv').config();
const axios = require('axios');

// Config Jira
const JIRA_USER = process.env.JIRA_USER;
const JIRA_TOKEN = process.env.JIRA_TOKEN;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const ISSUE_KEY = process.argv[2];

// Config Zephyr
const ZEPHYR_TOKEN = process.env.ZEPHYR_TOKEN;
const ZEPHYR_PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY;
const ZEPHYR_BASE_URL = process.env.ZEPHYR_BASE_URL;

// Config Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


// Cria uma nova pasta no Zephyr Scale
async function createZephyrFolder(folderName) {
    const response = await axios.post(
        `${ZEPHYR_BASE_URL}/folders`,
        {
            name: folderName,
            projectKey: ZEPHYR_PROJECT_KEY,
            folderType: "TEST_CASE"
        },
        {
            headers: {
                'Authorization': `Bearer ${ZEPHYR_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.id;
}

// Busca descrição da issue no Jira
async function getJiraDescription(issueKey) {
    const response = await axios.get(
        `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`,
        {
            auth: { username: JIRA_USER, password: JIRA_TOKEN }
        }
    );
    return response.data.fields.description?.content?.map(c => c.content?.map(cc => cc.text).join('')).join('\n') || '';
}

// Gera cenários de teste com Gemini
async function generateTestScenariosGemini(description) {
    const prompt = `
A partir da seguinte descrição de história de usuário, gere uma lista de cenários de teste claros e objetivos, em português, no formato:
1. [Título do cenário]
2. [Título do cenário]
...

Descrição:
${description}
    `;
    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    // Extrai os títulos dos cenários da resposta
    const text = response.data.candidates[0].content.parts[0].text;
    return text.match(/^\d+\.\s*(.+)$/gm)
        ?.map(line => {
            // Remove "**" do início, pega só até ":" ou "–" ou "-" ou "**"
            let clean = line.replace(/^\d+\.\s*/, '').replace(/^\*+\s*/, '');
            const match = clean.match(/^(.+?)(:|–|-|\*\*)/);
            return match ? match[1].trim() : clean.trim();
        }) || [];
}

// Cria cenário no Zephyr Scale
async function createZephyrTestCase(title, description, folderId) {
    const response = await axios.post(
        `${ZEPHYR_BASE_URL}/testcases`,
        {
            name: title,
            projectKey: ZEPHYR_PROJECT_KEY,
            objective: description,
            status: "Draft",
            folderId: folderId,
            customFields: {
                "Might be automated": "Yes",
                "Product": "Issuing",
                "Time": "Dock"
            }
        },
        {
            headers: {
                'Authorization': `Bearer ${ZEPHYR_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    console.log(`Cenário criado: ${response.data.key}`);
}

// Fluxo principal
(async () => {
    if (!ISSUE_KEY) {
        console.error('Passe a chave da issue como argumento. Ex: node scripts/jiraToZephyrWithGemini.js PROJ-123');
        process.exit(1);
    }
    // Gera o nome da pasta automaticamente
    const folderName = `${ISSUE_KEY} - Test Cases`;

    try {
        // Cria a pasta no Zephyr Scale
        const folderId = await createZephyrFolder(folderName);
        const description = await getJiraDescription(ISSUE_KEY);
        if (!description) {
            console.error('Descrição não encontrada.');
            return;
        }
        const scenarios = await generateTestScenariosGemini(description);
        if (!scenarios.length) {
            console.error('Nenhum cenário gerado pela IA.');
            return;
        }
        for (const scenario of scenarios) {
            await createZephyrTestCase(scenario, description, folderId);
        }
    } catch (err) {
        console.error('Erro:', err.response?.data || err.message);
    }
})();