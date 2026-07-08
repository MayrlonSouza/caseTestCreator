require('dotenv').config();
const env = require('./scripts/env');
const express = require('express');
const cors = require('cors');
const { getJiraDescription, addCommentToJiraIssue, createJiraIssue } = require('./scripts/jira');
const { createZephyrFolder, createZephyrTestCase } = require('./scripts/zephyr');
const { generateTestScenariosGemini, formatTaskDescriptionGemini } = require('./scripts/gemini');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function applyTokens(tokens) {
  if (!tokens) return;
  for (const [key, value] of Object.entries(tokens)) {
    if (value && value.trim() !== '') process.env[key] = value;
  }
}

app.post('/testcases', async (req, res) => {
  // Extraindo o novo campo parentKey
  const { action, issueKey, taskTitle, taskText, taskType, parentKey, tokens } = req.body;

  applyTokens(tokens);

  try {
    let finalIssueKey = issueKey;
    let finalDescription = "";
    let isNewTask = false;

    if (action === 'create') {
      if (!taskTitle || !taskText) {
        return res.status(400).json({ error: 'Título e rascunho/contexto são obrigatórios para criar uma nova task.' });
      }
      
      finalDescription = await formatTaskDescriptionGemini(taskText, taskType);
      const issueTypeName = taskType === 'Épico' ? 'Epic' : 'Story';
      
      // Repassando o parentKey para a função do Jira
      finalIssueKey = await createJiraIssue(taskTitle, finalDescription, process.env.ZEPHYR_PROJECT_KEY, issueTypeName, parentKey);
      isNewTask = true;
      console.log(`Task criada com sucesso no Jira: ${finalIssueKey}`);
      
    } else {
      if (!issueKey) {
        return res.status(400).json({ error: 'issueKey é obrigatório para task existente.' });
      }
      finalDescription = await getJiraDescription(issueKey);
      if (!finalDescription) {
        return res.status(404).json({ error: 'Descrição não encontrada no Jira.' });
      }
    }

    if (taskType === 'Épico') {
      return res.json({
        message: `Épico ${finalIssueKey} criado com sucesso no Jira! (A geração de cenários de teste é ignorada para Épicos).`,
        issueKey: finalIssueKey,
        testCases: []
      });
    }
    
    let scenarios = [];
    try {
      scenarios = await generateTestScenariosGemini(finalDescription);
      if (!scenarios.length) {
        throw new Error('Nenhum cenário foi retornado pela formatação da IA.');
      }
    } catch (aiError) {
      console.error("⚠️ Erro na IA ao tentar gerar cenários:", aiError.message);
      
      if (isNewTask) {
        return res.json({
          partialSuccess: true,
          message: `ATENÇÃO: A Task ${finalIssueKey} FOI CRIADA com sucesso no seu Jira! Porém, os servidores do Google falharam ao gerar os cenários de teste. Você pode usar a opção "Gerar Testes para Task Existente" depois.`,
          issueKey: finalIssueKey,
          testCases: []
        });
      } else {
        throw aiError;
      }
    }

    const folderName = `${finalIssueKey} - Test Cases`;
    const folderId = await createZephyrFolder(folderName);
    
    const testCases = [];
    for (const scenario of scenarios) {
      const testCase = await createZephyrTestCase(scenario.title, scenario.description, scenario.bdd, folderId);
      testCases.push({ key: testCase.key, scenario });
    }

    await addCommentToJiraIssue(finalIssueKey, testCases);

    res.json({
      message: action === 'create' 
        ? `Task ${finalIssueKey} criada com sucesso e cenários de teste gerados!` 
        : `Cenários criados e comentados na task ${finalIssueKey}.`,
      issueKey: finalIssueKey,
      testCases,
    });

  } catch (err) {
    console.error(err);
    
    let errorMessage = err.message;
    if (err.response?.data?.error?.message) {
      errorMessage = err.response.data.error.message;
    } else if (typeof err.response?.data?.error === 'string') {
      errorMessage = err.response.data.error;
    } else if (err.response?.data) {
      errorMessage = JSON.stringify(err.response.data);
    }

    res.status(500).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});