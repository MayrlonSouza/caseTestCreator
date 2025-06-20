const { getJiraDescription, addCommentToJiraIssue } = require('./jira');
const { createZephyrFolder, createZephyrTestCase } = require('./zephyr');
const { generateTestScenariosGemini } = require('./gemini');

const ISSUE_KEY = process.argv[2];
const folderName = `${ISSUE_KEY} - Test Cases`;

(async function main() {
    if (!ISSUE_KEY) {
        console.error('Passe a chave da issue como argumento. Ex: node scripts/app.js PROJ-123');
        process.exit(1);
    }

    try {
        
        // 1. Busca a descrição da issue no Jira
        const description = await getJiraDescription(ISSUE_KEY);
        if (!description) {
            console.error('Descrição não encontrada.');
            return;
        }
        
        // 2. Gera cenários de teste com Gemini
        const scenarios = await generateTestScenariosGemini(description);
        if (!scenarios.length) {
            console.error('Nenhum cenário gerado pela IA.');
            return;
        }
        
        // 3. Cria a pasta no Zephyr Scale
        const folderId = await createZephyrFolder(folderName);

        // 4. Cria os casos de teste no Zephyr Scale e acumula para comentar no Jira
        const testCases = [];
        for (const scenario of scenarios) {
            const testCase = await createZephyrTestCase(scenario, description, folderId);
            testCases.push({ key: testCase.key, scenario });
        }

        // 5. Adiciona um único comentário na issue do Jira com todos os cenários
        await addCommentToJiraIssue(ISSUE_KEY, testCases);

        console.log('Comentário adicionado na issue do Jira com todos os cenários.');
    } catch (err) {
        console.error('Erro:', err.response?.data || err.message);
    }
})();