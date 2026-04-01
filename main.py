# ================================
# IMPORTAÇÕES
# ================================

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from dados import jogos_joinville

# ================================
# CRIAÇÃO DA API
# ================================

app = FastAPI()

# ================================
# LIMITES (MIN/MAX)
# ================================

LIMITES = {
    "finalizacoes": (5, 20),
    "finalizacoes_no_alvo": (1, 10),
    "xg": (0.2, 2.5),
    "gols_marcados": (0, 5),
    "desarmes": (5, 25),
    "interceptacoes": (5, 20),
    "gols_sofridos": (0, 4),
    "chances_criadas": (0, 6),
    "assistencias": (0, 3)
}

# ================================
# 🧠 FUNÇÕES DO MODELO
# ================================

def clamp(valor):
    return max(0, min(100, valor))


def normalizar(valor, minimo, maximo):
    return clamp((valor - minimo) / (maximo - minimo) * 100)


def normalizar_invertido(valor, minimo, maximo):
    return clamp(100 - normalizar(valor, minimo, maximo))


def media(lista):
    return sum(lista) / len(lista) if lista else 0


def percentual_passes(certos, total):
    if total == 0:
        return 0
    return clamp((certos / total) * 100)

# ================================
# FUNÇÃO ICE
# ================================

def calcular_ice(jogos):

    eficiencia = []
    defesa = []
    controle = []
    conexao = []

    for j in jogos:

        passes_pct = percentual_passes(j.passes_certos, j.total_passes)

        # EFICIÊNCIA
        e = media([
            normalizar(j.finalizacoes, *LIMITES["finalizacoes"]),
            normalizar(j.finalizacoes_no_alvo, *LIMITES["finalizacoes_no_alvo"]),
            normalizar(j.xg, *LIMITES["xg"]),
            normalizar(j.gols_marcados, *LIMITES["gols_marcados"])
        ])

        # DEFESA
        d = media([
            normalizar(j.desarmes, *LIMITES["desarmes"]),
            normalizar(j.interceptacoes, *LIMITES["interceptacoes"]),
            normalizar_invertido(j.gols_sofridos, *LIMITES["gols_sofridos"])
        ])

        # CONTROLE
        t = media([
            clamp(j.posse_bola),
            passes_pct
        ])

        # CONEXÃO
        c = media([
            normalizar(j.chances_criadas, *LIMITES["chances_criadas"]),
            normalizar(j.assistencias, *LIMITES["assistencias"]),
            passes_pct
        ])

        eficiencia.append(e)
        defesa.append(d)
        controle.append(t)
        conexao.append(c)

    C = media(conexao)
    E = media(eficiencia)
    D = media(defesa)
    T = media(controle)

    ICE = (0.35 * C) + (0.25 * E) + (0.20 * D) + (0.20 * T)

    return {
        "ICE": round(ICE, 2),
        "pilares": {
            "conexao": round(C, 2),
            "eficiencia": round(E, 2),
            "defesa": round(D, 2),
            "controle": round(T, 2)
        }
    }

# ================================
# MODELOS
# ================================

class Jogo(BaseModel):
    finalizacoes: int
    finalizacoes_no_alvo: int
    xg: float
    gols_marcados: int

    desarmes: int
    interceptacoes: int
    gols_sofridos: int

    passes_certos: int
    posse_bola: float
    total_passes: int

    chances_criadas: int
    assistencias: int

    adversario: str
    casa: bool
    resultado: str


class Time(BaseModel):
    time: str
    ultimos_jogos: List[Jogo]

# ================================
# ROTAS
# ================================
@app.get("/")
def home():
    return {"mensagem": "API DraftFut com ICE funcionando!"}


@app.get("/joinville")
def analisar_joinville():

    jogos = [Jogo(**j) for j in jogos_joinville]

    resultado = calcular_ice(jogos)

    return {
        "time": "Joinville EC",
        "resultado": resultado
    }


@app.post("/analisar")
def analisar_time(dados: Time):

    resultado = calcular_ice(dados.ultimos_jogos)

    return {
        "time": dados.time,
        "resultado": resultado
    }