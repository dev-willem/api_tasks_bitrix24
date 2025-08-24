const btn = document.getElementById('gerar-btn');
btn.addEventListener('click', function () {
    btn.disabled = true;
    btn.textContent = 'Carregando...';

    fetch('/generate')
        .then(response => {
            if (!response.ok) throw new Error("Erro ao buscar /generate");
            return response.text();
        })
        .then(html => {
            document.getElementById('tabela-corpo').innerHTML = html;
            gerarInsights();
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao carregar dados");
        })
        .finally(() => {
            btn.disabled = false;
            btn.textContent = 'Gerar Planilha';
        });
});
