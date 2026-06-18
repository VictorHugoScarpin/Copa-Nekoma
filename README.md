# 🏆 Bolão Copa

O **Bolão Copa** é uma plataforma interativa, dinâmica e moderna desenvolvida para transformar a experiência de acompanhar grandes competições esportivas em um verdadeiro torneio de engajamento, estratégia e rivalidade saudável entre amigos e familiares.

---

## 📖 A História e Evolução do Projeto

O projeto nasceu de uma ideia despretensiosa: criar um sistema de palpites simples para um grupo restrito de 5 a 7 pessoas do **Servidor Nekoma**. No entanto, à medida que as linhas de código ganhavam forma, o entusiasmo transbordou o servidor. 

O sistema foi aberto para amigos e familiares próximos, escalando rapidamente para **mais de 20 usuários ativos** competindo diretamente. O que era para ser apenas um controle de palpites individual evoluiu para um ecossistema completo de entretenimento interativo, impulsionado pela paixão por tecnologia e futebol — com direito a **prêmios reais** para os melhores colocados!

Inicialmente concebido apenas como um "Bolão tradicional", o ciclo de desenvolvimento transformou o projeto em um hub de jogos. Ao longo das sprints, foram aplicados conceitos avançados e novas features, como um **Fantasy Game**, sistemas de **Quizzes dinâmicos** e interações síncronas.

---

## 🚀 Funcionalidades da Versão Final

A versão estável e final da plataforma conta com uma arquitetura modularizada e recursos premium voltados para a experiência do usuário (UX):

* 📅 **Matches Page (Datas dos Jogos):** Um calendário completo e automatizado exibindo as datas, horários e confrontos da competição para que ninguém perca o prazo de registrar suas apostas.
* 🔮 **Guesses Page (Palpites):** A central onde a mágica acontece. Uma interface intuitiva para salvar e atualizar os palpites de cada partida antes do apito inicial.
* 📊 **Ranking & Tabela de Classificação:** Um ecossistema de pontuação automatizado que processa os resultados reais, atualiza a tabela de classificação e gera o ranking dos participantes em tempo real.
* 🧠 **Quiz Premiado:** Sistema de perguntas e respostas dinâmicas integrado à plataforma, valendo pontuações extras e recompensas físicas/reais para testar o conhecimento dos competidores.
* 💬 **Chat em Tempo Real:** Uma sala de bate-papo integrada diretamente no sistema utilizando **Supabase Realtime**, permitindo resenhas, provocações e discussões sobre os jogos instantaneamente à medida que os gols acontecem.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema JavaScript/TypeScript, visando performance extrema, design responsivo e banco de dados reativo:

* **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) (Garantindo builds instantâneos e SPA de alta performance)
* **Estilização:** Tailwind CSS / Custom CSS (Design moderno, limpo e imersivo)
* **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (Autenticação, PostgreSQL e **Realtime WebSockets** para o Chat)
* **Automação & Infra:** GitHub Actions (Workflows customizados e automatizados para manutenção e deploys controlados via `workflow_dispatch`)

---

## ⚙️ Configuração e Instalação

Caso queira rodar o projeto localmente para testes ou desenvolvimento:

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/bol-o-copa.git](https://github.com/seu-usuario/bol-o-copa.git)
   cd bol-o-copa
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente (`.env`):**
   Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_supabase_url
   VITE_SUPABASE_ANON_KEY=sua_supabase_anon_key
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---

## 🛡️ Scripts de Manutenção (GitHub Actions)

O repositório possui fluxos de trabalho configurados no GitHub Actions para manutenções pontuais. Por exemplo, o script de limpeza de chat foi estruturado para rodar **exclusivamente de forma manual** (`workflow_dispatch`), garantindo que os administradores tenham controle absoluto sobre o banco de dados sem automações indesejadas que possam atrapalhar a experiência dos usuários.

---

*Desenvolvido com 💻, ⚽ e muita resenha no Servidor Nekoma.*
