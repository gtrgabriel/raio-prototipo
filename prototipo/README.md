# Protótipo — agente de compras (raio)

Protótipo navegável com dados fictícios do **recorte aprovado no PRD v0.5** (18–25/11/2026), construído com o design system em `../raio-ds`.

## Como rodar

```bash
python3 prototipo/build.py
```

Abra `prototipo/dist/index.html` no navegador. O estado fica no `localStorage`; para voltar aos dados de exemplo, use **Ajustes → Restaurar dados de exemplo**.

- `src/data.js`: dados fictícios (empresa, pessoas, itens, lojas, planos)
- `src/app.js`: regras, estado e telas
- `src/app.css`: layout das telas, montado sobre `raio-ds/tokens.css` e `raio-ds/components.css`
- `src/lp.js` e `src/lp.css`: landing page (abre sem hash ou em `#home`)
- `src/motion.css`: motion design da plataforma (os ganchos de animação ficam em `app.js`)
- `build.py`: gera uma página única com CSS, JS e logos embutidos (`dist/index.html` e `dist/artifact.html`)

## Landing page

Narrativa em sete atos: **hero** ("Pare de pagar a mais sem perceber", com demo animada do aviso) → **o problema** (o dinheiro escorre, com faixa de exemplos) → **como funciona** (4 passos) → **regra do 1%** (calculadora interativa) → **para quem** (comprador e gestor) → **planos** → **CTA final**. Todos os números vêm dos dados fictícios do protótipo.

## Motion design

| Onde | O que acontece |
|---|---|
| Troca de tela | Blocos sobem em cascata; números contam até o valor; barras e medidores crescem |
| Menu | Indicador desliza até o item ativo (vertical no desktop, horizontal no celular) |
| Rodar comparação | Barra de varredura com contador de itens, brilho sobre a lista, avisos novos chegam com halo lime |
| Desbloquear | Saldo de tokens pulsa e conta para baixo, brilho atravessa o card, link é revelado da esquerda para a direita |
| Registrar compra / Ignorar | Card sai da lista; "+R$" flutua com a economia; toast lime de ganho |
| Modal e toast | Entrada com mola e saída curta |
| Landing | Entrada do hero, demo em ciclo, reveals guiados pela rolagem, faixa em movimento, contador do gestor |

Com `prefers-reduced-motion`, tudo aparece no estado final, sem animação.

## O que cobre (RFs do PRD)

| Tela | O que mostra | RFs |
|---|---|---|
| Itens | Cadastro manual do item e do último preço pago; NF em PDF e ERP aparecem como "em breve" | RF-05, RF-19 (parcial) |
| Avisos | Comparação simplificada com 3 lojas por item; aviso só com **redução acima de 1%** contra o último preço pago; desbloqueio do link por **100 tokens**; registro da compra | RF-07, RF-11, RF-12, RF-13, RF-09 |
| WhatsApp | Prévia das mensagens enviadas **ao comprador** (envio simulado) | RF-08 |
| Painel do gestor | Economia realizada e em aberto, % de compras na melhor condição, tokens usados, auditoria | RF-10, RF-20, RF-09 |
| Plano e tokens | Básico R$ 200 / 500 tokens; Prata, Gold e pacote extra marcados como proposta | RF-24 (parcial) |
| Ajustes | Prioridade preço × prazo; número do WhatsApp | RF-23 |
| Início | Visão do comprador com indicador mínimo de desempenho (marcado como proposta) | RF-25 (mínimo) |

## Regras implementadas

- **Aviso (prioridade preço):** melhor preço entre as ofertas; avisa se `(último preço − oferta) / último preço > 1%`.
- **Aviso (prioridade prazo):** entre as ofertas que não custam mais que o último preço, escolhe a de menor prazo; avisa se ela entrega mais rápido que a última compra ou se a redução passa de 1%.
- **Desbloqueio:** −100 tokens; só então a loja e o link aparecem. O agente não compra: o comprador registra a compra depois.
- **Economia:** `(último preço pago antes − preço pago) × quantidade`, somada nas compras registradas.
- **Melhor condição:** a compra conta como "na melhor condição" se o preço pago ficou até 1% acima da melhor oferta do momento.
- **Desempenho (proposta):** `dados trazidos × 10 + economia realizada ÷ 10`.
- **Rodar comparação:** cada rodada varia os preços em até ±0,8%, então novos avisos podem surgir.
