// Etapa 2 · A guarda. Ela confere a proposta da IA sem ler a nota do cliente.
import { test } from "node:test";
import assert from "node:assert/strict";
import { guarda } from "../src/travas.js";

test("Etapa 2 · 1907, proposta certa de R$ 150: nenhum problema", () => {
  assert.deepEqual(guarda({ pedidoId: 1907, valor: 150 }), []);
});
test("Etapa 2 · 1907, a IA caiu na nota e propôs R$ 1.800: barra", () => {
  const problemas = guarda({ pedidoId: 1907, valor: 1800 });
  assert.ok(problemas.includes("valor_acima_do_pedido"), "faltou valor_acima_do_pedido");
  assert.ok(problemas.includes("acima_do_limite"), "faltou acima_do_limite");
});
test("Etapa 2 · pedido que não existe: barra", () => {
  assert.ok(guarda({ pedidoId: 9999, valor: 100 }).includes("pedido_inexistente"));
});
test("Etapa 2 · valor zero ou negativo: barra", () => {
  assert.ok(guarda({ pedidoId: 1842, valor: 0 }).includes("valor_invalido"), "zero passou");
  assert.ok(guarda({ pedidoId: 1842, valor: -50 }).includes("valor_invalido"), "negativo passou");
});
test("Etapa 2 · valor que não é número: barra", () => {
  assert.ok(guarda({ pedidoId: 1842, valor: NaN }).includes("valor_invalido"), "NaN passou");
  assert.ok(guarda({ pedidoId: 1842, valor: "180" }).includes("valor_invalido"), "texto passou");
});
