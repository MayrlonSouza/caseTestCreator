require('dotenv').config();
const axios = require('axios');
const env = require('./env');

// Gera cenários de teste com Gemini, incluindo título e descrição
async function generateTestScenariosGemini(description) {

    const prompt = `
Atue como um QA Engineer Senior. A partir da seguinte descrição de história de usuário, gere uma lista de cenários de teste claros e objetivos.
Os cenários devem ser em português, e os verbos do BDD em inglês.

IMPORTANTE: Substitua os exemplos abaixo pelos cenários REAIS gerados com base na história. NÃO utilize colchetes ou reticências na sua resposta final.

Formato OBRIGATÓRIO (siga exatamente este padrão, sem usar markdown como negrito):
1. Título: Título real do cenário
   Descrição: Descrição detalhada do cenário
   Script de Teste (BDD):
   """
   Given o contexto inicial
   When a ação acontece
   Then o resultado esperado
   """

Descrição da história:
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

    const text = response.data.candidates[0].content.parts[0].text;
    
    // Regex aprimorado: tolera asteriscos (**) caso a IA insista em formatar como Markdown
    const regex = /^\d+\.\s*\**Título:\**\s*(.+)\n\s*\**Descrição:\**\s*([^\n]+)\n\s*\**Script de Teste \(BDD\):\**\s*"""([\s\S]*?)"""/gm;
    const matches = [...text.matchAll(regex)];

    return matches.map(m => ({
        // Limpa possíveis asteriscos que tenham sobrado no título ou descrição
        title: m[1].replace(/\*\*/g, '').trim(),
        description: m[2].replace(/\*\*/g, '').trim(),
        bdd: m[3].trim()
    }));
}

module.exports = { generateTestScenariosGemini };