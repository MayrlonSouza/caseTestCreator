# Test Case Creator - Automação de Cenários de Teste com IA e Integração Zephyr Scale

Este projeto automatiza a criação de cenários de teste no Zephyr Scale a partir da descrição de histórias do Jira, utilizando inteligência artificial (Gemini) para geração dos cenários. Todos os cenários criados são comentados automaticamente na issue do Jira, com links diretos para cada caso de teste no Zephyr Scale.

## Estrutura do Projeto

```
backend/
  .env
  package.json
  server.js
  scripts/
    app.js
    jira.js
    zephyr.js
    gemini.js

frontend/
  package.json
  index.html
  vite.config.js
  src/
    App.jsx
    main.jsx
    index.css
    components/
      ConfigDialog.jsx
      TestCaseForm.jsx
    services/
      api.js
```

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

2. Instale as dependências do backend:
   ```sh
   cd backend
   npm install
   ```

3. Instale as dependências do frontend:
   ```sh
   cd ../frontend
   npm install
   ```

## Como rodar o projeto

### 1. Inicie o backend

No diretório `backend`, execute:

```sh
npm start
```
ou
```sh
node server.js
```

O backend ficará disponível em [http://localhost:3001](http://localhost:3001).

### 2. Inicie o frontend

Abra um novo terminal, acesse a pasta `frontend` e rode:

```sh
npm run dev
```

O frontend ficará disponível em [http://localhost:5173](http://localhost:5173) (ou a porta exibida no terminal).

### 3. Configuração dos tokens pelo frontend

- Clique no ícone de engrenagem no canto superior direito da interface web.
- Preencha todos os campos de configuração com seus tokens e URLs.
- Salve e recarregue a página.

### 4. Utilização

- Informe o ID da task do Jira no campo indicado e clique em "Criar Cenários".
- O sistema irá:
  1. Buscar a descrição da história no Jira.
  2. Gerar cenários de teste com IA (Gemini).
  3. Criar automaticamente uma nova pasta no Zephyr Scale chamada `PROJ-123 - Test Cases`.
  4. Criar cada cenário de teste dentro dessa nova pasta.
  5. Adicionar um único comentário na issue do Jira, listando todos os cenários criados, cada um com link direto para o caso de teste no Zephyr Scale.

## Observações

- Certifique-se de que sua conta tem permissão para acessar as APIs do Jira, Zephyr Scale e Gemini.
- O comentário na issue do Jira é formatado e contém links clicáveis para cada caso de teste criado.
- O script pode ser adaptado para outros fluxos conforme sua necessidade.