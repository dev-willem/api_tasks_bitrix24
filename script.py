from datetime import datetime
from dotenv import load_dotenv
import requests
import math
import csv
import os

load_dotenv()

GROUP_NAME = os.getenv('GROUP_NAME')
USER_ID = os.getenv('USER_ID')
TOKEN = os.getenv('TOKEN')

def status_verify(status):
    match status:
        case "-1":
            return "Atrasada"
        case "1":
            return "Nova"
        case "2":
            return "Pendente"
        case "3":
            return "Em andamento"
        case "4":
            return "Supostamente concluída"
        case "5":
            return "Concluída"
        case "6":
            return "Adiada"
        case "7":
            return "Recusada"
        case _:
            return "Status desconhecido"

def time_date_format(data_iso):
    if data_iso and data_iso.strip():
        try:
            return datetime.fromisoformat(data_iso).strftime("%d/%m/%Y %H:%M")
        except ValueError:
            return " --- "
    return " --- "

def get_tasks():
    WEBHOOK_URL = f"https://{GROUP_NAME}.bitrix24.com.br/rest/{USER_ID}/{TOKEN}/"
    tasks_final = []

    # 1ª chamada apenas para descobrir total de tarefas
    first_response = requests.get(f"{WEBHOOK_URL}task.item.list.json/")
    data_first = first_response.json()

    total = data_first.get("total", 0)  # número total de tarefas
    page_size = len(data_first.get("result", []))  # normalmente 50
    total_pages = math.ceil(total / page_size) if page_size else 1

    # calcular as duas últimas páginas
    last_pages = [max(0, (total_pages - 2) * page_size), (total_pages - 1) * page_size]

    # buscar as duas últimas páginas
    for start in last_pages:
        response = requests.get(f"{WEBHOOK_URL}task.item.list.json/", params={"start": start})
        data = response.json()
        tasks_final.extend(data.get("result", []))

    # processar resultados
    tasks_final_dict = []
    for task in tasks_final:
        status = task.get("STATUS")
        if status != "5":
            etapa = task.get("REAL_STATUS")
            prazo = time_date_format(task.get("DEADLINE"))
            abertura = time_date_format(task.get("CREATED_DATE"))
            ultima_mov = time_date_format(task.get("CHANGED_DATE"))
            status = status_verify(status)
            etapa = status_verify(etapa)
            tasks_final_dict.append({
                "ID": task.get("ID", ""),
                "TÍTULO": task.get("TITLE", ""),
                "RESPONSÁVEL": task.get("RESPONSIBLE_NAME", "") + " " + task.get("RESPONSIBLE_LAST_NAME", ""),
                "SISTEMA": "---",
                "EQUIPE": "---",
                "BRANCH": "---",
                "VALIDAÇÃO": "---",
                "ABERTURA": abertura,
                "PRAZO": prazo,
                "ÚLTIMA MOV": ultima_mov,
                "ETAPA": etapa,
                "STATUS": status
            })

    print(f"\n {len(tasks_final_dict)} tarefas armazenadas das 2 últimas páginas com sucesso!")
    return tasks_final_dict

# ===== SALVAR EM CSV =====
# csv_filename = datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + ".csv"
# if not tasks_final:
#     print("Nenhuma tarefa encontrada.")
#     exit()
#
# with open(csv_filename, mode="w", newline="", encoding="utf-8") as csv_file:
#     fieldnames = [
#         "ID", "TÍTULO", "RESPONSÁVEL", "SISTEMA", "EQUIPE", "BRANCH", "VALIDAÇÃO", "ABERTURA", "PRAZO", "ÚLTIMA MOV", "ETAPA", "STATUS"
#     ]
#     writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
#     writer.writeheader()
#
#     for task in tasks_final:
#         status = task.get("STATUS")
#         if status != "5":
#             etapa = task.get("REAL_STATUS")
#
#             prazo = time_date_format(task.get("DEADLINE"))
#             abertura = time_date_format(task.get("CREATED_DATE"))
#             ultima_mov = time_date_format(task.get("CHANGED_DATE"))
#
#             status = status_verify(status)
#             etapa = status_verify(etapa)
#
#             writer.writerow({
#                 "ID": task.get("ID", ""),
#                 "TÍTULO": task.get("TITLE", ""),
#                 "RESPONSÁVEL": task.get("RESPONSIBLE_NAME", "") + " " + task.get("RESPONSIBLE_LAST_NAME", ""),
#                 "PRAZO": prazo,
#                 "STATUS": status,
#                 "ETAPA": etapa,
#                 "ABERTURA": abertura,
#                 "ÚLTIMA MOV": ultima_mov,
#                 "SISTEMA": "---",
#                 "EQUIPE": "---",
#                 "BRANCH": "---",
#                 "VALIDAÇÃO": "---"
#             })
#
# print(f"\n Tarefas salvas com sucesso em '{csv_filename}'")
