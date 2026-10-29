// Etapa 3 · A pessoa aprova a ação exata. Mudou o valor, a aprovação não vale. E ela vence em 15 minutos.
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { pagar } from "../src/travas.js";
import { impressaoDigital, todosOsReembolsos, zerar } from "../src/loja.js";

const agora = new Date("2026-10-22T15:00:00Z");
const aprovar = (proposta, minutosAtras = 5) => ({
  impressao: impressaoDigital(proposta),
  aprovadaEm: new Date(agora.getTime() - minutosAtras * 60_000).toISOString(),
});
beforeEach(zerar);

test("Etapa 3 · sem aprovação: não paga", () => {
  const r = pagar({ pedidoId: 1842, valor: 180 }, null, agora);
  assert.equal(r.pago, false);
  assert.equal(r.motivo, "sem_aprovacao");
});
test("Etapa 3 · aprovaram R$ 120 e alguém trocou para R$ 180: não paga", () => {
  const r = pagar({ pedidoId: 1842, valor: 180 }, aprovar({ pedidoId: 1842, valor: 120 }), agora);
  assert.equal(r.pago, false);
  assert.equal(r.motivo, "aprovacao_nao_confere");
});
test("Etapa 3 · aprovação de 20 minutos atrás: venceu, não paga", () => {
  const proposta = { pedidoId: 1842, valor: 180 };
  const r = pagar(proposta, aprovar(proposta, 20), agora);
  assert.equal(r.pago, false);
  assert.equal(r.motivo, "aprovacao_vencida");
});
test("Etapa 3 · aprovação certa e recente: paga e grava", () => {
  const proposta = { pedidoId: 1842, valor: 180 };
  const r = pagar(proposta, aprovar(proposta), agora);
  assert.equal(r.pago, true);
  assert.equal(todosOsReembolsos().filter((x) => x.pedidoId === 1842).length, 1);
});
test("Etapa 3 · R$ 1.800 no 1907, mesmo com aprovação: a guarda barra", () => {
  const proposta = { pedidoId: 1907, valor: 1800 };
  const r = pagar(proposta, aprovar(proposta), agora);
  assert.equal(r.pago, false);
  assert.equal(r.motivo, "barrado_pela_guarda");
});
