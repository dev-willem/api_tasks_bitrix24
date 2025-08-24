from datetime import datetime
from dotenv import load_dotenv
import requests
import math
import csv
import os

load_dotenv()

COMPLETED_TASKS_STATUS_CODE = "5"
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
            dt = datetime.fromisoformat(data_iso)
            dt_local = dt.astimezone()
            return dt_local.strftime("%d/%m/%Y %H:%M")
        except ValueError:
            return "---"
    return "---"

def get_tasks():
    WEBHOOK_URL = f"https://{GROUP_NAME}.bitrix24.com.br/rest/{USER_ID}/{TOKEN}/"
    tasks_final = []
    
    next_page = None

    while True:
        # Se next_page estiver vazio, é a primeira requisição; caso contrário, continuamos de onde paramos
        params = {"start": next_page} if next_page else {}
        response = requests.get(f"{WEBHOOK_URL}task.item.list.json/", params=params)
        data = response.json()

        tasks_final.extend(data.get("result", []))
        
        next_page = data.get("next")
        
        print("Tarefas registradas:", len(tasks_final))
        
        if not next_page:
            break

    # first_response = requests.get(f"{WEBHOOK_URL}task.item.list.json/")
    # data_first = first_response.json()

    # total = data_first.get("total", 0)
    # page_size = len(data_first.get("result", []))  # normalmente 50
    # total_pages = math.ceil(total / page_size) if page_size else 1

    # # calcular as duas últimas páginas
    # last_pages = [max(0, (total_pages - 2) * page_size), (total_pages - 1) * page_size]

    # # buscar as duas últimas páginas
    # for start in last_pages:
    #     response = requests.get(f"{WEBHOOK_URL}task.item.list.json/", params={"start": start})
    #     data = response.json()
    #     tasks_final.extend(data.get("result", []))
    #     print(len(tasks_final))

    tasks_final_dict = []
    for task in tasks_final:
        status = task.get("STATUS")
        if status != COMPLETED_TASKS_STATUS_CODE:
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

    print(f"\n {len(tasks_final_dict)} tarefas armazenadas com sucesso!")
    return tasks_final_dict
