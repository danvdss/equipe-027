# -*- coding: utf-8 -*-
"""Gera índice nominal reproduzível da RDC 1.036/2026 (AnvisaLegis)."""
import json, re
from pathlib import Path
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
URL = ("https://anvisalegis-empresa.datalegis.net/action/ActionDatalegis.php?"
       "acao=abrirTextoAto&cod_menu=8542&cod_modulo=310&link=S&"
       "numeroAto=00001036&orgao=RDC%2FDC%2FANVISA%2FMS&"
       "seqAto=000&tipo=RDC&valorAno=2026")
LABELS = ("A1","A2","A3","B1","B2","C1","C2","C3","C5","D1","D2","E","F1","F2","F3","F4")
EXPECTED = dict(zip(LABELS,(94,13,14,95,8,213,5,3,31,35,13,9,56,186,1,7)))
GROUP = re.compile(r"^LISTA\s*-?\s*(A1|A2|A3|B1|B2|C1|C2|C3|C5|D1|D2|E)\s*$|^LISTA\s+(F[1-4])\s*-",re.I)
NUMBER = re.compile(r"^(\d+)\.\s*(.*)$")
r = requests.get(URL,timeout=40)
r.raise_for_status()
r.encoding = "iso-8859-1"
soup = BeautifulSoup(r.text,"lxml")
lines=[x.strip() for x in soup.get_text("\n").splitlines() if x.strip()]
rows=[]
adendos={k:[] for k in LABELS}
section=None
inside_adendo=False
pending_number=None
for line in lines:
    m=GROUP.match(line)
    if m:
        section=(m.group(1) or m.group(2)).upper()
        inside_adendo=False
        pending_number=None
        continue
    if not section:
        continue
    if line=="ADENDO:":
        inside_adendo=True
        continue
    if section in ("F1","F2"):
        if inside_adendo:
            adendos[section].append(line)
        continue
    if inside_adendo:
        adendos[section].append(line)
        continue
    m=NUMBER.match(line)
    if m:
        idx,name=int(m.group(1)),m.group(2).strip()
        if not name:
            pending_number=idx
            continue
        if idx<=EXPECTED[section] and not name.startswith(")"):
            rows.append({"n":name,"l":section,"i":idx})
    elif pending_number is not None:
        rows.append({"n":line,"l":section,"i":pending_number})
        pending_number=None

tables=soup.find_all("table")
if len(tables)<2:
    raise ValueError("Fonte sem as tabelas F1 e F2")
for section,table in zip(("F1","F2"),tables[:2]):
    for tr in table.find_all("tr"):
        cells=[td.get_text(" ",strip=True) for td in tr.find_all("td")]
        if len(cells)<2 or not re.fullmatch(r"\d+\.",cells[0]):
            continue
        idx=int(cells[0][:-1])
        name=cells[1].strip()
        synonym=cells[3].strip() if len(cells)>=4 else ""
        if name:
            rows.append({"n":name,"l":section,"i":idx,**({"s":synonym} if synonym else {})})

rows.sort(key=lambda x:(LABELS.index(x["l"]),x["i"]))
counts={k:sum(row["l"]==k for row in rows) for k in LABELS}
if counts!=EXPECTED:
    raise ValueError("Contagens divergentes; revisar fonte: "+str(counts))
data={
    "norma":"RDC Anvisa nº 1.036, de 9 de julho de 2026",
    "publicacao":"13/07/2026",
    "base":"Anexo I da Portaria SVS/MS nº 344/1998, atualizado pela RDC nº 1.036/2026",
    "fonte":URL,
    "paginaAnvisa":"https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/controlados/lista-substancias",
    "total":len(rows),
    "contagens":counts,
    "registros":rows,
    "adendos":{k:" ".join(adendos[k]) for k in LABELS},
    "limite":"Índice dos itens nominalmente listados; não abrange automaticamente sais, isômeros, classes estruturais, adendos e exceções por formulação."
}
path=ROOT/"controlados-dados.json"
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("RDC: "+str(len(rows))+" registros, "+str(counts))
