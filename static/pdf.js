document.getElementById("exportar-btn").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    let finalY = 20;

    doc.autoTable({
        html: '#tabela',
        startY: finalY,
        theme: 'grid',
        styles: {
            fontStyle: 'bold',
            fontSize: 5,
            cellPadding: 2,
            halign: 'center',
            valign: 'middle'
        },
        headStyles: { fillColor: [26, 4, 59], textColor: [97, 191, 26], fontStyle: 'bold' },
        tableWidth: 'auto',
        didDrawPage: function (data) {
            const title = 'Lista de Tarefas Bitrix';
            const textWidth = doc.getTextWidth(title);
            const x = (pageWidth - textWidth) / 2;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(26, 4, 59);
            doc.text(title, x, 10);

            finalY = data.cursor.y + 10;
        }
    });

    // Espera a tabela ser desenhada antes de adicionar os insights
    setTimeout(() => {
        const insights = gerarInsights();

        doc.setFontSize(8);
        doc.setTextColor(0);

        doc.text(`Total de tarefas: ${insights.total}`, 14, finalY);

        finalY += 6;
        doc.text("Status:", 14, finalY);
        Object.entries(insights.status).forEach(([key, val]) => {
            finalY += 5;
            doc.text(`- ${key}: ${val}`, 20, finalY);
        });

        finalY += 6;
        doc.text("Responsável:", 14, finalY);
        Object.entries(insights.porResponsavel).forEach(([key, val]) => {
            finalY += 5;
            doc.text(`- ${key}: ${val}`, 20, finalY);
        });

        finalY += 6;
        doc.text(`Tarefas atrasadas: ${insights.atrasadas}`, 14, finalY);

        doc.save('tarefas-bitrix.pdf');
    }, 100);
});
