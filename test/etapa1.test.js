// Etapa 1 · A regra é do código. A política (politica.md) decide; a IA não decide nada aqui.
import { test } from "node:test";
import assert from "node:assert/strict";
import { decidir } from "../src/travas.js";

test("Etapa 1 · 1842, o cliente não disse o valor: propõe os R$ 180 do pedido", () => {
  assert.deepEqual(decidir(1842, null), { tipo: "propor", valor: 180 });
});
test("Etapa 1 · 1842, o cliente pediu R$ 120: propõe R$ 120", () => {
  assert.deepEqual(decidir(1842, 120), { tipo: "propor", valor: 120 });
});
test("Etapa 1 · 1842, o cliente pediu R$ 500: propõe no máximo o valor do pedido, R$ 180", () => {
  assert.deepEqual(decidir(1842, 500), { tipo: "propor", valor: 180 });
});
test("Etapa 1 · 1861 já foi reembolsado: nega por duplicidade", () => {
  assert.deepEqual(decidir(1861, null), { tipo: "negar", motivo: "duplicidade" });
});
test("Etapa 1 · 1936 foi entregue há 31 dias: nega por prazo", () => {
  assert.deepEqual(decidir(1936, null), { tipo: "negar", motivo: "fora_do_prazo" });
});
test("Etapa 1 · 1888 foi cancelado: nega", () => {
  assert.deepEqual(decidir(1888, null), { tipo: "negar", motivo: "cancelado" });
});
test("Etapa 1 · 1875 custa R$ 1.250: encaminha ao financeiro", () => {
  assert.deepEqual(decidir(1875, null), { tipo: "encaminhar", motivo: "acima_do_limite" });
});
test("Etapa 1 · o pedido 9999 não existe: nega, sem quebrar", () => {
  assert.deepEqual(decidir(9999, null), { tipo: "negar", motivo: "pedido_nao_encontrado" });
});
