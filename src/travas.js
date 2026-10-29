// As travas do sistema de reembolso. É AQUI que você (ou o seu agente de código) trabalha.
// Cada etapa tem uma função em branco e um arquivo de teste em test/. Faça na ordem.
import {
  buscarPedido,
  buscarReembolsoPorChave,
  diasDesdeEntrega,
  gravarReembolso,
  impressaoDigital,
  politica,
  reembolsosDoPedido,
} from "./loja.js";

// Etapa 1 · A regra é do código (terça, slide 25)
// Recebe o número do pedido e o valor que o cliente pediu (ou null, se ele não disse quanto).
// Devolve a decisão da política (politica.md):
//   { tipo: "propor", valor }
//   { tipo: "negar", motivo }   motivo: "pedido_nao_encontrado", "cancelado", "duplicidade" ou "fora_do_prazo"
//   { tipo: "encaminhar", motivo: "acima_do_limite" }
export function decidir(pedidoId, valorPedido) {
  const pedido = buscarPedido(pedidoId);
  if (!pedido) return { tipo: "negar", motivo: "pedido_nao_encontrado" };
  if (pedido.status === "cancelado") return { tipo: "negar", motivo: "cancelado" };
  if (reembolsosDoPedido(pedidoId).length > 0) return { tipo: "negar", motivo: "duplicidade" };
  if (diasDesdeEntrega(pedido) > politica.prazoDias) return { tipo: "negar", motivo: "fora_do_prazo" };
  const valor = Math.min(valorPedido ?? pedido.valor, pedido.valor);
  if (valor > politica.limiteAprovacaoHumana) return { tipo: "encaminhar", motivo: "acima_do_limite" };
  return { tipo: "propor", valor };
}

// Etapa 2 · A guarda (terça, slide 26)
// Recebe a proposta que a IA montou ({ pedidoId, valor }) e devolve a lista de problemas.
// Lista vazia quer dizer que pode seguir. Problemas possíveis:
//   "pedido_inexistente", "valor_invalido", "valor_acima_do_pedido", "acima_do_limite"
export function guarda(proposta) {
  const problemas = [];
  const pedido = buscarPedido(proposta.pedidoId);
  if (!pedido) problemas.push("pedido_inexistente");
  if (typeof proposta.valor !== "number" || !(proposta.valor > 0)) problemas.push("valor_invalido");
  if (pedido && proposta.valor > pedido.valor) problemas.push("valor_acima_do_pedido");
  if (proposta.valor > politica.limiteAprovacaoHumana) problemas.push("acima_do_limite");
  return problemas;
}

// Etapa 3 · A pessoa aprova a ação exata (terça, slide 27)
// Paga só se a guarda não achar problema E existir uma aprovação desta proposta exata, feita há no máximo
// 15 minutos. A aprovação é { impressao, aprovadaEm }; compare com impressaoDigital(proposta).
// Devolve { pago: true, reembolso } ou { pago: false, motivo }.
//   motivo: "barrado_pela_guarda", "sem_aprovacao", "aprovacao_nao_confere" ou "aprovacao_vencida"
// Para gravar, use gravarReembolso({ pedidoId, valor, chave: impressaoDigital(proposta) }).
export function pagar(proposta, aprovacao, agora = new Date()) {
  const problemas = guarda(proposta);
  if (problemas.length > 0) return { pago: false, motivo: "barrado_pela_guarda", problemas };
  if (!aprovacao) return { pago: false, motivo: "sem_aprovacao" };
  const impressao = impressaoDigital(proposta);
  if (aprovacao.impressao !== impressao) return { pago: false, motivo: "aprovacao_nao_confere" };
  if (agora - new Date(aprovacao.aprovadaEm) > 15 * 60_000) return { pago: false, motivo: "aprovacao_vencida" };
  const reembolso = gravarReembolso({ pedidoId: proposta.pedidoId, valor: proposta.valor, chave: impressao });
  return { pago: true, reembolso };
}

// Etapa 4 · Repetir sem pagar duas vezes (terça, slide 27)
// A rede pode cair depois de gravar. Antes de tentar de novo, pergunte ao sistema se este pagamento já existe,
// procurando pela chave dele (a impressão digital da proposta). Devolve true se já foi pago.
export function jaFoiPago(proposta) {
  return buscarReembolsoPorChave(impressaoDigital(proposta)) !== null;
}

// Pronto, não precisa mexer: usa as suas travas para pagar com segurança, mesmo se a rede cair.
export function pagarComSeguranca(proposta, aprovacao, agora = new Date()) {
  if (jaFoiPago(proposta)) return { pago: true, jaEstavaPago: true };
  try {
    return pagar(proposta, aprovacao, agora);
  } catch {
    // A rede caiu depois de pedir para gravar: não sei se pagou. Pergunto antes de repetir.
    if (jaFoiPago(proposta)) return { pago: true, confirmadoDepoisDaQueda: true };
    return pagar(proposta, aprovacao, agora);
  }
}
