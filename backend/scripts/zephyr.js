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
async function createZephyrTestCase(title, description, folderId) {

    const response = await axios.post(
        `${env.ZEPHYR_BASE_URL}/testcases`,
        {
            name: title,
            projectKey: env.ZEPHYR_PROJECT_KEY,
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
                'Authorization': `Bearer ${env.ZEPHYR_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    );
    console.log(`Cenário criado: ${response.data.key}`);
    return response.data;
}

module.exports = { createZephyrFolder, createZephyrTestCase };