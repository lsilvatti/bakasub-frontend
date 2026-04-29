# Bakasub - Web Interface 🌸✨

Ah, então você está olhando o meu código frontend agora? N-não fique encarando muito! Não é como se eu tivesse passado horas criando essa interface React elegante e responsiva só pra facilitar a sua vida! Eu só não aguentava mais olhar pra um terminal feio e sem graça pra traduzir minhas séries o dia todo, tá bom? B-baka!

> **Presta atenção!** Esse repositório é só o meu rostinho bonito (a UI). Se você quer instalar e rodar o Bakasub de verdade como uma pessoa normal, vai olhar o [repositório principal de orquestração](https://github.com/lsilvatti/bakasub).

## 🎀 O Que Eu Estou Vestindo (Tech Stack)
Nem pense em trazer código bagunçado pra cá. Minha estrutura é impecável.
* **Framework:** React 18 + TypeScript (Porque eu gosto do meu código estritamente tipado, diferente da bagunça que é a sua vida!)
* **Build Tool:** Vite (Eu não tenho tempo pra ficar esperando o Webpack compilar, eu preciso de velocidade!)
* **Data Fetching:** TanStack Query v5 (Eu lido com cache, retentativas e atualizações em background automaticamente. De nada.)
* **Estilização:** CSS Modules com um Design System customizado (Nada de CSS global espaguete por aqui. E sim, eu tenho suporte a Modo Escuro/Claro!)
* **Tempo Real:** Server-Sent Events (SSE) via hooks customizados. Eu recebo o progresso do backend ao vivo pra você não ter qu`e ficar dando F5 igual um idiota.
* **i18n:** `react-i18next` (Sim, eu falo vários idiomas. Impressionado?)

## 💻 Como Sair Comigo (Desenvolvimento Local)

Se você realmente quer modificar meus componentes, é bom seguir as regras.

### 1. Pré-requisitos
Você precisa do **Node.js 20+**. Não venha chorar pra mim se estiver usando uma versão antiga.

### 2. Configuração
Faça um clone meu e instale minhas dependências:
```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto pra eu saber onde o meu cérebro (backend) está rodando e também com a sua Key do TMDB (prometo que vou cuidar bem dela).
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_TMDB_ACCESS_TOKEN=seu_token_aqui
```

Quando o Bakasub rodar dentro do Electron, o shell pode sobrescrever a URL do backend em runtime sem rebuild definindo `window.BAKASUB_RUNTIME_CONFIG = { apiUrl: 'http://127.0.0.1:8080/api/v1' }` antes do React iniciar.

Agora existe um shell de referência em `electron/main.cjs` e `electron/preload.cjs`. O preload injeta `window.BAKASUB_RUNTIME_CONFIG`, e o `index.html` carrega `public/runtime-config.js` antes do bundle React para que o mesmo mecanismo também funcione em empacotamentos estáticos.

Para desenvolvimento, você ainda pode mandar o Electron subir o backend a partir do código-fonte definindo `BAKASUB_BACKEND_COMMAND`. Exemplo: `BAKASUB_BACKEND_COMMAND="go run ./cmd/server" BAKASUB_BACKEND_CWD="../bakasub-backend" npm run desktop:run`.

Para builds desktop empacotadas, o Electron agora prefere um binário do backend incluído em `electron/resources/backend/<platform>-<arch>/`. Quando ele sobe esse backend empacotado, o banco SQLite fica dentro do diretório de dados do app e a API faz bind em `127.0.0.1:8080` por padrão, a menos que `LISTEN_ADDR`, `DATABASE_URL` ou `BAKASUB_API_URL` sejam sobrescritos.

### 3. Me Rode!
Inicie o servidor de desenvolvimento.
```bash
npm run dev
```
*Eu estarei te esperando em `http://localhost:5173`. Não me faça esperar muito!*

## 📦 Build de Produção
Quando você finalmente terminar de brincar e quiser me colocar em produção de verdade:
```bash
npm run build
```
Eu vou gerar arquivos estáticos altamente otimizados na pasta `/dist`, prontos para serem servidos pelo Nginx ou qualquer servidor estático que você preferir.

## 🖥️ Distribuição Desktop
Se você quiser o app Electron com o backend já embutido, estes são os comandos principais:

```bash
npm run desktop:backend:build
npm run desktop:pack:dir
npm run desktop:dist:linux
npm run desktop:dist:win
```

`desktop:backend:build` compila o backend Go para a plataforma atual e o coloca na pasta de resources do Electron.

`desktop:pack:dir` gera um app desktop desempacotado da plataforma atual dentro de `/release`.

`desktop:dist:linux` gera os artefatos Linux (`AppImage` e `tar.gz`).

`desktop:dist:win` prepara o binário Windows do backend e pede ao `electron-builder` os alvos portable e NSIS. Em hosts Linux, o empacotamento Windows completo ainda pode exigir a cadeia usual com Wine.