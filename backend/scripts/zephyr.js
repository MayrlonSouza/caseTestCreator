require('dotenv').config();
const axios = require('axios');
const env = require('./env');

// Cria uma nova pasta no Zephyr Scale
async function createZephyrFolder(folderName) {
    const response = await axios.post(
        `${env.ZEPHYR_BASE_URL}/folders`,
        {
            name: folderName,
            projectKey: env.ZEPHYR_PROJECT_KEY,
            folderType: "TEST_CASE"
        },
        {
            headers: {
                'Authorization': `Bearer ${env.ZEPHYR_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.id;
}

// Cria um caso de teste no Zephyr Scale
async function createZephyrTestCase(title, description, bdd, folderId) {
    // Cria o caso de teste (sem testScript)
    const response = await axios.post(
        `${env.ZEPHYR_BASE_URL}/testcases`,
        {
            name: title,
            projectKey: env.ZEPHYR_PROJECT_KEY,
            objective: description,
            status: "Draft",
            folderId: folderId,
            customFields: {
                "Might be automated": "Yes"
            }
        },
        {
            headers: {
                'Authorization': `Bearer ${env.ZEPHYR_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    const testCase = response.data;

    // Adiciona o script BDD via POST
    if (bdd && bdd.trim()) {
        try {
            // HIGIENIZAÇÃO DO GHERKIN: 
            // 1. Remove non-breaking spaces que o Zephyr odeia (\u00A0)
            // 2. Substitui qualquer linha começando com "Or" por "And"
            const sanitizedBdd = bdd
                .replace(/\u00A0/g, ' ')
                .replace(/^\s*Or\s/gmi, 'And ');

            await axios.post(
                `${env.ZEPHYR_BASE_URL}/testcases/${testCase.key}/testscript`,
                {
                    type: "bdd",
                    text: sanitizedBdd
                },
                {
                    headers: {
                        'Authorization': `Bearer ${env.ZEPHYR_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (scriptError) {
            // Se o script BDD falhar (erro de sintaxe, etc.), o sistema avisa mas NÃO quebra.
            // O caso de teste já foi criado com sucesso no passo anterior.
            console.error(`⚠️ Erro de sintaxe BDD ignorado no cenário ${testCase.key}:`, scriptError.response?.data || scriptError.message);
        }
    }

    console.log(`Cenário criado: ${testCase.key}`);
    return testCase;
}

module.exports = { createZephyrFolder, createZephyrTestCase };