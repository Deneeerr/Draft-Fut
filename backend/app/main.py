# ================================
# IMPORTAÇÕES
# ================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
# Certifique-se que seu arquivo app/dados.py tenha 'jogos_joinville' e 'jogadores'
from app.dados import jogos_joinville, jogadores

# ================================
# CRIAÇÃO DA API E CONFIGURAÇÃO CORS
# ================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# LIMITES (TIME VS JOGADOR)
# ================================

# Limites para o cálculo coletivo (Time)
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

# Limites para o cálculo individual (Média por jogo do Jogador)
LIMITES_PLAYER = {
    "O": {"fin": (1, 6), "alvo": (0.5, 3), "xg": (0.1, 1.2), "gols": (0, 2)},
    "D": {"des": (1, 6), "int": (0.5, 4), "sofridos": (0, 2.5)},
    "P": {"chances": (0, 3), "ast": (0, 1), "passes": (60, 90), "xa": (0, 0.5)}
}

# Pesos táticos por posição para o IIP
PESOS_IIP = {
    "Atacante": {"O": 0.60, "P": 0.25, "D": 0.15},
    "Meia avançado": {"O": 0.35, "P": 0.45, "D": 0.20},
    "Meio-campista": {"O": 0.35, "P": 0.45, "D": 0.20},
    "Volante": {"O": 0.20, "P": 0.40, "D": 0.40},
    "Zagueiro": {"O": 0.10, "P": 0.30, "D": 0.60},
    "Defensor": {"O": 0.10, "P": 0.30, "D": 0.60},
    "Lateral": {"O": 0.30, "P": 0.35, "D": 0.35}
}

# ================================
# 🧠 FUNÇÕES DE CÁLCULO
# ================================

def clamp(valor):
    return max(0, min(100, valor))

def normalizar(valor, minimo, maximo):
    if maximo == minimo: return 0
    return clamp((valor - minimo) / (maximo - minimo) * 100)

def normalizar_invertido(valor, minimo, maximo):
    return clamp(100 - normalizar(valor, minimo, maximo))

def media(lista):
    return sum(lista) / len(lista) if lista else 0

def percentual_passes(certos, total):
    if total == 0: return 0
    return clamp((certos / total) * 100)

def calcular_ice(jogos):
    eficiencia, defesa, controle, conexao = [], [], [], []

    for j in jogos:
        passes_pct = percentual_passes(j.passes_certos, j.total_passes)
        
        # EFICIÊNCIA
        eficiencia.append(media([
            normalizar(j.finalizacoes, *LIMITES["finalizacoes"]),
            normalizar(j.finalizacoes_no_alvo, *LIMITES["finalizacoes_no_alvo"]),
            normalizar(j.xg, *LIMITES["xg"]),
            normalizar(j.gols_marcados, *LIMITES["gols_marcados"])
        ]))

        # DEFESA
        defesa.append(media([
            normalizar(j.desarmes, *LIMITES["desarmes"]),
            normalizar(j.interceptacoes, *LIMITES["interceptacoes"]),
            normalizar_invertido(j.gols_sofridos, *LIMITES["gols_sofridos"])
        ]))

        # CONTROLE
        controle.append(media([clamp(j.posse_bola), passes_pct]))

        # CONEXÃO
        conexao.append(media([
            normalizar(j.chances_criadas, *LIMITES["chances_criadas"]),
            normalizar(j.assistencias, *LIMITES["assistencias"]),
            passes_pct
        ]))

    C, E, D, T = media(conexao), media(eficiencia), media(defesa), media(controle)
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
# MODELOS PYDANTIC
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
# ROTAS DA API
# ================================

@app.get("/")
def home():
    return {"mensagem": "API DraftFut ativa e pronta para simulações!"}

@app.get("/joinville")
def analisar_joinville():
    jogos = [Jogo(**j) for j in jogos_joinville]
    resultado = calcular_ice(jogos)
    return {
        "time": "Joinville EC",
        "jogos": jogos_joinville,
        "resultado": resultado
    }

@app.get("/simular-impacto")
def simular_impacto():
    # 1. Calcula o ICE Base usando os dados reais do Joinville
    jogos_obj = [Jogo(**j) for j in jogos_joinville]
    ice_base_info = calcular_ice(jogos_obj)
    ice_base = ice_base_info["ICE"]
    
    # 2. Média de gols sofridos do time (contexto para defesa do jogador)
    media_sofridos_time = sum(j["gols_sofridos"] for j in jogos_joinville) / 10

    scouting_results = []

    for jog in jogadores:
        # Médias por jogo (Recorte de 10 jogos)
        m_fin = jog.get("finalizacoes", 0) / 10
        m_alvo = jog.get("finalizacoes_no_alvo", 0) / 10
        m_xg = jog.get("xg", 0) / 10
        m_gols = jog.get("gols", 0) / 10
        m_chances = jog.get("chances_criadas", 0) / 10
        m_ast = jog.get("assistencias", 0) / 10
        m_des = jog.get("desarmes", 0) / 10
        m_int = jog.get("interceptações", 0) / 10 # Chave com acento do seu JSON
        m_xa = jog.get("xa", 0) / 10
        pct_passes = jog.get("passes_certos", 0)

        # Cálculo dos Pilares Individuais
        O = media([
            normalizar(m_fin, *LIMITES_PLAYER["O"]["fin"]),
            normalizar(m_alvo, *LIMITES_PLAYER["O"]["alvo"]),
            normalizar(m_xg, *LIMITES_PLAYER["O"]["xg"]),
            normalizar(m_gols, *LIMITES_PLAYER["O"]["gols"])
        ])
        D = media([
            normalizar(m_des, *LIMITES_PLAYER["D"]["des"]),
            normalizar(m_int, *LIMITES_PLAYER["D"]["int"]),
            normalizar_invertido(media_sofridos_time, *LIMITES_PLAYER["D"]["sofridos"])
        ])
        
        n_passes = normalizar(pct_passes, *LIMITES_PLAYER["P"]["passes"])
        n_chances = normalizar(m_chances, *LIMITES_PLAYER["P"]["chances"])
        pos_det = jog["posicao_detalhada"]
        
        if pos_det in ["Meia Central", "Volante", "Meia Ofensivo"]:
            n_xa = normalizar(m_xa, *LIMITES_PLAYER["P"]["xa"])
            P = (n_passes + n_chances + n_xa) / 3
        else:
            P = (n_passes + n_chances) / 2

        # Cálculo do IIP com Pesos por Posição
        pesos = PESOS_IIP.get(pos_det) or PESOS_IIP.get(jog["posicao"]) or PESOS_IIP["Atacante"]
        iip = (O * pesos["O"]) + (P * pesos["P"]) + (D * pesos["D"])

        # Impacto e ICE Ajustado
        impacto_valor = iip - 50
        ice_ajustado = ice_base + (impacto_valor * 0.2)
        diff = ice_ajustado - ice_base

        scouting_results.append({
            "nome": jog["nome"],
            "posicao": pos_det,
            "time": jog["time_atual"],
            "iip": round(iip, 2),
            "ice_base": round(ice_base, 2),
            "ice_ajustado": round(ice_ajustado, 2),
            "diferenca": round(diff, 2),
            "status": "positivo" if diff > 0.5 else "negativo" if diff < -0.5 else "neutro",
            "classificacao": "Melhora o time" if diff > 0.5 else "Piora o time" if diff < -0.5 else "Impacto Neutro"
        })

    # Ranking por impacto
    scouting_results.sort(key=lambda x: x["diferenca"], reverse=True)

    return {
        "equipe": "Joinville EC",
        "ice_atual": round(ice_base, 2),
        "recomendacoes": scouting_results
    }