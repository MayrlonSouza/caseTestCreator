# Test Case Creator - Automação de Cenários de Teste com IA e Integração Zephyr Scale

Este projeto automatiza a criação de cenários de teste no Zephyr Scale a partir da descrição de histórias do Jira, utilizando inteligência artificial (Gemini) para geração dos cenários.

## Pré-requisitos

- Node.js 18+
- Conta no Jira com acesso à API
- Conta no Zephyr Scale com token de API
- Chave de API do Gemini (Google AI)

## Instalação

1. Clone o repositório:
   ```sh
   git clone <url-do-repositorio>
   cd caseTestCreator
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo (preencha com seus dados):

   ```
   JIRA_USER=seu_email@dominio.com
   JIRA_TOKEN=seu_token_jira
   JIRA_BASE_URL=https://seu-dominio.atlassian.net
   ZEPHYR_TOKEN=seu_token_zephyr
   ZEPHYR_PROJECT_KEY=SEU_PROJETO
   ZEPHYR_BASE_URL=https://api.zephyrscale.smartbear.com/v2
   GEMINI_API_KEY=sua_api_key_gemini
   ```

## Como executar o script

Execute o script passando a chave da issue do Jira como argumento:

```sh
node scripts/jiraToZephyrWithGemini.js PROJ-123
```

- Substitua `PROJ-123` pela chave da história que deseja importar.
- O script irá:
  1. Buscar a descrição da história no Jira.
  2. Gerar cenários de teste com IA (Gemini).
  3. Criar cada cenário no Zephyr Scale.

## Observações

- Certifique-se de que sua conta tem permissão para acessar as APIs do Jira, Zephyr Scale e Gemini.
- O script pode ser adaptado para outros fluxos conforme sua necessidade.