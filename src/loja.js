// O sistema da loja: pedidos, reembolsos já feitos e o gravador de pagamentos.
// Está pronto. Não edite este arquivo: as travas ficam em src/travas.js.
import { createHash } from "node:crypto";
import { HOJE, POLITICA, pedidos, reembolsosIniciais } from "./dados.js";

export const politica = POLITICA;

let reembolsos = [];
let quedaDeRede = false;

export function zerar() {
  reembolsos = reembolsosIniciais.map((r) => ({ ...r }));
  quedaDeRede = false;
}
zerar();

export function buscarPedido(pedidoId) {
  return pedidos.find((p) => p.id === pedidoId) ?? null;
}

export function reembolsosDoPedido(pedidoId) {
  return reembolsos.filter((r) => r.pedidoId === pedidoId);
}

export function buscarReembolsoPorChave(chave) {
  return reembolsos.find((r) => r.chave === chave) ?? null;
}

export function diasDesdeEntrega(pedido) {
  if (!pedido.entregueEm) return null;
  return Math.round((Date.parse(HOJE) - Date.parse(pedido.entregueEm)) / 86_400_000);
}

// A impressão digital de uma proposta. Muda se o pedido, o valor ou a versão da política mudarem.
export function impressaoDigital(proposta) {
  return createHash("sha256").update(`${proposta.pedidoId}|${proposta.valor}|${POLITICA.versao}`).digest("hex");
}

// Grava o pagamento. Depois de simularQuedaDeRede(), grava e falha em seguida: a resposta "não volta".
export function gravarReembolso({ pedidoId, valor, chave }) {
  const reembolso = { pedidoId, valor, chave };
  reembolsos.push(reembolso);
  if (quedaDeRede) {
    quedaDeRede = false;
    throw new Error("timeout: a rede caiu depois de gravar");
  }
  return reembolso;
}

export function simularQuedaDeRede() {
  quedaDeRede = true;
}

export function todosOsReembolsos() {
  return reembolsos.map((r) => ({ ...r }));
}
