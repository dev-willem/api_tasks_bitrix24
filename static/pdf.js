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
  const colorTexto = [51, 51, 51]; // #333 (aprox)
  const colorTextoClaro = [119, 119, 119]; // #777

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
    const colorTitulo = [26, 4, 59];
    const colorVerde = [97, 191, 26];
    const colorTexto = [51, 51, 51];
    const fontSizeTitulo = 12;
    const fontSizeNormal = 9;
    const fontSizeTituloSecundario = 10;

    doc.setFontSize(fontSizeTitulo);
    doc.setTextColor(...colorTitulo);
    doc.setFont(undefined, "bold");
    doc.text("INSIGHTS", marginX, finalY);

    doc.setDrawColor(238, 238, 238);
    doc.setLineWidth(0.3);
    doc.line(marginX, finalY + 3, pageWidth - marginX, finalY + 3);

    finalY += 10;
    finalY = checkAddPage(finalY);

    doc.setFontSize(fontSizeNormal);
    doc.setTextColor(...colorTexto);
    doc.setFont(undefined, "normal");
    doc.text(`Total de tarefas: ${insights.total}`, marginX, finalY);

    finalY += 6;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text("Status:", marginX, finalY);

    doc.setFont(undefined, "normal");
    doc.setFontSize(fontSizeNormal);
    Object.entries(insights.status).forEach(([key, val]) => {
      finalY += lineHeight;
      finalY = checkAddPage(finalY);
      doc.setFillColor(...colorVerde);
      doc.circle(marginX + 3, finalY - 1, bulletRadius, "F");
      doc.setTextColor(...colorTexto);
      doc.text(`${key}: ${val}`, bulletOffsetX, finalY);
    });

    finalY += 5;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text("Por responsável:", marginX, finalY);

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

    finalY += 5;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text("Tarefas com status 'Atrasada':", marginX, finalY);

    finalY += lineHeight;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "normal");
    doc.setFontSize(fontSizeNormal);
    doc.text(`Total: ${insights.statusAtrasada.length}`, bulletOffsetX, finalY);

    if (insights.statusAtrasada.length) {
      const ids = insights.statusAtrasada.join(", ");
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

    finalY += 5;
    finalY = checkAddPage(finalY);
    doc.setFont(undefined, "bold");
    doc.setFontSize(fontSizeTituloSecundario);
    doc.text('Lista de IDs com campos vazios "---":', marginX, finalY);

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

    doc.save("tarefas-bitrix.pdf");
  }, 100);
});

// Função auxiliar para capitalizar a primeira letra
function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
