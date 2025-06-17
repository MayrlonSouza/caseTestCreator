require('dotenv').config();
const axios = require('axios');

const ZEPHYR_TOKEN = process.env.ZEPHYR_TOKEN;
const ZEPHYR_PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY;
const ZEPHYR_BASE_URL = process.env.ZEPHYR_BASE_URL;

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

// Cria um caso de teste no Zephyr Scale
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
    return response.data;
}

module.exports = { createZephyrFolder, createZephyrTestCase };