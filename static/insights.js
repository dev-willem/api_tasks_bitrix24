const tabela = document.getElementById("tabela-corpo");

tabela.addEventListener("input", () => {
  gerarInsights();
});

function gerarInsights() {
  const linhas = document.querySelectorAll("#tabela-corpo tr");
  const insights = {
    total: 0,
    porEtapa: {},
    porEquipe: {},
    porResponsavel: {},
    vazios: {
      responsavel: [],
      sistema: [],
      equipe: [],
      prazo: [],
    },
    atrasadas: [],
  };

  linhas.forEach((tr) => {
    const CELULAS = tr.querySelectorAll("td");
    const ID = CELULAS[0]?.innerText.trim();
    const FOCO = CELULAS[1]?.innerText.trim();
    const CRIADOR = CELULAS[2]?.innerText.trim();
    const TASK = CELULAS[3]?.innerText.trim();
    const ETAPA = CELULAS[4]?.innerText.trim();
    const ETAPA_EQUIPE = CELULAS[5]?.innerText.trim();
    const ETAPA_RESP = CELULAS[6]?.innerText.trim();
    const RESPONSAVEL = CELULAS[7]?.innerText.trim();
    const SISTEMA = CELULAS[8]?.innerText.trim();
    const CRIACAO = CELULAS[9]?.innerText.trim();
    const ULT_ATUALIZACAO = CELULAS[10]?.innerText.trim();
    const PRAZO = CELULAS[11]?.innerText.trim();

    insights.total++;

    // Contagem por etapa
    if (ETAPA) {
      insights.porEtapa[ETAPA] = (insights.porEtapa[ETAPA] || 0) + 1;
    }

    // Contagem por equipe
    if (ETAPA_EQUIPE) {
      insights.porEquipe[ETAPA_EQUIPE] =
        (insights.porEquipe[ETAPA_EQUIPE] || 0) + 1;
    }

    // Contagem por responsável
    if (RESPONSAVEL && RESPONSAVEL !== "---") {
      insights.porResponsavel[RESPONSAVEL] =
        (insights.porResponsavel[RESPONSAVEL] || 0) + 1;
    }

    // Campos vazios
    if (!RESPONSAVEL || RESPONSAVEL === "---") insights.vazios.responsavel.push(ID);
    if (!SISTEMA || SISTEMA === "---") insights.vazios.sistema.push(ID);
    if (!ETAPA_EQUIPE || ETAPA_EQUIPE === "---") insights.vazios.equipe.push(ID);
    if (!PRAZO || PRAZO === "---") insights.vazios.prazo.push(ID);

    // Prazo atrasado
    if (PRAZO && PRAZO !== "---") {
      const prazoDate = new Date(PRAZO);
      const hoje = new Date();
      if (!isNaN(prazoDate.getTime()) && prazoDate < hoje) {
        insights.atrasadas.push(ID);
      }
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

  html += `<p><strong>Tarefas por Etapa:</strong><ul>`;
  for (const [etapa, count] of Object.entries(insights.porEtapa)) {
    html += `<li>${etapa}: ${count}</li>`;
  }
  html += `</ul></p>`;

  html += `<p><strong>Tarefas por Equipe:</strong><ul>`;
  for (const [equipe, count] of Object.entries(insights.porEquipe)) {
    html += `<li>${equipe}: ${count}</li>`;
  }
  html += `</ul></p>`;

  html += `<p><strong>Tarefas por Responsável:</strong><ul>`;
  for (const [nome, count] of Object.entries(insights.porResponsavel)) {
    html += `<li>${nome}: ${count}</li>`;
  }
  html += `</ul></p>`;

  html += `<p><strong>Tarefas atrasadas:</strong> ${insights.atrasadas.length
    } ${formatarIDs(insights.atrasadas)}</p>`;

  html += `<p><strong>Tarefas com campos não preenchidos:</strong><ul>`;
  html += `<li>Responsável: ${insights.vazios.responsavel.length} ${formatarIDs(
    insights.vazios.responsavel
  )}</li>`;
  html += `<li>Sistema: ${insights.vazios.sistema.length} ${formatarIDs(
    insights.vazios.sistema
  )}</li>`;
  html += `<li>Prazo: ${insights.vazios.prazo.length} ${formatarIDs(
    insights.vazios.prazo
  )}</li>`;
  html += `</ul></p>`;

  container.innerHTML = html;
}
