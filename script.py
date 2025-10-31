from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from dotenv import load_dotenv
import requests
import math
import csv
import os

load_dotenv()

# COMPLETED_TASKS_STATUS_CODE = "5"
GROUP_NAME = os.getenv('GROUP_NAME')
USER_ID = os.getenv('USER_ID')
TOKEN = os.getenv('TOKEN')
WEBHOOK_URL = f"https://{GROUP_NAME}.bitrix24.com.br/rest/{USER_ID}/{TOKEN}/"

def priority_verify(priority):
    match priority:
        case "0":
            return "Não"
        case "1":
            return "Não"
        case "2":
            return "Sim"

def stage_verify(stage):
    match stage:
        case "651":
            return "Triagem/Análise"
        case "1753":
            return "Aguardando Informações"
        case "1933":
            return "Backlog de Produtos"
        case "1773":
            return "Refinamento Produtos"
        case "1755":
            return "Pronto para desenvolvimento"
        case "1757":
            return "Em desenvolvimento"
        case "1759":
            return "Code Review"
        case "1761":
            return "Deploy em Homologação"
        case "1763":
            return "Validação de Sustentação"
        case "1935":
            return "Validação de Produtos"
        case "1769":
            return "Retorno"
        case "1765":
            return "Aguardando Deploy Produção"
        case "1767":
            return "Deploy Produção"
        case "1771":
            return "Adiada"
        case "655":
            return "Concluída"
        
def time_date_format(data_iso):
    if data_iso and data_iso.strip():
        try:
            dt = datetime.fromisoformat(data_iso)
            dt_local = dt.astimezone()
            return dt_local.strftime("%d/%m/%Y %H:%M")
        except ValueError:
            return ""
    return ""

def false_none(field):
    if field == False or field == None:
        field = ""
    return field

def get_fields(task_id):
    response_fields = requests.get(f"{WEBHOOK_URL}task.item.getdata/", params={"taskid": task_id})
    data_fields = response_fields.json()
    fields = data_fields.get("result", [])
    
    title = fields.get("TITLE", "")
    #etapa = status_verify(fields.get("REAL_STATUS"))
    prazo = time_date_format(fields.get("DEADLINE", ""))
    abertura = time_date_format(fields.get("CREATED_DATE", ""))
    estagio = stage_verify(fields.get("STAGE_ID", ""))
    print("\n", fields.get("STAGE_ID"), estagio)
    ultima_mov = time_date_format(fields.get("CHANGED_DATE", ""))
    prioridade = priority_verify(fields.get("PRIORITY", ""))
    criado_por = f"{fields.get("CREATED_BY_NAME")} {fields.get("CREATED_BY_LAST_NAME")}"
    responsavel = false_none(fields.get("UF_AUTO_298159569350", ""))
    sistemas = fields.get("UF_AUTO_576718929338", []) # por algum motivo vem uma lista de sistemas com apenas 1
    sistema = sistemas[0] if sistemas else ""
    equipe = fields.get("UF_AUTO_718901754199", "")
    
    return title, prazo, abertura, ultima_mov, responsavel, sistema, equipe, prioridade, criado_por, estagio

def responsible_by_team(equipe, responsavel):
    if  responsavel == "" or responsavel == "-":
        if not equipe or equipe == "" or equipe == "-" or equipe == "Desenvolvimento":
            return "Henrique d'Almeida"
        elif equipe == "Sustentação":
            return "Carlos André"
        elif equipe == "Produtos":
            return "Tchacyo Lima"
    else:
        return responsavel

def get_tasks():
    tasks_filtradas = []
    next_page = None

    while True:
        params = {"start": next_page} if next_page else {}
        # print(f"{WEBHOOK_URL}task.item.list/?ORDER[ID]=asc&FILTER[!STATUS]=5&")
        response = requests.get(f"{WEBHOOK_URL}task.item.list/?ORDER[ID]=asc&FILTER[!STATUS]=5&", params=params)
        data = response.json()
        
        filtradas = [{"ID": item["ID"]} for item in data.get("result", [])]
        tasks_filtradas.extend(filtradas)
        next_page = data.get("next")

        print("Tarefas filtradas com STATUS != '5':", len(tasks_filtradas))
        if not next_page:
            break

    print("Iniciando busca por detalhes...")
    tasks_final = []

    def enrich_task(task):
        task_id = task["ID"]
        title, prazo, abertura, ultima_mov, responsavel, sistema, equipe, prioridade, criado_por, estagio = get_fields(int(task_id))
        responsavel_etapa = responsible_by_team(equipe, responsavel)
        return {
            "ID": task_id,
            "FOCO": prioridade,
            "CRIADOR": criado_por,
            "TASK": title,
            "ETAPA": estagio,
            "ETAPA EQUIPE": equipe, 
            "ETAPA RESPONSÁVEL": responsavel_etapa,
            "RESPONSÁVEL": responsavel,
            "SISTEMA": sistema,                       
            "CRIAÇÃO": abertura,
            "ÚLTIMA ATUALIZAÇÃO": ultima_mov,
            "PRAZO": prazo
        }

    with ThreadPoolExecutor(max_workers=30) as executor:
        futures = [executor.submit(enrich_task, task) for task in tasks_filtradas]
        for future in as_completed(futures):
            try:
                enriched_task = future.result()
                tasks_final.append(enriched_task)
            except Exception as e:
                print("Erro ao processar tarefa:", e)

    tasks_final.sort(key=lambda t: int(t["ID"]))

    print(f"\n {len(tasks_final)} tarefas armazenadas e ordenadas com sucesso!")

    return tasks_final
