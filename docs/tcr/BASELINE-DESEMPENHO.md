# Baseline de desempenho — 26/11/2026

Evidência do ROADMAP.md, não planejamento concorrente. Base cbd83f7, Brave/Chromium headless no ZORD, Node 24.22.3, Playwright Core externo ao projeto. HTTP interceptado, fontes e serviços externos bloqueados, login simulado, dados fictícios. Uma passagem por viewport, sem throttling; resultados não são tempos de consulta, INP, LCP de campo ou validação em aparelhos reais.

## DOM simulado

| Módulo | Mediana ms | P95 ms |
|---|---:|---:|
| geral | 11,07 | 14,91 |
| renovação | 13,75 | 16,71 |
| pré-natal | 21,87 | 28,04 |
| puericultura | 37,81 | 44,53 |
| TO | 19,94 | 24,10 |

measure.cjs corrigido: aguarda a conclusão das microtarefas de cópia antes de fechar o DOM; saída 0.

## Navegador

### 1440 × 900

Login: 674111 bytes brutos; 195001 bytes gzip estimados. Gzip calculado por recurso, não transferência medida. 4 tarefas longas no documento principal, CLS observado 0; zero erros de página. LCP observado durante navegação programática não é comparável ao LCP de campo.

| Rota | Pronta (ms) | Bytes novos | Gzip estimado | Heap (bytes) | Layouts | Tarefa (ms) |
|---|---:|---:|---:|---:|---:|---:|
| home | 365 | 0 | 0 | 3414392 | 1 | 1117 |
| general | 159 | 0 | 0 | 3543444 | 11 | 112 |
| renewal | 64 | 0 | 0 | 3817172 | 11 | 62 |
| child | 96 | 0 | 0 | 4445188 | 10 | 104 |
| cervical | 61 | 0 | 0 | 4617756 | 12 | 50 |
| occupational | 235 | 923594 | 480906 | 6746376 | 7 | 188 |
| has | 590 | 0 | 0 | 5617148 | 9 | 63 |
| dm | 65 | 0 | 0 | 5778524 | 13 | 52 |
| both | 46 | 0 | 0 | 5950116 | 15 | 52 |
| prenatal | 41 | 0 | 0 | 6182168 | 15 | 48 |
| implante | 71 | 0 | 0 | 6514804 | 14 | 65 |
| diu | 69 | 0 | 0 | 6882128 | 13 | 64 |
| lab | 102 | 0 | 0 | 7587868 | 9 | 93 |
| rx | 239 | 485803 | 221683 | 9352604 | 8 | 186 |
| controlados | 497 | 147099 | 29514 | 8746568 | 8 | 223 |
| history | 76 | 0 | 0 | 8851364 | 1 | 21 |

Cobertura acumulada (caracteres de código, não bytes de rede):

| Ativo | Tipo | Observados | Total |
|---|---|---:|---:|
| /care.js | js | 5433 | 11531 |
| /workflow.js | js | 18817 | 47866 |
| /notes.js | js | 9039 | 15224 |
| /prenatal.js | js | 17724 | 30678 |
| /implante.js | js | 22622 | 27025 |
| /diu.js | js | 18818 | 24969 |
| /lab-details.js | js | 4265 | 6840 |
| /shortcuts.js | js | 2307 | 2314 |
| /renewal.js | js | 8849 | 17979 |
| /supabase.min.js | js | 24925 | 217949 |
| /auth.js | js | 3595 | 9382 |
| /growth-data.js | js | 32469 | 32469 |
| /growth.js | js | 7030 | 12346 |
| /occupational-portal.js | js | 3204 | 4544 |
| /app.js | js | 61277 | 102315 |
| /enhancements.js | js | 16048 | 21255 |
| /ot-embedded/projeto-to-embedded.js | js | 627962 | 922895 |
| /receituario.html | js | 10794 | 12577 |
| /html2canvas.min.js | js | 97090 | 197801 |
| /rx-workflow.js | js | 3437 | 13738 |
| /controlados.js | js | 11325 | 13021 |
| /design.css | css | 7832 | 18261 |
| /theme.css | css | 701 | 1071 |
| / | css | 0 | 0 |
| /dashboard-cards.css | css | 6358 | 10423 |
| /style.css | css | 23267 | 53521 |
| /receituario.html | css | 1057 | 1072 |
| /theme.css | css | 547 | 1071 |
| /rx-workflow.css | css | 1670 | 3200 |
| /receituario.html | css | 0 | 1004 |
| /receituario.html | css | 5117 | 6783 |
| /controlados.css | css | 0 | 10053 |
| /controlados.html | css | 0 | 0 |

### 390 × 844

Login: 674111 bytes brutos; 195001 bytes gzip estimados. Gzip calculado por recurso, não transferência medida. 6 tarefas longas no documento principal, CLS observado 0; zero erros de página. LCP observado durante navegação programática não é comparável ao LCP de campo.

| Rota | Pronta (ms) | Bytes novos | Gzip estimado | Heap (bytes) | Layouts | Tarefa (ms) |
|---|---:|---:|---:|---:|---:|---:|
| home | 63 | 0 | 0 | 3342040 | 1 | 104 |
| general | 136 | 0 | 0 | 3756976 | 7 | 126 |
| renewal | 76 | 0 | 0 | 3635952 | 10 | 71 |
| child | 132 | 0 | 0 | 4281408 | 8 | 133 |
| cervical | 62 | 0 | 0 | 4453324 | 10 | 53 |
| occupational | 233 | 923594 | 480906 | 6583576 | 10 | 216 |
| has | 83 | 0 | 0 | 6831116 | 12 | 79 |
| dm | 50 | 0 | 0 | 7013544 | 13 | 56 |
| both | 47 | 0 | 0 | 5726880 | 12 | 52 |
| prenatal | 63 | 0 | 0 | 5958948 | 12 | 62 |
| implante | 78 | 0 | 0 | 6318352 | 9 | 77 |
| diu | 75 | 0 | 0 | 6655120 | 10 | 71 |
| lab | 140 | 0 | 0 | 7360412 | 8 | 141 |
| rx | 241 | 485803 | 221683 | 9172336 | 8 | 186 |
| controlados | 273 | 147099 | 29514 | 8768228 | 9 | 281 |
| history | 32 | 0 | 0 | 8800176 | 1 | 16 |

Cobertura acumulada (caracteres de código, não bytes de rede):

| Ativo | Tipo | Observados | Total |
|---|---|---:|---:|
| /care.js | js | 5433 | 11531 |
| /workflow.js | js | 18817 | 47866 |
| /notes.js | js | 9039 | 15224 |
| /prenatal.js | js | 17724 | 30678 |
| /implante.js | js | 22622 | 27025 |
| /diu.js | js | 18818 | 24969 |
| /lab-details.js | js | 4265 | 6840 |
| /shortcuts.js | js | 2307 | 2314 |
| /renewal.js | js | 8849 | 17979 |
| /supabase.min.js | js | 24925 | 217949 |
| /auth.js | js | 3595 | 9382 |
| /growth-data.js | js | 32469 | 32469 |
| /growth.js | js | 7030 | 12346 |
| /occupational-portal.js | js | 3204 | 4544 |
| /app.js | js | 61277 | 102315 |
| /enhancements.js | js | 16048 | 21255 |
| /ot-embedded/projeto-to-embedded.js | js | 627962 | 922895 |
| /receituario.html | js | 10794 | 12577 |
| /html2canvas.min.js | js | 97090 | 197801 |
| /rx-workflow.js | js | 3437 | 13738 |
| /controlados.js | js | 11325 | 13021 |
| /design.css | css | 10627 | 18261 |
| /dashboard-cards.css | css | 7506 | 10423 |
| / | css | 0 | 0 |
| /theme.css | css | 701 | 1071 |
| /style.css | css | 29654 | 53521 |
| /receituario.html | css | 904 | 1004 |
| /theme.css | css | 547 | 1071 |
| /rx-workflow.css | css | 1864 | 3200 |
| /receituario.html | css | 1030 | 1072 |
| /receituario.html | css | 4498 | 6783 |
| /controlados.html | css | 0 | 0 |
| /controlados.css | css | 0 | 10053 |

## Limites

Não interpretar código não observado como removível. Cobertura acumulada da navegação, não cobertura funcional por rota; CSS de iframes pode estar incompleto. Heap e layouts são amostras CDP, sem coleta forçada de lixo, não provam vazamentos. A medição não inclui digitação real, teclado virtual, leitores de tela, impressão física, rede de produção ou aparelhos reais. Repetir com ambiente controlado e interações reais antes de comparar melhorias.
