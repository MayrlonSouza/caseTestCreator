require('dotenv').config();
const env = require('./scripts/env');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { getJiraDescription, addCommentToJiraIssue, updateJiraDescription } = require('./scripts/jira');
const { createZephyrFolder, createZephyrTestCase } = require('./scripts/zephyr');
const { generateTestScenariosGemini, generateUserStoryGemini } = require('./scripts/gemini');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Função para sobrescrever process.env temporariamente
function applyTokens(tokens) {
  if (!tokens) return;
  for (const [key, value] of Object.entries(tokens)) {
    if (value && value.trim() !== '') process.env[key] = value;
  }
}

app.post('/testcases', async (req, res) => {
  const { issueKey, tokens } = req.body;
  if (!issueKey) {
    return res.status(400).json({ error: 'issueKey é obrigatório' });
  }

  // Aplica os tokens enviados pelo frontend
  applyTokens(tokens);

  const folderName = `${issueKey} - Test Cases`;

  try {
    
    // 1. Busca a descrição da issue no Jira
    const description = await getJiraDescription(issueKey);
    if (!description) {
      return res.status(404).json({ error: 'Descrição não encontrada no Jira.' });
    }
    
    // 2. Gera cenários de teste com Gemini
    const scenarios = await generateTestScenariosGemini(description);
    if (!scenarios.length) {
      return res.status(500).json({ error: 'Nenhum cenário gerado pela IA.' });
    }
    
    // 3. Cria a pasta no Zephyr Scale
    const folderId = await createZephyrFolder(folderName);
    
    // 4. Cria os casos de teste no Zephyr Scale
    const testCases = [];
    for (const scenario of scenarios) {
      const testCase = await createZephyrTestCase(scenario.title, scenario.description, scenario.bdd, folderId);
      testCases.push({ key: testCase.key, scenario });
    }

    // 5. Adiciona comentário na issue do Jira
    await addCommentToJiraIssue(issueKey, testCases);

    res.json({
      message: 'Cenários criados e comentário adicionado no Jira.',
      testCases,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.post('/userstory', async (req, res) => {
  const { issueKey, description, tokens } = req.body;
  if (!issueKey || !description) {
    return res.status(400).json({ error: 'issueKey e description são obrigatórios' });
  }
  applyTokens(tokens);
  try {
    const userStory = await generateUserStoryGemini(description);
    await updateJiraDescription(issueKey, userStory);
    res.json({ message: 'User Story gerada e aplicada na issue!', userStory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});