# ⚽ DraftFut

### Plataforma de análise e scouting de jogadores baseada em dados

O **DraftFut** é uma plataforma de análise esportiva desenvolvida para auxiliar na avaliação de jogadores e na tomada de decisões no futebol por meio de **dados estatísticos e métricas de desempenho**.

O projeto combina uma interface web com uma API em Python para analisar o desempenho de equipes e jogadores, calcular indicadores de desempenho e simular o impacto que uma contratação poderia gerar em uma equipe.

> **Objetivo:** transformar dados estatísticos em informações úteis para scouting, análise de desempenho e tomada de decisão no futebol.

---

## 🚀 Demonstração

🌐 **Aplicação:**
https://draftfut.vercel.app/

💻 **Repositório:**
https://github.com/Deneeerr/Draft-Fut

---

## 📊 Principais funcionalidades

### 📈 Dashboard

O DraftFut apresenta um dashboard para visualização dos principais indicadores de desempenho de uma equipe.

Entre as informações analisadas estão:

* Finalizações
* Finalizações no alvo
* Expected Goals (xG)
* Gols marcados
* Desarmes
* Interceptações
* Gols sofridos
* Posse de bola
* Precisão dos passes
* Chances criadas
* Assistências

---

### 🧮 ICE — Índice de Compatibilidade da Equipe

O **ICE** é o principal indicador coletivo utilizado pelo projeto.

Ele é dividido em quatro pilares:

| Pilar          | Descrição                                                             |
| -------------- | --------------------------------------------------------------------- |
| **Conexão**    | Capacidade de criar oportunidades e participar da construção ofensiva |
| **Eficiência** | Capacidade de transformar ações ofensivas em finalizações e gols      |
| **Defesa**     | Organização e eficiência defensiva                                    |
| **Controle**   | Capacidade de controlar a posse e a circulação da bola                |

O cálculo utiliza a seguinte ponderação:

```text
ICE = (0.35 × Conexão)
    + (0.25 × Eficiência)
    + (0.20 × Defesa)
    + (0.20 × Controle)
```

Os indicadores são normalizados para uma escala de **0 a 100**, permitindo comparar diferentes métricas dentro do mesmo modelo.

A implementação atual do cálculo está localizada no backend da aplicação.

---

## 🧠 IIP — Índice de Impacto do Jogador

Além da análise coletiva, o DraftFut calcula um índice individual para estimar o impacto de um jogador dentro de uma equipe.

O **IIP** utiliza três pilares:

* **O — Ofensivo**
* **P — Posse/Construção**
* **D — Defensivo**

A importância de cada pilar varia de acordo com a posição do jogador.

### ⚽ Pesos por posição

| Posição       | Ofensivo | Posse | Defesa |
| ------------- | -------: | ----: | -----: |
| Atacante      |      60% |   25% |    15% |
| Meia avançado |      35% |   45% |    20% |
| Meio-campista |      35% |   45% |    20% |
| Volante       |      20% |   40% |    40% |
| Zagueiro      |      10% |   30% |    60% |
| Defensor      |      10% |   30% |    60% |
| Lateral       |      30% |   35% |    35% |

Dessa forma, o modelo procura considerar que **um jogador não deve ser avaliado da mesma maneira independentemente de sua posição**.

Esses pesos estão implementados diretamente na API.

---

## 🔎 Scouting e simulação de impacto

Uma das principais funcionalidades do DraftFut é a simulação de contratação.

O sistema utiliza o **ICE atual da equipe** como referência e calcula como cada jogador poderia alterar esse indicador.

O processo funciona da seguinte maneira:

```text
Dados da equipe
       ↓
Cálculo do ICE Base
       ↓
Análise dos jogadores
       ↓
Cálculo dos pilares O / P / D
       ↓
Cálculo do IIP
       ↓
Simulação do impacto
       ↓
ICE Ajustado
       ↓
Ranking de jogadores
```

O sistema classifica os jogadores em três categorias:

🟢 **Melhora o time**

🟡 **Impacto Neutro**

🔴 **Piora o time**

Os resultados são ordenados de acordo com a diferença entre o ICE ajustado e o ICE base da equipe.

---

## 🏗️ Arquitetura do projeto

O projeto está dividido em duas partes principais:

```text
Draft-Fut
│
├── backend
│   ├── app
│   │   ├── main.py
│   │   └── dados.py
│   │
│   └── requirements.txt
│
└── frontend
    ├── assets
    ├── index.html
    ├── modelo.html
    └── scouting.html
```

A estrutura atual do repositório segue essa separação entre frontend e backend.

---

## 🛠️ Tecnologias utilizadas

### Backend

* 🐍 Python
* ⚡ FastAPI
* 📦 Pydantic
* 🔄 Uvicorn
* 🌐 CORS

As dependências do backend estão definidas no arquivo `requirements.txt`.

### Frontend

* HTML5
* CSS3
* JavaScript
* Font Awesome
* Google Fonts

O frontend atualmente possui páginas destinadas ao dashboard, explicação do modelo e scouting.

---

## 🔌 API

O backend disponibiliza endpoints para realizar as análises.

### Verificar API

```http
GET /
```

Retorna uma mensagem indicando que a API está funcionando.

### Analisar Joinville EC

```http
GET /joinville
```

Retorna:

* Dados dos jogos analisados
* ICE da equipe
* Pontuação dos quatro pilares
* Informações utilizadas no cálculo

### Simular impacto

```http
GET /simular-impacto
```

Retorna o ranking de jogadores de acordo com o impacto estimado na equipe.

A API utiliza atualmente os dados do **Joinville EC** como equipe-base para as simulações.

---

## 💻 Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Deneeerr/Draft-Fut.git
```

Entre na pasta:

```bash
cd Draft-Fut
```

---

### 2. Configurando o Backend

Entre na pasta:

```bash
cd backend
```

Crie um ambiente virtual:

```bash
python -m venv venv
```

Ative o ambiente virtual.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Execute a API:

```bash
uvicorn app.main:app --reload
```

A API estará disponível em:

```text
http://127.0.0.1:8000
```

A documentação automática do FastAPI pode ser acessada em:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Executando o Frontend

Entre na pasta:

```bash
cd frontend
```

Como o frontend é baseado em HTML, CSS e JavaScript, pode ser executado utilizando um servidor local.

Por exemplo, com o **Live Server** do VS Code.

Depois, abra:

```text
index.html
```

---

## 📐 Metodologia

O DraftFut utiliza **normalização Min-Max** para transformar diferentes estatísticas em uma escala comum de 0 a 100.

A fórmula utilizada é:

```text
Normalizado =
((valor - mínimo) / (máximo - mínimo)) × 100
```

Para indicadores em que valores menores representam um desempenho melhor, como **gols sofridos**, é utilizada uma normalização invertida:

```text
Normalizado Invertido =
100 - Normalizado
```

Isso permite combinar estatísticas de diferentes naturezas dentro dos mesmos indicadores.

---

## 🎯 Objetivos do projeto

O DraftFut busca desenvolver uma abordagem mais orientada a dados para o futebol, permitindo:

* Analisar o desempenho de equipes;
* Avaliar jogadores individualmente;
* Identificar possíveis reforços;
* Comparar jogadores de diferentes posições;
* Estimar o impacto de uma contratação;
* Apoiar processos de scouting;
* Transformar estatísticas em indicadores mais fáceis de interpretar.

---

## 🔮 Próximos passos

O projeto ainda está em desenvolvimento e pode evoluir para uma plataforma mais completa de análise e recrutamento.

Algumas possibilidades futuras:

* [ ] Integração com bancos de dados de jogadores;
* [ ] Busca automática de atletas;
* [ ] Filtros por posição e características;
* [ ] Comparação direta entre jogadores;
* [ ] Histórico de desempenho;
* [ ] Análise de compatibilidade entre jogador e equipe;
* [ ] Sistema de recomendações de contratação;
* [ ] Integração com APIs externas de futebol;
* [ ] Dashboard mais avançado;
* [ ] Sistema de login e gerenciamento de clubes;
* [ ] Expansão do modelo para diferentes equipes e ligas.

---

## 📚 Conceito

O DraftFut foi desenvolvido com a ideia de aproximar **tecnologia, análise de dados e futebol**, utilizando estatísticas para auxiliar processos que tradicionalmente dependem principalmente da observação subjetiva.

A proposta não é substituir o trabalho de scouts e analistas, mas fornecer **informações adicionais para apoiar a tomada de decisão**.

---

## 👨‍💻 Autor

**Bernardo Correa**

Projeto desenvolvido como estudo e experimentação nas áreas de:

* Desenvolvimento Web
* Python
* APIs REST
* Análise de Dados
* Estatística aplicada ao futebol
* Scouting e recrutamento

---

## 📄 Licença

Este projeto está em desenvolvimento para fins educacionais e de experimentação.

---

⭐ Se você gostou do projeto, considere deixar uma estrela no repositório!

**DraftFut — Dados que ajudam a encontrar o próximo reforço.** ⚽📊
