require('dotenv').config();
const axios = require('axios');
const env = require('./env');

// Gera cenários de teste com Gemini, incluindo título e descrição
async function generateTestScenariosGemini(description) {

    const prompt = `
Atue como um QA Engineer Senior. A partir da seguinte descrição de história de usuário, gere uma lista de cenários de teste claros e objetivos, onde o título e a descrição e o script de teste devem ser em português, e os verbos do BDD em inglês, no seguinte formato:
1. Título: [Título do cenário]
   Descrição: [Descrição detalhada do cenário]
   Script de Teste (BDD):
   """
   Given ...
   When ...
   Then ...
   """
2. Título: [Título do cenário]
   Descrição: [Descrição detalhada do cenário]
   Script de Teste (BDD):
   """
   Given ...
   When ...
   Then ...
   """

IMPORTANTE: Você DEVE seguir EXATAMENTE este padrão de formatação para que meu sistema possa ler sua resposta.
...

Descrição:
${description}
    `;
    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`,
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
    // Extrai os títulos, descrições e scripts BDD dos cenários da resposta
    const text = response.data.candidates[0].content.parts[0].text;
    // Regex para capturar: número, título, descrição e script BDD
    const matches = [...text.matchAll(/^\d+\.\s*Título:\s*(.+)\n\s*Descrição:\s*([^\n]+)\n\s*Script de Teste \(BDD\):\s*"""([\s\S]*?)"""/gm)];
    return matches.map(m => ({
        title: m[1].trim(),
        description: m[2].trim(),
        bdd: m[3].trim()
    }));
}

module.exports = { generateTestScenariosGemini };