# ================================
# IMPORTAÇÕES
# ================================

from fastapi import FastAPI           # Framework da API
from pydantic import BaseModel        # Validação dos dados (estrutura)
from typing import List               # Permite usar listas tipadas

# ================================
# CRIAÇÃO DA API
# ================================

app = FastAPI()

# ================================
# DADOS FIXOS DO JOINVILLE
# COLOQUE OS 10 JOGOS AQUI
# ================================

jogos_joinville = [
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 16,
        "finalizacoes_no_alvo": 8,
        "xg": 0.64,
        "gols_marcados": 0,

        # ===== DEFESA =====
        "desarmes": 4,
        "interceptacoes": 13,
        "gols_sofridos": 1,

        # ===== CONTROLE =====
        "passes_certos": 341,
        "posse_bola": 66.0,
        "total_passes": 417,

        # ===== CONEXÃO =====
        "chances_criadas": 15,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "Carlos Renaux",
        "casa": True,
        "resultado": "D"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 6,
        "finalizacoes_no_alvo": 3,
        "xg": 0.19,
        "gols_marcados": 0,

        # ===== DEFESA =====
        "desarmes": 5,
        "interceptacoes": 12,
        "gols_sofridos": 6,

        # ===== CONTROLE =====
        "passes_certos": 306,
        "posse_bola": 44.0,
        "total_passes": 352,

        # ===== CONEXÃO =====
        "chances_criadas": 4,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "Chapecoense",
        "casa": False,
        "resultado": "D"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 7,
        "finalizacoes_no_alvo": 3,
        "xg": 0.48,
        "gols_marcados": 2,

        # ===== DEFESA =====
        "desarmes": 4,
        "interceptacoes": 5,
        "gols_sofridos": 4,

        # ===== CONTROLE =====
        "passes_certos": 132,
        "posse_bola": 42.0,
        "total_passes": 180,

        # ===== CONEXÃO =====
        "chances_criadas": 5,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "Marcílio Dias",
        "casa": True,
        "resultado": "D"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 7,
        "finalizacoes_no_alvo": 2,
        "xg": 0.40,
        "gols_marcados": 0,

        # ===== DEFESA =====
        "desarmes": 1,
        "interceptacoes": 11,
        "gols_sofridos": 1,

        # ===== CONTROLE =====
        "passes_certos": 302,
        "posse_bola": 42.0,
        "total_passes": 347,

        # ===== CONEXÃO =====
        "chances_criadas": 6,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "Figueirense",
        "casa": False,
        "resultado": "D"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 13,
        "finalizacoes_no_alvo": 5,
        "xg": 1.19,
        "gols_marcados": 3,

        # ===== DEFESA =====
        "desarmes": 3,
        "interceptacoes": 14,
        "gols_sofridos": 0,

        # ===== CONTROLE =====
        "passes_certos": 344,
        "posse_bola": 60.0,
        "total_passes": 406,

        # ===== CONEXÃO =====
        "chances_criadas": 5,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "Carlos Renaux",
        "casa": True,
        "resultado": "V"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 18,
        "finalizacoes_no_alvo": 4,
        "xg": 1.53,
        "gols_marcados": 1,

        # ===== DEFESA =====
        "desarmes": 2,
        "interceptacoes": 23,
        "gols_sofridos": 2,

        # ===== CONTROLE =====
        "passes_certos": 246,
        "posse_bola": 60.0,
        "total_passes": 314,

        # ===== CONEXÃO =====
        "chances_criadas": 8,
        "assistencias": 1,

        # ===== CONTEXTO =====
        "adversario": "Carlos Renaux",
        "casa": False,
        "resultado": "D"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 10,
        "finalizacoes_no_alvo": 3,
        "xg": 0.99,
        "gols_marcados": 1,

        # ===== DEFESA =====
        "desarmes": 10,
        "interceptacoes": 8,
        "gols_sofridos": 0,

        # ===== CONTROLE =====
        "passes_certos": 321,
        "posse_bola": 50.0,
        "total_passes": 395,

        # ===== CONEXÃO =====
        "chances_criadas": 3,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "CSA",
        "casa": True,
        "resultado": "V"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 9,
        "finalizacoes_no_alvo": 3,
        "xg": 0.43,
        "gols_marcados": 0,

        # ===== DEFESA =====
        "desarmes": 3,
        "interceptacoes": 13,
        "gols_sofridos": 3,

        # ===== CONTROLE =====
        "passes_certos": 384,
        "posse_bola": 52.0,
        "total_passes": 446,

        # ===== CONEXÃO =====
        "chances_criadas": 6,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "Figueirense",
        "casa": True,
        "resultado": "D"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 3,
        "finalizacoes_no_alvo": 1,
        "xg": 0.03,
        "gols_marcados": 0,

        # ===== DEFESA =====
        "desarmes": 2,
        "interceptacoes": 6,
        "gols_sofridos": 2,

        # ===== CONTROLE =====
        "passes_certos": 376,
        "posse_bola": 64.0,
        "total_passes": 442,

        # ===== CONEXÃO =====
        "chances_criadas": 1,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "Marcílio Dias",
        "casa": False,
        "resultado": "D"
    },
    #===============================
    {
        # ===== EFICIÊNCIA =====
        "finalizacoes": 11,
        "finalizacoes_no_alvo": 5,
        "xg": 0.89,
        "gols_marcados": 0,

        # ===== DEFESA =====
        "desarmes": 8,
        "interceptacoes": 6,
        "gols_sofridos": 1,

        # ===== CONTROLE =====
        "passes_certos": 302,
        "posse_bola": 47.0,
        "total_passes": 386,

        # ===== CONEXÃO =====
        "chances_criadas": 5,
        "assistencias": 0,

        # ===== CONTEXTO =====
        "adversario": "São Bernardo",
        "casa": True,
        "resultado": "D"
    },

]

# ================================
# MODELOS (ESTRUTURA DOS DADOS)
# ================================

class Jogo(BaseModel):
    # Eficiência
    finalizacoes: int
    finalizacoes_no_alvo: int
    xg: float
    gols_marcados: int

    # Defesa
    desarmes: int
    interceptacoes: int
    gols_sofridos: int

    # Controle
    passes_certos: int
    posse_bola: float
    total_passes: int

    # Conexão
    chances_criadas: int
    assistencias: int

    # Contexto
    adversario: str
    casa: bool
    resultado: str


class Time(BaseModel):
    time: str
    ultimos_jogos: List[Jogo]

# ================================
# FUNÇÃO AUXILIAR (MÉDIA)
# ================================

def media(lista):
    return sum(lista) / len(lista) if lista else 0

# ================================
#ROTAS DA API
# ================================

#Rota inicial (teste simples)
@app.get("/")
def home():
    return {"mensagem": "API DraftFut funcionando!"}


#Rota com dados FIXOS do Joinville
@app.get("/joinville")
def analisar_joinville():

    # Converte os dicionários em objetos do tipo Jogo
    jogos = [Jogo(**j) for j in jogos_joinville]

    return {
        "time": "Joinville EC",

        # ===== EFICIÊNCIA =====
        "eficiencia": {
            "finalizacoes": media([j.finalizacoes for j in jogos]),
            "no_alvo": media([j.finalizacoes_no_alvo for j in jogos]),
            "xg": media([j.xg for j in jogos]),
            "gols": media([j.gols_marcados for j in jogos])
        },

        # ===== DEFESA =====
        "defesa": {
            "desarmes": media([j.desarmes for j in jogos]),
            "interceptacoes": media([j.interceptacoes for j in jogos]),
            "gols_sofridos": media([j.gols_sofridos for j in jogos])
        },

        # ===== CONTROLE =====
        "controle": {
            "passes_certos": media([j.passes_certos for j in jogos]),
            "posse_bola": media([j.posse_bola for j in jogos])
        },

        # ===== CONEXÃO =====
        "conexao": {
            "chances_criadas": media([j.chances_criadas for j in jogos]),
            "assistencias": media([j.assistencias for j in jogos]),
            "passes_certos": media([j.passes_certos for j in jogos])
        }
    }


#Rota dinâmica (envio manual via JSON)
@app.post("/analisar")
def analisar_time(dados: Time):

    jogos = dados.ultimos_jogos

    return {
        "time": dados.time,

        "eficiencia": {
            "finalizacoes": media([j.finalizacoes for j in jogos]),
            "no_alvo": media([j.finalizacoes_no_alvo for j in jogos]),
            "xg": media([j.xg for j in jogos]),
            "gols": media([j.gols_marcados for j in jogos])
        },

        "defesa": {
            "desarmes": media([j.desarmes for j in jogos]),
            "interceptacoes": media([j.interceptacoes for j in jogos]),
            "gols_sofridos": media([j.gols_sofridos for j in jogos])
        },

        "controle": {
            "passes_certos": media([j.passes_certos for j in jogos]),
            "posse_bola": media([j.posse_bola for j in jogos])
        },

        "conexao": {
            "chances_criadas": media([j.chances_criadas for j in jogos]),
            "assistencias": media([j.assistencias for j in jogos]),
            "passes_certos": media([j.passes_certos for j in jogos])
        }
    }