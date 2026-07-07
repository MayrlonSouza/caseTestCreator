require('dotenv').config();
const axios = require('axios');
const env = require('./env');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função Central com Fail-over e Espera Inteligente
async function fetchGeminiWithFailover(prompt) {
    const modelsToTry = [
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash'
    ];

    let lastError = null;
    const maxRetriesPerModel = 3; // Tentará 3 vezes cada modelo

    for (const model of modelsToTry) {
        for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
            try {
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
                    { contents: [{ parts: [{ text: prompt }] }] },
                    { headers: { 'Content-Type': 'application/json' } }
                );
                return response.data.candidates[0].content.parts[0].text;
                
            } catch (error) {
                const status = error.response?.status;
                lastError = error;
                
                if (status === 429) {
                    console.warn(`⏳ [Aviso] Limite de cota atingido no ${model}. Aguardando 20s (Tentativa ${attempt}/${maxRetriesPerModel})...`);
                    await sleep(20000); 
                    continue; 
                }
                
                if (status === 503 || status === 500) {
                    console.warn(`⚠️ Instabilidade (${status}) no ${model}. Aguardando 5s (Tentativa ${attempt}/${maxRetriesPerModel})...`);
                    await sleep(5000); // Espera 5s e tenta o mesmo modelo de novo
                    continue;
                }

                if (status === 404) {
                    console.warn(`⚠️ Modelo ${model} indisponível (404). Indo para o próximo...`);
                    break; // Pula para o próximo modelo da lista
                }

                throw error; // Se for erro de autenticação (403) ou sintaxe (400), aborta tudo.
            }
        }
    }
    throw lastError;
}

// Gera cenários de teste com Gemini
async function generateTestScenariosGemini(description) {
    const prompt = `
Atue como um QA Engineer Senior. A partir da seguinte descrição de história de usuário, gere uma lista de cenários de teste claros e objetivos.

REGRAS:
- O título e a descrição devem ser em português.
- O Script de Teste (BDD) DEVE ser escrito em inglês e seguir ESTRITAMENTE a sintaxe oficial Gherkin.
- Palavras-chave permitidas no BDD: Given, When, Then, And, But.
- NUNCA USE a palavra "Or". Em vez de "Or", utilize "And".

Siga exatamente o formato abaixo:
1. Título: [Título do cenário]
   Descrição: [Descrição detalhada do cenário]
   Script de Teste (BDD):
   """
   Given ...
   And ...
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

Descrição:
${description}
    `;
    
    const text = await fetchGeminiWithFailover(prompt);
    
    const matches = [...text.matchAll(/^\d+\.\s*Título:\s*(.+)\n\s*Descrição:\s*([^\n]+)\n\s*Script de Teste \(BDD\):\s*"""([\s\S]*?)"""/gm)];
    return matches.map(m => ({
        title: m[1].trim(),
        description: m[2].trim(),
        bdd: m[3].trim()
    }));
}

// Formatar e Otimizar a Descrição da Task antes de criar
async function formatTaskDescriptionGemini(description, type) {
    let promptBase = '';

    if (type === 'Backend') {
        promptBase = `Você é um product Manager que trabalha na empresa Dock Tech e é responsável pela criação e evolução de produtos backend de APIs voltados para o mundo financeiro para o sistema Dock Console que é um backoffice. Seus produtos possuem o objetivo de atender a clientes do mundo inteiro dando a eles uma plataforma completa.
Você deverá criar uma história de usuário utilizando os contextos fornecidos para que esta possa ser utilizada pelo time de engenharia para desenvolver cada nova funcionalidade que você precisar.
Estas histórias de usuário deverão ser compostas de cinco itens principais:

Objetivo - Que parte da funcionalidade será desenvolvida nesta história de usuário e qual o principal objetivo dela.
História de usuário - Como deve ser o comportamento do usuário com esta funcionalidade.
API - Criar o contrato da API que será utilizado na funcionalidade bem como os responses de sucesso e de erro.
Regras de Negócio - Quais as regras que esta funcionalidade deverá respeitar.
Critérios de Aceite - quais os critérios que a nova funcionalidade deverá conter para que possamos liberar para os nossos clientes.`;

    } else if (type === 'Frontend') {
        promptBase = `Você é um Product Manager especialista em User Experience (UX) e User Interface (UI) na empresa Dock Tech. Você é responsável pela evolução do Dock Console, nosso sistema de backoffice.

Sua missão é traduzir as funcionalidades de backend, já especificadas em histórias próprias, em interfaces intuitivas, eficientes e visualmente coesas para nossos clientes globais. As histórias de frontend que você cria são a principal fonte de verdade para o time de desenvolvimento de interface.

Você deverá criar uma história de usuário para o frontend que esteja vinculada a uma história de backend existente. A história deve ser extremamente clara, deixando pouca ou nenhuma margem para interpretação, e deve seguir a estrutura de 6 itens abaixo:

1. Objetivo:
- Qual problema do usuário esta interface resolve ou qual valor ela entrega?
- Qual o ID ou link da história de backend à qual esta funcionalidade de frontend está associada?

2. História de Usuário (Visão do Usuário):
Use o formato clássico: "Como um [TIPO DE USUÁRIO], eu quero [REALIZAR UMA AÇÃO NA INTERFACE], para que [EU OBTENHA UM BENEFÍCIO]".

3. Referências de Design (Figma):
Forneça o link direto para a tela, componente ou fluxo no Figma.
Crucial: Especifique se o design no Figma inclui todos os estados visuais necessários (ex: estado de carregamento, estado vazio, estado de erro, sucesso, campos desabilitados).

4. Integração e Dados (Contrato com o Frontend):
Liste quais endpoints da API (definidos na história de backend) esta interface irá consumir.
Descreva brevemente quais dados de cada response da API serão exibidos na tela. (Ex: "Do endpoint GET /users/{id}, vamos exibir os campos name, email e status").

5. Regras de Comportamento e Validação da Interface:
Validações de Formulário: Especifique as validações que devem ocorrer no lado do cliente antes de enviar os dados.
Tratamento de Estados: Descreva como a interface deve se comportar visualmente em cada estado.

6. Critérios de Aceite:
Lista de verificação (checklist) que define quando a história está "pronta".
Funcional: A interface renderiza corretamente com os dados da API vinculada.
Visual: A implementação é "pixel-perfect" em relação ao design do Figma.
Comportamental: Todas as interações, validações e estados descritos nas regras de comportamento funcionam conforme o esperado.`;

    } else if (type === 'Épico') {
        promptBase = `Você é um Product Manager que trabalha em uma empresa do setor financeiro. Nesta empresa você faz parte de um time que constrói produtos de API backend para que nossos clientes possam se conectar através destas APIs e utilizar todos os nossos serviços.

Através deste contexto você irá criar um Epic baseado nas informações que eu vou fornecer. Este Epic será inserido no Jira.

Ao criar um Epic, você deve focar nos seguintes requisitos:
Descrição - O que é a funcionalidade e qual o objetivo que queremos atingir com esta nova funcionalidade.
Requisitos do Produto - o que este produto irá fazer e como irá fazer.
Requisitos Técnicos - como devemos implementar esta nova funcionalidade levando em consideração que meu produto é uma API.
Critérios de Aceite - o que deve ser levado em consideração para que esta funcionalidade seja considerada como pronta.
Métricas de sucesso - o que deve ser medido para garantir que esta funcionalidade terá sucesso.
História de usuário (Elevator pitch) - como eu devo fazer um discurso.`;
    }

    const jiraMarkupInstruction = `\n\nIMPORTANTE - REGRAS DE FORMATAÇÃO PARA O JIRA:
A sua resposta será inserida DIRETAMENTE no Jira. Por isso, você DEVE utilizar a formatação "Jira Wiki Markup".
NÃO USE Markdown padrão (NUNCA use #, ##, **, \`\`\`).

Siga estas regras estritamente para que o texto fique bem formatado no Jira:
- Títulos: h1. Título principal, h2. Subtítulo, h3. Seção (sempre comece a linha com a tag e dê um espaço antes da palavra)
- Negrito: *texto* (apenas um asterisco de cada lado)
- Itálico: _texto_
- Blocos de código: {code:json} seu código json aqui {code}
- Listas não ordenadas: - item ou * item (um por linha)
- Listas ordenadas: # item (um por linha)

Crie a história com essa sintaxe para ficar visualmente impecável no Jira!`;

    const prompt = `${promptBase}${jiraMarkupInstruction}\n\nAbaixo está o rascunho/informações para você criar a tarefa baseada nessas regras:\n\n${description}`;

    const text = await fetchGeminiWithFailover(prompt);
    
    return text;
}

module.exports = { generateTestScenariosGemini, formatTaskDescriptionGemini };