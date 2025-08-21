# Projeto Flask - Nome do Projeto

Este é um projeto simples usando o framework [Flask](https://flask.palletsprojects.com/) em Python.

## 🚀 Como rodar o projeto

### Pré-requisitos

- Python 3.8 ou superior
- `pip` instalado
- (Opcional) [virtualenv](https://pypi.org/project/virtualenv/) para criar ambientes virtuais

---

### 🔧 Instalação

1. Clone este repositório:

```bash

git clone https://github.com/dev-willem/api_tasks_bitrix24.git
cd seu-repo
```
2. Linux/macOS:
```bash

python3 -m venv venv
source venv/bin/activate
```
2. Windows:
```bash

python -m venv venv
venv\Scripts\activate
```
3. Instalar pacotes:
```bash

pip install -r requirements.txt
```
4. Configurar variáveis de ambiente:
* Linux/macOS:
```bash

cp .env.example .env
```
* Windows (CMD):
```bash

copy .env.example .env
```
5. Rodar o projeto na sua máquina:
```bash

flask run
```
.
├── app.py
├── static/
├── templates/
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
└── README.md
```

🛠️ Tecnologias usadas:
1. Python
2. Flask