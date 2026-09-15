// =====================================================
// DRAFTFUT - DASHBOARD
// Consome a mesma API utilizada pelo projeto atual.
// =====================================================

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
let iceChart = null;

function numero(valor, fallback = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : fallback;
}

function clamp(v) {
    return Math.max(0, Math.min(100, v));
}

function normalizar(v, min, max) {
    return max === min ? 0 : clamp(((numero(v) - min) / (max - min)) * 100);
}

function normalizarInv(v, min, max) {
    return clamp(100 - normalizar(v, min, max));
}

function media(arr) {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function passesPct(certos, total) {
    total = numero(total);
    return total ? clamp((numero(certos) / total) * 100) : 0;
}

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

    const controle = media([
        clamp(numero(j.posse_bola)),
        pct
    ]);

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

function formatarMedia(arr, casas = 1) {
    return media(arr).toFixed(casas);
}

function calcularMedias() {
    return {
        gols: media(jogosData.map(j => numero(j.gols_marcados))),
        sofridos: media(jogosData.map(j => numero(j.gols_sofridos))),
        posse: media(jogosData.map(j => numero(j.posse_bola))),
        finalizacoes: media(jogosData.map(j => numero(j.finalizacoes))),
        noAlvo: media(jogosData.map(j => numero(j.finalizacoes_no_alvo))),
        xg: media(jogosData.map(j => numero(j.xg))),
        chances: media(jogosData.map(j => numero(j.chances_criadas))),
        desarmes: media(jogosData.map(j => numero(j.desarmes))),
        interceptacoes: media(jogosData.map(j => numero(j.interceptacoes))),
        assistencias: media(jogosData.map(j => numero(j.assistencias))),
        passes: media(jogosData.map(j => passesPct(j.passes_certos, j.total_passes)))
    };
}

function atualizarKPIs() {
    const m = calcularMedias();
    const vitorias = jogosData.filter(j => j.resultado === 'V').length;
    const empates = jogosData.filter(j => j.resultado === 'E').length;
    const derrotas = jogosData.filter(j => j.resultado === 'D').length;

    const iceMedio = media(icePorJogo.map(item => item.ice));

    document.getElementById('ice-medio').textContent = Math.round(iceMedio);
    document.getElementById('campanha').textContent = `${vitorias}V ${empates}E ${derrotas}D`;
    document.getElementById('record-stats').textContent = `${jogosData.length} jogos analisados`;
    document.getElementById('media-gols').textContent = formatarMedia(jogosData.map(j => numero(j.gols_marcados)));
    document.getElementById('media-sofridos').textContent = formatarMedia(jogosData.map(j => numero(j.gols_sofridos)));
    document.getElementById('media-posse').textContent = formatarMedia(jogosData.map(j => numero(j.posse_bola)));

    document.getElementById('media-finalizacoes').textContent = formatarMedia(jogosData.map(j => numero(j.finalizacoes)));
    document.getElementById('media-no-alvo').textContent = formatarMedia(jogosData.map(j => numero(j.finalizacoes_no_alvo)));
    document.getElementById('media-xg').textContent = formatarMedia(jogosData.map(j => numero(j.xg)), 2);
    document.getElementById('media-chances').textContent = formatarMedia(jogosData.map(j => numero(j.chances_criadas)));

    document.getElementById('defesa-sofridos').textContent = formatarMedia(jogosData.map(j => numero(j.gols_sofridos)));
    document.getElementById('media-desarmes').textContent = formatarMedia(jogosData.map(j => numero(j.desarmes)));
    document.getElementById('media-interceptacoes').textContent = formatarMedia(jogosData.map(j => numero(j.interceptacoes)));

    document.getElementById('controle-posse').textContent = `${m.posse.toFixed(1)}%`;
    document.getElementById('passes-certos').textContent = `${m.passes.toFixed(1)}%`;
    document.getElementById('media-assistencias').textContent = m.assistencias.toFixed(1);
}

function renderizarForma() {
    const container = document.getElementById('form-container');

    if (!jogosData.length) {
        container.innerHTML = '<div class="dashboard-loading">Nenhum jogo disponível.</div>';
        return;
    }

    container.innerHTML = jogosData.map(jogo => {
        const resultado = jogo.resultado || 'D';
        const gols = numero(jogo.gols_marcados);
        const adversario = jogo.adversario || 'Adversário';

        // A API atual trabalha com o resultado V/E/D e com os gols marcados.
        // Para exibição compacta, o placar do adversário é inferido por gols sofridos.
        const sofridos = numero(jogo.gols_sofridos);

        return `
            <div class="form-item" title="${adversario}">
                <span class="form-result ${resultado}">${resultado}</span>
                <span class="form-score">${gols}–${sofridos}</span>
                <span class="form-opponent">${adversario}</span>
            </div>
        `;
    }).join('');
}

function renderizarGrafico() {
    const canvas = document.getElementById('ice-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (iceChart) iceChart.destroy();

    const labels = jogosData.map((j, index) => `J${index + 1}`);
    const valores = icePorJogo.map(item => Math.round(item.ice));

    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue('--text-secondary').trim() || '#888';
    const borderColor = styles.getPropertyValue('--border-color').trim() || '#1f1f1f';

    iceChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'ICE',
                data: valores,
                borderColor: '#f5a623',
                backgroundColor: 'rgba(245,166,35,0.08)',
                pointBackgroundColor: '#f5a623',
                pointBorderColor: '#f5a623',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                tension: .35,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: items => {
                            const index = items[0]?.dataIndex ?? 0;
                            return jogosData[index]?.adversario || `Jogo ${index + 1}`;
                        },
                        label: item => ` ICE: ${item.raw}/100`
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: { color: textColor, stepSize: 20 },
                    grid: { color: borderColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { display: false }
                }
            }
        }
    });
}

function criarInsight(tipo, titulo, texto, icone) {
    return `
        <article class="insight-card ${tipo}">
            <div class="insight-top">
                <span class="insight-icon"><i class="fas ${icone}"></i></span>
                <span class="insight-title">${titulo}</span>
            </div>
            <p>${texto}</p>
        </article>
    `;
}

function gerarInsights() {
    const container = document.getElementById('insights-container');
    const m = calcularMedias();
    const iceMedio = media(icePorJogo.map(item => item.ice));
    const insights = [];

    if (iceMedio >= 65) {
        insights.push(criarInsight(
            'good', 'Bom nível de ICE',
            `O time apresenta ICE médio de ${Math.round(iceMedio)}/100 nos jogos analisados, indicando um desempenho geral consistente dentro do modelo atual.`,
            'fa-arrow-trend-up'
        ));
    } else if (iceMedio >= 50) {
        insights.push(criarInsight(
            'warning', 'ICE intermediário',
            `O ICE médio está em ${Math.round(iceMedio)}/100. Há espaço para evolução em um ou mais pilares do índice.`,
            'fa-chart-line'
        ));
    } else {
        insights.push(criarInsight(
            'bad', 'ICE abaixo do esperado',
            `O ICE médio está em ${Math.round(iceMedio)}/100. Os dados recentes sugerem atenção ao desempenho coletivo.`,
            'fa-triangle-exclamation'
        ));
    }

    if (m.xg >= 1.2 && m.gols >= m.xg * .8) {
        insights.push(criarInsight(
            'good', 'Produção ofensiva',
            `O time registra ${m.xg.toFixed(2)} de xG e ${m.gols.toFixed(1)} gol por jogo, mostrando boa produção ofensiva nos jogos analisados.`,
            'fa-bullseye'
        ));
    } else if (m.xg >= 1.2) {
        insights.push(criarInsight(
            'warning', 'Eficiência ofensiva',
            `A equipe produz ${m.xg.toFixed(2)} de xG por jogo, mas a média de gols (${m.gols.toFixed(1)}) está abaixo do volume esperado pelo modelo de xG.`,
            'fa-chart-simple'
        ));
    } else {
        insights.push(criarInsight(
            'warning', 'Criação ofensiva',
            `O xG médio está em ${m.xg.toFixed(2)} por jogo. A criação de oportunidades pode ser um ponto importante para evolução.`,
            'fa-bullseye'
        ));
    }

    if (m.sofridos <= 1) {
        insights.push(criarInsight(
            'good', 'Solidez defensiva',
            `O Joinville sofre em média ${m.sofridos.toFixed(1)} gol por jogo, um indicador positivo para a organização defensiva.`,
            'fa-shield-halved'
        ));
    } else {
        insights.push(criarInsight(
            'bad', 'Atenção à defesa',
            `A equipe sofre em média ${m.sofridos.toFixed(1)} gol por jogo. Esse indicador merece acompanhamento nos próximos jogos.`,
            'fa-shield-halved'
        ));
    }

    container.innerHTML = insights.slice(0, 3).join('');
}

async function carregarDashboard() {
    const status = document.getElementById('data-status');

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        jogosData = Array.isArray(data.jogos) ? data.jogos : [];
        icePorJogo = jogosData.map(calcularICEUnico);

        if (!jogosData.length) {
            throw new Error('A API não retornou jogos.');
        }

        atualizarKPIs();
        renderizarForma();
        renderizarGrafico();
        gerarInsights();

        status.textContent = `${jogosData.length} jogos carregados`;
    } catch (error) {
        console.error('Erro ao carregar Dashboard:', error);
        status.textContent = 'Erro ao carregar dados';

        document.getElementById('form-container').innerHTML =
            '<div class="dashboard-error"><i class="fas fa-triangle-exclamation"></i> Não foi possível carregar os jogos.</div>';

        document.getElementById('insights-container').innerHTML =
            '<div class="dashboard-error"><i class="fas fa-circle-exclamation"></i> Não foi possível gerar a análise.</div>';
    }
}

document.addEventListener('DOMContentLoaded', carregarDashboard);