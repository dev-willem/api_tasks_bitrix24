from flask import Flask, render_template, jsonify
from script import get_tasks

app = Flask(__name__)

COLUNAS = ["ID", "TÍTULO", "RESPONSÁVEL", "SISTEMA", "EQUIPE", "BRANCH", "VALIDAÇÃO", "ABERTURA", "PRAZO", "ÚLTIMA MOV", "ETAPA", "STATUS"]

@app.route("/")
def index():
    return render_template("index.html", colunas=COLUNAS)

@app.route("/generate")
def gerar():
    dados = get_tasks()
    return render_template("table_body.html", colunas=COLUNAS, dados=dados)
