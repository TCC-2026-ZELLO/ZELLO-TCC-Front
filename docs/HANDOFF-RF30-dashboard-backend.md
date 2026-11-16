# Handoff — RF30 Dashboards de faturamento (backend pronto → implementar no front)

> Documento escrito a partir da implementação do backend (`zello-tcc-back`, módulo
> `src/modules/dashboard/`, ainda **não commitado** na branch `develop` do back).
> Leia isto inteiro antes de alterar o front. Fonte da verdade dos tipos:
> `zello-tcc-back/src/modules/dashboard/dto/dashboard-response.dto.ts`.

## História

COMO Gestor, POSSO consultar os dashboards de faturamento do estabelecimento, PARA tomar
decisões financeiras e estratégicas.

| CA | O que mostrar | Campo da API |
|---|---|---|
| CA1 | Faturamento global + receita por tipo de serviço no período | `revenue.total`, `revenue.byService`, `revenue.timeline` |
| CA2 | Performance da equipe (qtd de atendimentos e receita por profissional) | `team` |
| CA3 | Funil: visualizações da página vs agendamentos (taxa de conversão) | `visibility` |
| CA4 | % de crescimento/queda vs período anterior | `revenue.variationPercent` (+ `previousTotal`, `period.previousFrom/To`) |
| CA5 | Perda de receita com no-shows e cancelamentos não justificados | `noShows` |

---

## 1. `GET /dashboard/businesses/:businessId?from=YYYY-MM-DD&to=YYYY-MM-DD`

- **Auth:** usuário logado com role `manager` **e** vinculado ao estabelecimento
  (mesmo mecanismo de autenticação JWT já usado pelas outras rotas do app).
- **Query:** `from` e `to` obrigatórios, formato `YYYY-MM-DD`, **ambos inclusivos**.
  `to >= from`, intervalo máximo de **366 dias**. Datas futuras são aceitas (aparecem com zero).
- **Período anterior (CA4)** é calculado pelo back: mesma duração, terminando no dia
  anterior a `from`. Ex.: `2026-10-01..2026-10-31` → anterior `2026-08-31..2026-09-30`.
  O front **não** precisa calcular isso — use `period.previousFrom/previousTo` para exibir.

### Resposta

O back usa o `SucessInterceptor`, então o payload vem dentro de `data`:

```json
{ "status": 200, "message": "Request successful", "data": { ...DashboardResponse } }
```

Tipos TypeScript para copiar no front:

```ts
export interface DashboardPeriod {
  from: string;          // 'YYYY-MM-DD'
  to: string;
  previousFrom: string;
  previousTo: string;
}

export interface RevenueByService {
  serviceId: string;
  serviceName: string;
  revenue: number;           // R$, 2 casas
  appointmentsCount: number; // atendimentos concluídos
  sharePercent: number;      // 0–100, participação na receita do período
}

export interface RevenueTimelinePoint {
  date: string;   // 'YYYY-MM-DD' — um ponto por dia do período, dias sem receita vêm com 0
  revenue: number;
}

export interface RevenueSummary {
  total: number;
  previousTotal: number;
  variationPercent: number | null; // null = período anterior sem receita
  completedCount: number;
  averageTicket: number;           // total / completedCount; 0 se não houve atendimento
  byService: RevenueByService[];   // ordenado por receita desc
  timeline: RevenueTimelinePoint[];
}

export interface TeamMemberPerformance {
  professionalId: string;
  name: string;
  appointmentsCount: number; // concluídos no período (pode ser 0)
  revenue: number;
}

export interface VisibilityFunnel {
  views: number;                 // visualizações da página no período
  appointments: number;          // agendamentos CRIADOS no período
  conversionRate: number | null; // appointments / views * 100; null se views = 0
}

export interface NoShowSummary {
  noShowCount: number;
  unjustifiedCancellationCount: number;
  lostRevenue: number;
  lostRevenuePercentOfPotential: number | null; // lost / (total + lost) * 100; null se ambos 0
}

export interface DashboardResponse {
  period: DashboardPeriod;
  revenue: RevenueSummary;
  team: TeamMemberPerformance[];   // ordenado por receita desc, depois nome
  visibility: VisibilityFunnel;
  noShows: NoShowSummary;
}
```

### Regras para a UI

- **Todos os valores monetários são `number` em reais** (já arredondados em 2 casas) —
  formatar com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- **Percentuais** já vêm multiplicados por 100 (ex.: `18.26` = 18,26%). Não multiplicar de novo.
- **`null` ≠ 0.** Tratar explicitamente:
  - `variationPercent === null` → exibir **"sem base de comparação"** (não "0%").
  - `conversionRate === null` → "sem visualizações no período".
  - `lostRevenuePercentOfPotential === null` → ocultar ou exibir "—".
- `variationPercent` pode ser negativo (queda) → seta/cor de queda; positivo → crescimento.
- `team` inclui profissionais **sem atendimento** (count 0) — devem aparecer na lista.
- `byService` pode vir vazio e `timeline` sempre tem um ponto por dia (bom para gráfico de linha/barras sem buracos).
- **Receita é "estimada"** — usar esse termo na UI (ver limitações abaixo).

### Erros

| Status | Quando | Mensagem (pt-BR, vinda do back) |
|---|---|---|
| 400 | `from`/`to` ausente ou inválido | `A data inicial (from) deve ser uma data válida no formato YYYY-MM-DD.` / `A data final (to) ...` |
| 400 | `to < from` | `A data final (to) deve ser maior ou igual à data inicial (from).` |
| 400 | intervalo > 366 dias | `O período selecionado deve ter no máximo 366 dias.` |
| 400 | `businessId` não é UUID | `O identificador do estabelecimento é inválido.` |
| 401 | não autenticado | — |
| 403 | não é gestor / gestor de outro negócio | `Você não tem permissão para acessar este recurso.` / `Perfil de gestor não encontrado.` / `Você não tem permissão para acessar o dashboard desta empresa.` |

Erros de validação seguem o formato padrão do NestJS (`message` pode ser **array** de strings).
Recomenda-se validar `to >= from` e o limite de 366 dias também no seletor de datas do front.

---

## 2. `POST /businesses/:id/views` — tracking de visualizações (necessário para o CA3)

**Sem esta chamada, `visibility.views` fica sempre 0.** O front precisa chamá-la.

- **Auth:** qualquer usuário logado (JWT). Usuário anônimo não é contabilizado
  (não chamar, ou ignorar o 401).
- **Quando chamar:** ao abrir a **página pública do estabelecimento** (perfil visto pelo cliente),
  uma vez por montagem da página. Fire-and-forget — não bloquear a renderização nem mostrar erro ao usuário.
- **Body:** nenhum. **Resposta:** `204 No Content`.
- É **idempotente**: o back conta no máximo 1 visualização por usuário/estabelecimento/dia,
  então chamadas repetidas são seguras. Visita do próprio gestor do estabelecimento é ignorada pelo back.
- Erros: `400` (id não é UUID), `401`, `404` (`Estabelecimento não encontrado.`).

---

## 3. Semântica dos números (para textos de ajuda/tooltips)

- **Receita estimada:** soma do preço dos agendamentos **concluídos (COMPLETED)** cuja data de
  atendimento está no período. Agendamentos de combo usam o preço com o desconto do combo rateado.
- **Funil:** `appointments` conta agendamentos **criados** no período (pela data de criação,
  qualquer status), exceto pendentes que expiraram sem confirmação.
- **No-shows:** status NO_SHOW (marcado pelo gestor ou automaticamente pelo sistema) +
  cancelamentos não justificados (feitos pelo cliente, ou pelo gestor com penalidade).
  Cancelamentos justificados pelo gestor **não** entram.

## 4. Limitações conhecidas (registradas no TCC — não corrigir no front)

1. Não há snapshot de preço no agendamento: se o preço de um serviço mudar, o histórico muda junto.
2. Agendamento confirmado que o gestor não marca como concluído vira NO_SHOW automático
   60 min após o fim — pode inflar a "perda". Vale um texto de ajuda sugerindo ao gestor
   concluir os atendimentos.

## 5. Status do backend

- Build e testes unitários passando; **queries ainda não validadas contra o banco real** —
  se algum número vier estranho na integração, reportar para ajuste no back.
- Nenhum endpoint existente foi alterado.

## Checklist sugerido para o front

- [ ] Service/API dedicado (`getBusinessDashboard(businessId, from, to)`, `registerBusinessView(id)`) com os tipos acima — sem `any`
- [ ] Tela de dashboard do gestor com seletor de período (default sugerido: mês atual)
- [ ] Cards: receita total, variação vs anterior, atendimentos, ticket médio
- [ ] Gráfico da `timeline` + tabela/gráfico de `byService` (CA1)
- [ ] Tabela da equipe (CA2)
- [ ] Bloco do funil com taxa de conversão (CA3)
- [ ] Bloco de no-shows / perda estimada (CA5)
- [ ] Tratamento de `null`, loading, erro 400/403
- [ ] Chamada de `POST /businesses/:id/views` na página pública do estabelecimento
