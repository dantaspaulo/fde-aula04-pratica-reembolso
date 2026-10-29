// Etapa 4 · Repetir sem pagar duas vezes. A rede caiu depois de gravar: pergunte antes de repetir.
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { jaFoiPago, pagarComSeguranca } from "../src/travas.js";
import { gravarReembolso, impressaoDigital, simularQuedaDeRede, todosOsReembolsos, zerar } from "../src/loja.js";

const agora = new Date("2026-10-22T15:00:00Z");
const proposta = { pedidoId: 1842, valor: 180 };
const aprovacao = { impressao: impressaoDigital(proposta), aprovadaEm: new Date(agora.getTime() - 5 * 60_000).toISOString() };
const pagamentosDo1842 = () => todosOsReembolsos().filter((r) => r.pedidoId === 1842).length;
beforeEach(zerar);

test("Etapa 4 · reconhece o pagamento que já foi gravado, e só ele", () => {
  gravarReembolso({ pedidoId: 1842, valor: 180, chave: impressaoDigital(proposta) });
  assert.equal(jaFoiPago(proposta), true);
  assert.equal(jaFoiPago({ pedidoId: 1907, valor: 150 }), false);
});
test("Etapa 4 · a rede caiu depois de gravar: não paga duas vezes", () => {
  simularQuedaDeRede();
  const r = pagarComSeguranca(proposta, aprovacao, agora);
  assert.equal(r.pago, true);
  assert.equal(pagamentosDo1842(), 1, "pagou mais de uma vez");
});
test("Etapa 4 · clique duplo no botão de pagar: um pagamento só", () => {
  pagarComSeguranca(proposta, aprovacao, agora);
  pagarComSeguranca(proposta, aprovacao, agora);
  assert.equal(pagamentosDo1842(), 1, "pagou mais de uma vez");
});
