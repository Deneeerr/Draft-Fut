// ==========================================
// CONFIGURAÇÕES E LIMITES
// ==========================================
const API_URL = "https://draftfut-api.onrender.com/joinville";

const LIMITES = {
    finalizacoes: [5, 20],
    finalizacoes_no_alvo: [1, 10],
    xg: [0.2, 2.5],
    gols_marcados: [0, 5],
    desarmes: [5, 25],
    interceptacoes: [5, 20],
    gols_sofridos: [0, 4],
    chances_criadas: [0, 6],
    assistencias: [0, 3]
};

let jogosData = [];
let icePorJogo = [];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
function clamp(v) { return Math.max(0, Math.min(100, v)); }
function normalizar(v, min, max) { return max === min ? 0 : clamp(((v - min) / (max - min)) * 100); }
function normalizarInv(v, min, max) { return clamp(100 - normalizar(v, min, max)); }
function media(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function passesPct(certos, total) { return total ? clamp((certos / total) * 100) : 0; }

function calcularICEUnico(j) {
    const pct = passesPct(j.passes_certos, j.total_passes);

    const eficiencia = media([
        normalizar(j.finalizacoes, ...LIMITES.finalizacoes),
        normalizar(j.finalizacoes_no_alvo, ...LIMITES.finalizacoes_no_alvo),
        normalizar(j.xg, ...LIMITES.xg),
        normalizar(j.gols_marcados, ...LIMITES.gols_marcados)
    ]);

    const defesa = media([
        normalizar(j.desarmes, ...LIMITES.desarmes),
        normalizar(j.interceptacoes, ...LIMITES.interceptacoes),
        normalizarInv(j.gols_sofridos, ...LIMITES.gols_sofridos)
    ]);

    const controle = media([clamp(j.posse_bola), pct]);

    const conexao = media([
        normalizar(j.chances_criadas, ...LIMITES.chances_criadas),
        normalizar(j.assistencias, ...LIMITES.assistencias),
        pct
    ]);

    const ice = clamp(
        (0.35 * conexao) +
        (0.25 * eficiencia) +
        (0.20 * defesa) +
        (0.20 * controle)
    );

    return { ice, conexao, eficiencia, defesa, controle };
}

// ==========================================
// CONSUMO DA API
// ==========================================
async function carregarDadosDaAPI() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        jogosData = data.jogos || [];

        document.getElementById('ice-medio').innerHTML =
            data.resultado?.ICE || 0;

        renderizarDashboard();

    } catch (error) {
        console.error("Erro ao buscar dados da API:", error);

        const container = document.getElementById('games-container');
        if (container) {
            container.innerHTML =
                `<div class="error">Erro ao conectar com a API.</div>`;
        }
    }
}

// ==========================================
// RENDERIZAÇÃO
// ==========================================
function renderizarDashboard() {
    const container = document.getElementById('games-container');
    if (!container) return;

    if (jogosData.length === 0) {
        container.innerHTML = "<p>Nenhum dado disponível</p>";
        return;
    }

    const totalGols = jogosData.reduce((sum, j) => sum + j.gols_marcados, 0);
    const mediaGols = (totalGols / jogosData.length).toFixed(1);
    const mediaPosse = (jogosData.reduce((sum, j) => sum + j.posse_bola, 0) / jogosData.length).toFixed(1);

    const vitorias = jogosData.filter(j => j.resultado === 'V').length;
    const empates = jogosData.filter(j => j.resultado === 'E').length;
    const derrotas = jogosData.filter(j => j.resultado === 'D').length;

    document.getElementById('jogos-count').innerHTML = jogosData.length;
    document.getElementById('record-stats').innerHTML = `${vitorias}V ${empates}E ${derrotas}D`;
    document.getElementById('media-gols').innerHTML = mediaGols;
    document.getElementById('media-posse').innerHTML = mediaPosse;

    container.innerHTML = jogosData.map((jogo, index) => {
        let classeResultado =
            jogo.resultado === 'V' ? 'vitoria' :
            jogo.resultado === 'E' ? 'empate' : 'derrota';

        let textoResultado =
            jogo.resultado === 'V' ? 'Vitória' :
            jogo.resultado === 'E' ? 'Empate' : 'Derrota';

        const iceCalc = Math.round(calcularICEUnico(jogo).ice);

        return `
            <div class="game-card ${classeResultado}" onclick="abrirModal(${index})">
                <div class="game-header">
                    <span class="adversario">vs ${jogo.adversario}</span>
                    <span class="resultado-badge ${jogo.resultado}">${textoResultado}</span>
                </div>

                <div class="game-stats-preview">
                    <div class="preview-stat">
                        <div class="label">Gols</div>
                        <div class="value">${jogo.gols_marcados}</div>
                    </div>
                    <div class="preview-stat">
                        <div class="label">Finalizações</div>
                        <div class="value">${jogo.finalizacoes}</div>
                    </div>
                    <div class="preview-stat">
                        <div class="label">Posse</div>
                        <div class="value">${jogo.posse_bola}%</div>
                    </div>
                </div>

                <div class="ice-preview">
                    <span class="ice-label">ICE</span>
                    <span class="ice-value">${iceCalc}%</span>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// INTERAÇÕES
// ==========================================
function calcularTodosICE() {
    icePorJogo = jogosData.map(j => calcularICEUnico(j));

    const container = document.getElementById('ice-list-container');
    if (!container) return;

    container.innerHTML = `
        <div class="ice-list">
            ${icePorJogo.map((item, idx) => {
                const iceFinal = Math.round(item.ice);
                return `
                <div class="ice-item" onclick="abrirModal(${idx})" style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px; cursor: pointer;">
                    <span style="min-width: 30px;">#${idx + 1}</span>
                    
                    <div class="ice-bar-track" style="flex-grow: 1; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                        <div class="ice-bar-fill" style="width: ${iceFinal}%; height: 100%; background: #f5a623; border-radius: 4px; transition: width 0.5s ease;"></div>
                    </div>

                    <span style="min-width: 45px; text-align: right; font-weight: bold;">${iceFinal}%</span>
                </div>
            `}).join('')}
        </div>
    `;
}

function abrirModal(index) {
    const jogo = jogosData[index];
    const ice = calcularICEUnico(jogo);

    document.getElementById('modal-title').innerHTML = `vs ${jogo.adversario}`;
    document.getElementById('modal-body').innerHTML = `${Math.round(ice.ice)}%`;
    document.getElementById('modal').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

// ==========================================
// INICIALIZAÇÃO SEGURA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById('calc-ice-btn');

    if (btn) {
        btn.addEventListener('click', calcularTodosICE);
    }

    carregarDadosDaAPI();

    window.onclick = (event) => {
        const modal = document.getElementById('modal');
        if (event.target === modal) fecharModal();
    };
});