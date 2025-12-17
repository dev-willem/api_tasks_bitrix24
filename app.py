from flask import Flask, render_template
from script import get_tasks

app = Flask(__name__)

COLUNAS = ["ID", "FOCO", "CRIADOR", "TASK", "ETAPA", "ETAPA EQUIPE", "ETAPA RESPONSÁVEL", "RESPONSÁVEL", "SISTEMA", "CRIAÇÃO", "ÚLTIMA ATUALIZAÇÃO", "PRAZO"]

@app.route("/")
def index():
    return render_template("index.html", colunas=COLUNAS)

@app.route("/generate")
def gerar():
    dados = get_tasks()
    return render_template("table_body.html", colunas=COLUNAS, dados=dados)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)