const tabela = document.getElementById("tabela-corpo");

tabela.addEventListener("input", () => {
  gerarInsights();
});

function gerarInsights() {
  const linhas = document.querySelectorAll("#tabela-corpo tr");
  const insights = {
    total: 0,
    status: {},
    porResponsavel: {},
    vazios: {
      responsavel: [],
      sistema: [],
      equipe: [],
      branch: [],
      validacao: [],
      prazo: [],
    },
    statusAtrasada: [], // IDs das linhas com status "Atrasada"
  };

  linhas.forEach((tr) => {
    const celulas = tr.querySelectorAll("td");
    const id = celulas[0]?.innerText.trim();
    const responsavel = celulas[2]?.innerText.trim();
    const sistema = celulas[3]?.innerText.trim();
    const equipe = celulas[4]?.innerText.trim();
    const branch = celulas[5]?.innerText.trim();
    const validacao = celulas[6]?.innerText.trim();
    const prazoStr = celulas[8]?.innerText.trim();
    const status = celulas[11]?.innerText.trim();

    insights.total++;

    // Verificação de campos vazios (ou "---")
    if (!responsavel || responsavel === "---")
      insights.vazios.responsavel.push(id);
    if (!sistema || sistema === "---") insights.vazios.sistema.push(id);
    if (!equipe || equipe === "---") insights.vazios.equipe.push(id);
    if (!branch || branch === "---") insights.vazios.branch.push(id);
    if (!validacao || validacao === "---") insights.vazios.validacao.push(id);
    if (!prazoStr || prazoStr === "---") insights.vazios.prazo.push(id);

    // Contagem por status
    if (status) {
      insights.status[status] = (insights.status[status] || 0) + 1;
    }

    // Coleta de IDs com status "Atrasada"
    if (status === "Atrasada") {
      insights.statusAtrasada.push(id);
    }

    // Contagem por responsável
    if (responsavel && responsavel !== "---") {
      insights.porResponsavel[responsavel] =
        (insights.porResponsavel[responsavel] || 0) + 1;
    }
  });

  exibirInsights(insights);

  return insights;
}

function formatarIDs(ids) {
  if (!ids.length) return "";
  return `<span style="color: gray;">(IDs: ${ids.join(", ")})</span>`;
}

function exibirInsights(insights) {
  const container = document.getElementById("insights");
  let html = `<h3>Insights</h3>`;

  html += `<p>Total de tarefas: <strong>${insights.total}</strong></p>`;

  html += `<p><strong>Status:</strong><ul>`;
  for (const [status, count] of Object.entries(insights.status)) {
    html += `<li>${status}: ${count}</li>`;
  }
  html += `</ul></p>`;

  html += `<p><strong>Quantidade de tarefas de cada componente:</strong><ul>`;
  for (const [nome, count] of Object.entries(insights.porResponsavel)) {
    html += `<li>${nome}: ${count}</li>`;
  }
  html += `</ul></p>`;

  html += `<p><strong>Listas de tarefas atrasadas:</strong> ${
    insights.statusAtrasada.length
  } ${formatarIDs(insights.statusAtrasada)}</p>`;

  html += `<p><strong>Tarefas com campos não preenchidos:</strong><ul>`;
  html += `<li>Responsável: ${insights.vazios.responsavel.length} ${formatarIDs(
    insights.vazios.responsavel
  )}</li>`;
  html += `<li>Sistema: ${insights.vazios.sistema.length} ${formatarIDs(
    insights.vazios.sistema
  )}</li>`;
  html += `<li>Equipe: ${insights.vazios.equipe.length} ${formatarIDs(
    insights.vazios.equipe
  )}</li>`;
  html += `<li>Branch: ${insights.vazios.branch.length} ${formatarIDs(
    insights.vazios.branch
  )}</li>`;
  html += `<li>Validação: ${insights.vazios.validacao.length} ${formatarIDs(
    insights.vazios.validacao
  )}</li>`;
  html += `<li>Prazo: ${insights.vazios.prazo.length} ${formatarIDs(
    insights.vazios.prazo
  )}</li>`;
  html += `</ul></p>`;

  container.innerHTML = html;
}
