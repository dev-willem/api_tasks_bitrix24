const tabela = document.getElementById('tabela-corpo');

tabela.addEventListener('input', () => {
    gerarInsights();
});

function gerarInsights() {
    const linhas = document.querySelectorAll('#tabela-corpo tr');
    const insights = {
        total: 0,
        status: {},
        porResponsavel: {},
        atrasadas: 0
    };

    const hoje = new Date();

    linhas.forEach(tr => {
        const celulas = tr.querySelectorAll('td');
        const status = celulas[11]?.innerText.trim();
        const responsavel = celulas[2]?.innerText.trim();
        const prazoStr = celulas[8]?.innerText.trim();
        const prazo = parseData(prazoStr);

        insights.total++;

        if (status) {
            insights.status[status] = (insights.status[status] || 0) + 1;
        }

        if (responsavel) {
            insights.porResponsavel[responsavel] = (insights.porResponsavel[responsavel] || 0) + 1;
        }

        if (prazo && prazo < hoje) {
            insights.atrasadas++;
        }
    });

    exibirInsights(insights);

    return insights;
}


function parseData(dataHoraStr) {
    if (!dataHoraStr) return null;

    const [dataPart, horaPart] = dataHoraStr.split(' ');
    const [dia, mes, ano] = dataPart.split('/');

    const [hora = '00', minuto = '00'] = horaPart ? horaPart.split(':') : [];

    return new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}`);
}


function exibirInsights(insights) {
    const container = document.getElementById('insights');
    let html = `<h3>Insights</h3>`;
    html += `<p>Total de tarefas: <strong>${insights.total}</strong></p>`;

    html += `<p><strong>Status:</strong><ul>`;
    for (const [status, count] of Object.entries(insights.status)) {
        html += `<li>${status}: ${count}</li>`;
    }
    html += `</ul></p>`;

    html += `<p><strong>Por responsável:</strong><ul>`;
    for (const [nome, count] of Object.entries(insights.porResponsavel)) {
        html += `<li>${nome}: ${count}</li>`;
    }
    html += `</ul></p>`;

    html += `<p><strong>Tarefas atrasadas:</strong> ${insights.atrasadas}</p>`;

    container.innerHTML = html;
}
