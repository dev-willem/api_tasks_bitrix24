from flask import Flask, render_template, jsonify
from script import get_tasks

app = Flask(__name__)

@app.route("/")
def index():
    colunas = ["ID", "TÍTULO", "RESPONSÁVEL", "SISTEMA", "EQUIPE", "BRANCH", "VALIDAÇÃO", "ABERTURA", "PRAZO", "ÚLTIMA MOV", "ETAPA", "STATUS"]
    return render_template("index.html", colunas=colunas)

@app.route("/gerar", methods=["POST"])
def gerar():
    dados = get_tasks()
    return jsonify(dados)
