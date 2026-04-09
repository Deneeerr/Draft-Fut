// ==========================================
// CONFIGURAÇÕES E LIMITES
// ==========================================
const API_URL = "http://127.0.0.1:8000/joinville";

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
// FUNÇÕES AUXILIARES DE CÁLCULO (FRONT-END)
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
    const ice = clamp((0.35 * conexao) + (0.25 * eficiencia) + (0.20 * defesa) + (0.20 * controle));
    return { ice, conexao, eficiencia, defesa, controle };
}

// ==========================================
// CONSUMO DA API
// ==========================================
async function carregarDadosDaAPI() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // Mapeia os dados recebidos da API
        jogosData = data.jogos;
        
        // O ICE médio vem direto do cálculo do Python
        document.getElementById('ice-medio').innerHTML = data.resultado.ICE;
        
        renderizarDashboard();
    } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
        document.getElementById('games-container').innerHTML = `<div class="error">Erro ao conectar com a API. Verifique se o servidor Python está rodando.</div>`;
    }
}

// ==========================================
// RENDERIZAÇÃO E UI
// ==========================================
function renderizarDashboard() {
    const container = document.getElementById('games-container');
    
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
        let classeResultado = jogo.resultado === 'V' ? 'vitoria' : jogo.resultado === 'E' ? 'empate' : 'derrota';
        let textoResultado = jogo.resultado === 'V' ? 'Vitória' : jogo.resultado === 'E' ? 'Empate' : 'Derrota';
        
        // Calcula o ICE individual para o card (Lógica JS)
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
                    <span class="ice-label"><i class="fas fa-chart-line"></i> ICE</span>
                    <span class="ice-value">${iceCalc}%</span>
                </div>
            </div>
        `;
    }).join('');
}

function calcularTodosICE() {
    icePorJogo = jogosData.map(j => calcularICEUnico(j));
    
    const container = document.getElementById('ice-list-container');
    container.innerHTML = `
        <div class="ice-list">
            ${icePorJogo.map((item, idx) => `
                <div class="ice-item" onclick="abrirModal(${idx})">
                    <div class="ice-game-info">
                        <span class="ice-index">#${idx + 1}</span>
                        <span class="ice-adversario">vs ${jogosData[idx].adversario}</span>
                    </div>
                    <div class="ice-bar-container">
                        <div class="ice-bar">
                            <div class="ice-bar-fill" style="width: ${item.ice}%"></div>
                        </div>
                    </div>
                    <span class="ice-percent">${Math.round(item.ice)}%</span>
                </div>
            `).join('')}
        </div>
    `;
}

function abrirModal(index) {
    const jogo = jogosData[index];
    const ice = calcularICEUnico(jogo);
    
    document.getElementById('modal-title').innerHTML = `vs ${jogo.adversario} • ${jogo.resultado === 'V' ? 'Vitória' : 'Derrota'}`;
    document.getElementById('modal-body').innerHTML = `
        <div class="stats-categories">
            <div class="category-card"><h4>🔗 Conexão</h4><div class="category-value">${Math.round(ice.conexao)}%</div></div>
            <div class="category-card"><h4>⚡ Eficiência</h4><div class="category-value">${Math.round(ice.eficiencia)}%</div></div>
            <div class="category-card"><h4>🛡️ Defesa</h4><div class="category-value">${Math.round(ice.defesa)}%</div></div>
            <div class="category-card"><h4>🎮 Controle</h4><div class="category-value">${Math.round(ice.controle)}%</div></div>
        </div>
        <div class="stats-detail-grid">
            <div class="detail-stat"><div class="label">⚽ Gols Marcados</div><div class="value">${jogo.gols_marcados}</div></div>
            <div class="detail-stat"><div class="label">🎯 Gols Sofridos</div><div class="value">${jogo.gols_sofridos}</div></div>
            <div class="detail-stat"><div class="label">📊 Finalizações</div><div class="value">${jogo.finalizacoes}</div></div>
            <div class="detail-stat"><div class="label">🛡️ Desarmes</div><div class="value">${jogo.desarmes}</div></div>
            <div class="detail-stat"><div class="label">💪 Posse de Bola</div><div class="value">${jogo.posse_bola}%</div></div>
            <div class="detail-stat"><div class="label">📋 ICE Total</div><div class="value" style="color:#f5a623">${Math.round(ice.ice)}%</div></div>
        </div>
    `;
    document.getElementById('modal').style.display = 'block';
}

function fecharModal() { document.getElementById('modal').style.display = 'none'; }

// Listeners
document.getElementById('calc-ice-btn').addEventListener('click', calcularTodosICE);
window.onclick = (event) => { if (event.target === document.getElementById('modal')) fecharModal(); };

// Inicialização: Chama a API ao carregar a página
carregarDadosDaAPI();