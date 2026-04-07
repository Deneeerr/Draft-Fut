        // ================================
        // LIMITES PARA CÁLCULO DO ICE
        // ================================
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

        function clamp(v) { return Math.max(0, Math.min(100, v)); }
        function normalizar(v, min, max) { return max === min ? 0 : clamp(((v - min) / (max - min)) * 100); }
        function normalizarInv(v, min, max) { return clamp(100 - normalizar(v, min, max)); }
        function media(arr) { return arr.reduce((a,b)=>a+b,0)/arr.length; }
        function passesPct(certos, total) { return total ? clamp((certos/total)*100) : 0; }

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

        // Dados estáticos dos jogos (baseado no arquivo dados.py)
        const jogosData = [
            {"adversario": "Carlos Renaux", "resultado": "D", "finalizacoes": 16, "finalizacoes_no_alvo": 8, "xg": 0.64, "gols_marcados": 0, "desarmes": 4, "interceptacoes": 13, "gols_sofridos": 1, "passes_certos": 341, "total_passes": 417, "posse_bola": 66.0, "chances_criadas": 15, "assistencias": 0},
            {"adversario": "Chapecoense", "resultado": "D", "finalizacoes": 6, "finalizacoes_no_alvo": 3, "xg": 0.19, "gols_marcados": 0, "desarmes": 5, "interceptacoes": 12, "gols_sofridos": 6, "passes_certos": 306, "total_passes": 352, "posse_bola": 44.0, "chances_criadas": 4, "assistencias": 0},
            {"adversario": "Marcílio Dias", "resultado": "D", "finalizacoes": 7, "finalizacoes_no_alvo": 3, "xg": 0.48, "gols_marcados": 2, "desarmes": 4, "interceptacoes": 5, "gols_sofridos": 4, "passes_certos": 132, "total_passes": 180, "posse_bola": 42.0, "chances_criadas": 5, "assistencias": 0},
            {"adversario": "Figueirense", "resultado": "D", "finalizacoes": 7, "finalizacoes_no_alvo": 2, "xg": 0.40, "gols_marcados": 0, "desarmes": 1, "interceptacoes": 11, "gols_sofridos": 1, "passes_certos": 302, "total_passes": 347, "posse_bola": 42.0, "chances_criadas": 6, "assistencias": 0},
            {"adversario": "Carlos Renaux", "resultado": "V", "finalizacoes": 13, "finalizacoes_no_alvo": 5, "xg": 1.19, "gols_marcados": 3, "desarmes": 3, "interceptacoes": 14, "gols_sofridos": 0, "passes_certos": 344, "total_passes": 406, "posse_bola": 60.0, "chances_criadas": 5, "assistencias": 0},
            {"adversario": "Carlos Renaux", "resultado": "D", "finalizacoes": 18, "finalizacoes_no_alvo": 4, "xg": 1.53, "gols_marcados": 1, "desarmes": 2, "interceptacoes": 23, "gols_sofridos": 2, "passes_certos": 246, "total_passes": 314, "posse_bola": 60.0, "chances_criadas": 8, "assistencias": 1},
            {"adversario": "CSA", "resultado": "V", "finalizacoes": 10, "finalizacoes_no_alvo": 3, "xg": 0.99, "gols_marcados": 1, "desarmes": 10, "interceptacoes": 8, "gols_sofridos": 0, "passes_certos": 321, "total_passes": 395, "posse_bola": 50.0, "chances_criadas": 3, "assistencias": 0},
            {"adversario": "Figueirense", "resultado": "D", "finalizacoes": 9, "finalizacoes_no_alvo": 3, "xg": 0.43, "gols_marcados": 0, "desarmes": 3, "interceptacoes": 13, "gols_sofridos": 3, "passes_certos": 384, "total_passes": 446, "posse_bola": 52.0, "chances_criadas": 6, "assistencias": 0},
            {"adversario": "Marcílio Dias", "resultado": "D", "finalizacoes": 3, "finalizacoes_no_alvo": 1, "xg": 0.03, "gols_marcados": 0, "desarmes": 2, "interceptacoes": 6, "gols_sofridos": 2, "passes_certos": 376, "total_passes": 442, "posse_bola": 64.0, "chances_criadas": 1, "assistencias": 0},
            {"adversario": "São Bernardo", "resultado": "D", "finalizacoes": 11, "finalizacoes_no_alvo": 5, "xg": 0.89, "gols_marcados": 0, "desarmes": 8, "interceptacoes": 6, "gols_sofridos": 1, "passes_certos": 302, "total_passes": 386, "posse_bola": 47.0, "chances_criadas": 5, "assistencias": 0}
        ];

        let icePorJogo = [];

        function renderizarDashboard() {
            const container = document.getElementById('games-container');
            
            // Calcular indicadores
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
            
            // Renderizar cards
            container.innerHTML = jogosData.map((jogo, index) => {
                let classeResultado = '';
                let textoResultado = '';
                if (jogo.resultado === 'V') {
                    classeResultado = 'vitoria';
                    textoResultado = 'Vitória';
                } else if (jogo.resultado === 'E') {
                    classeResultado = 'empate';
                    textoResultado = 'Empate';
                } else {
                    classeResultado = 'derrota';
                    textoResultado = 'Derrota';
                }
                
                const iceCalc = icePorJogo[index] ? Math.round(icePorJogo[index].ice) : '--';
                
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
            renderizarDashboard();
            
            const iceMedio = (icePorJogo.reduce((sum, i) => sum + i.ice, 0) / icePorJogo.length).toFixed(1);
            document.getElementById('ice-medio').innerHTML = iceMedio;
            
            // Renderizar lista ICE
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
            const ice = icePorJogo[index] || calcularICEUnico(jogo);
            
            document.getElementById('modal-title').innerHTML = `vs ${jogo.adversario} • ${jogo.resultado === 'V' ? 'Vitória' : jogo.resultado === 'E' ? 'Empate' : 'Derrota'}`;
            
            document.getElementById('modal-body').innerHTML = `
                <div class="stats-categories">
                    <div class="category-card">
                        <h4>🔗 Conexão</h4>
                        <div class="category-value">${Math.round(ice.conexao)}%</div>
                    </div>
                    <div class="category-card">
                        <h4>⚡ Eficiência</h4>
                        <div class="category-value">${Math.round(ice.eficiencia)}%</div>
                    </div>
                    <div class="category-card">
                        <h4>🛡️ Defesa</h4>
                        <div class="category-value">${Math.round(ice.defesa)}%</div>
                    </div>
                    <div class="category-card">
                        <h4>🎮 Controle</h4>
                        <div class="category-value">${Math.round(ice.controle)}%</div>
                    </div>
                </div>
                
                <div class="stats-detail-grid">
                    <div class="detail-stat"><div class="label">⚽ Gols Marcados</div><div class="value">${jogo.gols_marcados}</div></div>
                    <div class="detail-stat"><div class="label">🎯 Gols Sofridos</div><div class="value">${jogo.gols_sofridos}</div></div>
                    <div class="detail-stat"><div class="label">📊 Finalizações</div><div class="value">${jogo.finalizacoes}</div></div>
                    <div class="detail-stat"><div class="label">🎯 Finalizações no Alvo</div><div class="value">${jogo.finalizacoes_no_alvo}</div></div>
                    <div class="detail-stat"><div class="label">📈 xG</div><div class="value">${jogo.xg}</div></div>
                    <div class="detail-stat"><div class="label">🛡️ Desarmes</div><div class="value">${jogo.desarmes}</div></div>
                    <div class="detail-stat"><div class="label">✋ Interceptações</div><div class="value">${jogo.interceptacoes}</div></div>
                    <div class="detail-stat"><div class="label">💪 Posse de Bola</div><div class="value">${jogo.posse_bola}%</div></div>
                    <div class="detail-stat"><div class="label">🎯 Precisão de Passes</div><div class="value">${((jogo.passes_certos / jogo.total_passes) * 100).toFixed(1)}%</div></div>
                    <div class="detail-stat"><div class="label">🎨 Chances Criadas</div><div class="value">${jogo.chances_criadas}</div></div>
                    <div class="detail-stat"><div class="label">🅰️ Assistências</div><div class="value">${jogo.assistencias}</div></div>
                    <div class="detail-stat"><div class="label">📋 ICE Total</div><div class="value" style="color:#f5a623">${Math.round(ice.ice)}%</div></div>
                </div>
            `;
            
            document.getElementById('modal').style.display = 'block';
        }

        function fecharModal() {
            document.getElementById('modal').style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target === document.getElementById('modal')) {
                fecharModal();
            }
        }

        document.getElementById('calc-ice-btn').addEventListener('click', calcularTodosICE);
        
        // Inicialização
        renderizarDashboard();