require('dotenv').config();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

module.exports = { generateTestScenariosGemini };