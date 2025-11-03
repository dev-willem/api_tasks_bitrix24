document.getElementById("exportar-btn").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const marginBottom = 20;
  let finalY = 20;

  const colorTitulo = [26, 4, 59]; // rgb(26, 4, 59)
  const colorVerde = [97, 191, 26]; // rgb(97, 191, 26)
  const colorTexto = [51, 51, 51]; // #333

  // Exporta tabela em PDF
  doc.autoTable({
    html: "#tabela",
    startY: finalY,
    theme: "grid",
    styles: {
      fontStyle: "bold",
      fontSize: 5,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: colorTitulo,
      textColor: colorVerde,
      fontStyle: "bold",
    },
    tableWidth: "auto",
    didDrawPage: function (data) {
      const title = "Lista de Tarefas Bitrix";
      const textWidth = doc.getTextWidth(title);
      const x = (pageWidth - textWidth) / 2;
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.setTextColor(...colorTitulo);
      doc.text(title, x, 10);

      finalY = data.cursor.y + 10;
    },
  });

  function checkAddPage(currentY) {
    if (currentY > pageHeight - marginBottom) {
      doc.addPage();
      return 20; // reinicia finalY no topo da nova página
    }
    return currentY;
  }

  setTimeout(() => {
    const insights = gerarInsights();

    const marginX = 6;
    const bulletRadius = 0.4;
    const lineHeight = 4;
    const bulletOffsetX = marginX + 5;
    const fontSizeTitulo = 12;
    const fontSizeNormal = 9;
    const fontSizeTituloSecundario = 10;

    // Título "INSIGHTS"
    doc.setFontSize(fontSizeTitulo);
    doc.setTextColor(...colorTitulo);
    doc.setFont(undefined, "bold");
    doc.text("INSIGHTS", marginX, finalY);

    doc.setDrawColor(238, 238, 238);
    doc.setLineWidth(0.3);
    doc.line(marginX, finalY + 3, pageWidth - marginX, finalY + 3);

    finalY += 10;
    finalY = checkAddPage(finalY);

    // Total de tarefas
    doc.setFontSize(fontSizeNormal);
    doc.setTextColor(...colorTexto);
    doc.setFont(undefined, "normal");
    doc.text(`Total de tarefas: ${insights.total}`, marginX, finalY);

    // --- Tarefas por etapa ---
    finalY += 6;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text("Tarefas por Etapa:", marginX, finalY);

    doc.setFont(undefined, "normal");
    doc.setFontSize(fontSizeNormal);

    const mostradas = new Set();
    const ordemEtapa = [
      "Triagem/Análise",
      "Aguardando Informações",
      "Backlog de Produtos",
      "Refinamento Produtos",
      "Pronto para desenvolvimento",
      "Em desenvolvimento",
      "Code Review",
      "Deploy em Homologação",
      "Validação de Sustentação",
      "Validação de Produtos",
      "Retorno",
      "Aguardando Deploy Produção",
      "Deploy Produção",
      "Adiada",
      "Concluída",
    ];
    // Primeiro, exibe as etapas na ordem fixa
    for (const etapa of ordemEtapa) {
      const count = insights.porEtapa[etapa] || 0;
      finalY += lineHeight;
      finalY = checkAddPage(finalY);
      doc.setFillColor(...colorVerde);
      doc.circle(marginX + 3, finalY - 1, bulletRadius, "F");
      doc.setTextColor(...colorTexto);
      doc.text(`${etapa}: ${count}`, bulletOffsetX, finalY);
      mostradas.add(etapa);
    }
    // Depois, exibe etapas extras (caso existam novas não previstas)
    for (const [etapa, count] of Object.entries(insights.porEtapa)) {
      if (!mostradas.has(etapa)) {
        finalY += lineHeight;
        finalY = checkAddPage(finalY);
        doc.setFillColor(...colorVerde);
        doc.circle(marginX + 3, finalY - 1, bulletRadius, "F");
        doc.setTextColor(...colorTexto);
        doc.text(`${etapa}: ${count}`, bulletOffsetX, finalY);
      }
    }

    // --- Tarefas por equipe ---
    finalY += 6;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text("Tarefas por Equipe:", marginX, finalY);

    doc.setFont(undefined, "normal");
    doc.setFontSize(fontSizeNormal);
    Object.entries(insights.porEquipe).forEach(([key, val]) => {
      finalY += lineHeight;
      finalY = checkAddPage(finalY);
      doc.setFillColor(...colorVerde);
      doc.circle(marginX + 3, finalY - 1, bulletRadius, "F");
      doc.setTextColor(...colorTexto);
      doc.text(`${key}: ${val}`, bulletOffsetX, finalY);
    });

    // --- Tarefas por responsável ---
    finalY += 6;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text("Tarefas por Responsável:", marginX, finalY);

    doc.setFont(undefined, "normal");
    doc.setFontSize(fontSizeNormal);
    Object.entries(insights.porResponsavel).forEach(([key, val]) => {
      finalY += lineHeight;
      finalY = checkAddPage(finalY);
      doc.setFillColor(...colorVerde);
      doc.circle(marginX + 3, finalY - 1, bulletRadius, "F");
      doc.setTextColor(...colorTexto);
      doc.text(`${key}: ${val}`, bulletOffsetX, finalY);
    });

    // --- Tarefas atrasadas ---
    finalY += 6;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text("Tarefas atrasadas:", marginX, finalY);

    finalY += lineHeight;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "normal");
    doc.setFontSize(fontSizeNormal);
    doc.text(`Total: ${insights.atrasadas.length}`, bulletOffsetX, finalY);

    if (insights.atrasadas.length) {
      const ids = insights.atrasadas.join(", ");
      finalY += lineHeight;
      finalY = checkAddPage(finalY);
      doc.setFontSize(8);
      doc.setTextColor(100);

      const maxWidth = pageWidth - (marginX + 20);
      const splittedText = doc.splitTextToSize(`IDs: ${ids}`, maxWidth);
      doc.text(splittedText, marginX + 10, finalY);
      finalY += splittedText.length * lineHeight;

      finalY = checkAddPage(finalY);
      doc.setFontSize(fontSizeNormal);
      doc.setTextColor(...colorTexto);
    }

    // --- Campos vazios ---
    finalY += 6;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text("Tarefas com campos não preenchidos:", marginX, finalY);

    doc.setFont(undefined, "normal");
    doc.setFontSize(fontSizeNormal);
    for (const [campo, ids] of Object.entries(insights.vazios)) {
      finalY += lineHeight;
      finalY = checkAddPage(finalY);
      doc.setFillColor(...colorVerde);
      doc.circle(marginX + 3, finalY - 1, bulletRadius, "F");
      doc.setTextColor(...colorTexto);
      doc.text(`${capitalizar(campo)}: ${ids.length}`, bulletOffsetX, finalY);

      if (ids.length) {
        const idsStr = ids.join(", ");
        finalY += lineHeight;
        finalY = checkAddPage(finalY);
        doc.setFontSize(8);
        doc.setTextColor(100);

        const maxWidth = pageWidth - (marginX + 20);
        const splittedText = doc.splitTextToSize(`IDs: ${idsStr}`, maxWidth);
        doc.text(splittedText, marginX + 10, finalY);
        finalY += splittedText.length * lineHeight;

        finalY = checkAddPage(finalY);
        doc.setFontSize(fontSizeNormal);
        doc.setTextColor(...colorTexto);
      }
    }

    // Salvar PDF
    const agora = new Date();
    
    // Função para adicionar zero à esquerda, se necessário
    const pad = (num) => String(num).padStart(2, "0");

    const ano = agora.getFullYear();
    const mes = pad(agora.getMonth() + 1);
    const dia = pad(agora.getDate());
    const hora = pad(agora.getHours());
    const minuto = pad(agora.getMinutes());

    // Monta a string no formato desejado
    const dataFormatada = `${ano}${mes}${dia}-${hora}:${minuto}`;

    doc.save(`${dataFormatada}-tarefas-bitrix.pdf`);
  }, 100);
});

// Função auxiliar para capitalizar a primeira letra
function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
