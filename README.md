# Ponto PWA ⏱️

O **Ponto** é um aplicativo web progressivo (PWA) simples e offline-first desenvolvido para ajudar trabalhadores e profissionais autônomos a realizarem o registro e controle de suas horas de trabalho diárias. 

## 🎯 Objetivos do Sistema

- **Simplicidade:** Oferecer uma interface amigável e direta para bater o ponto sem burocracias.
- **Offline-First:** Funcionar sem dependência de internet. Os dados ficam salvos localmente no dispositivo do usuário de forma segura.
- **Gestão de Tempo:** Ajudar no cálculo automático de horas trabalhadas no dia, na semana e no controle de banco de horas.
- **Flexibilidade:** Permitir a personalização da jornada de trabalho e dos tipos de registro de ponto.

## 🧱 Blocos e Estrutura

O sistema é dividido em blocos (componentes) principais para facilitar o uso:

1. **🏠 Home (Registro):** A tela principal onde o usuário visualiza o status atual e realiza os apontamentos (Ex: Entrada, Saída para Almoço, Retorno, Saída).
2. **📊 Dashboard:** Um painel de resumo que apresenta as estatísticas de horas trabalhadas no dia atual, o progresso semanal em relação à carga horária e o saldo atual (banco de horas).
3. **📅 Histórico:** Uma listagem completa de todos os registros passados, permitindo a conferência e o filtro dos dias anteriores.
4. **⚙️ Configurações:** Uma área para personalização da carga horária semanal (ex: 44 horas) e visualização do ciclo de apontamentos da empresa.
5. **💾 Banco de Dados Local (`db.js`):** Módulo central responsável pelo armazenamento local utilizando o IndexedDB, garantindo que o aplicativo não perca informações mesmo ao ser fechado ou sem conexão com a internet.

## 💻 Tecnologias Utilizadas

O projeto foi construído utilizando um ecossistema moderno voltado para performance e usabilidade:

- **[React](https://react.dev/) + [Vite](https://vitejs.dev/):** Base da interface do usuário com alta velocidade de desenvolvimento.
- **[Vite PWA Plugin](https://vite-pwa-org.netlify.app/):** Transforma a aplicação web em um aplicativo instalável (PWA) e gerencia o suporte offline via Service Workers.
- **[Dexie.js](https://dexie.org/):** Um wrapper minimalista para o IndexedDB do navegador, responsável pela persistência das batidas de ponto.
- **[date-fns](https://date-fns.org/):** Biblioteca leve e poderosa para cálculos matemáticos e formatações de datas e horas.
- **[Lucide React](https://lucide.dev/):** Conjunto de ícones consistentes e modernos.
- **GitHub Actions & Pages:** Deploy automatizado contínuo (CI/CD) para o GitHub Pages (ver `deploy.yml`).

## 🚀 Como rodar o projeto localmente

1. Faça o clone do repositório:
```bash
git clone <url-do-repositorio>
cd ponto
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador: `http://localhost:5173/`

## 📦 Build e Deploy

Para gerar a versão de produção, utilize o comando:
```bash
npm run build
```

O projeto está configurado para realizar o deploy automático no GitHub Pages toda vez que uma alteração é enviada para a branch `main`.
