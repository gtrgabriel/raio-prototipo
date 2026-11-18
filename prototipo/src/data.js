/* Dados fictícios do protótipo. Nenhuma loja, preço, CNPJ ou telefone é real. */
const DATA = {
  company: { name: "Metalúrgica Exemplo Ltda", cnpj: "00.000.000/0001-00", employees: 42 },
  people: {
    comprador: { name: "Ana Souza", initials: "AS", role: "Compradora", phone: "+55 11 90000-0000" },
    gestor: { name: "Carlos Lima", initials: "CL", role: "Gestor de compras" },
  },
  plans: [
    { id: "basico", name: "Básico", price: 200, tokens: 500, status: "dito" },
    { id: "prata", name: "Prata", price: 400, tokens: 1200, status: "proposta" },
    { id: "gold", name: "Gold", price: 800, tokens: 3000, status: "proposta" },
  ],
  extraPack: { price: 40, tokens: 100 },
  unlockCost: 100,
  threshold: 0.01,
  cycle: { start: "2026-11-01", end: "2026-11-30" },
  categories: ["Escritório", "Copa", "EPI", "Insumos de fabricação", "Manutenção"],
  stores: {
    prime: "Papelaria Prime",
    central: "Atacado Central",
    mega: "MegaSuprimentos",
    norte: "Distribuidora Norte",
    sul: "Loja Industrial Sul",
  },
  // ref = preço de referência das ofertas; last = último preço pago hoje
  items: [
    { id: "papel", name: "Papel sulfite A4 75g", unit: "caixa c/ 10 resmas", cat: "Escritório", qty: 4, ref: 289.9, last: 289.9, lastDate: "2026-10-28", lastDays: 5, supplier: "Papelaria do bairro",
      offers: [["prime", 0.91, 3], ["central", 0.97, 6], ["mega", 1.02, 2]] },
    { id: "toner", name: "Toner compatível laser mono", unit: "unidade", cat: "Escritório", qty: 3, ref: 189.0, last: 189.0, lastDate: "2026-10-30", lastDays: 4, supplier: "MegaSuprimentos",
      offers: [["mega", 0.995, 4], ["prime", 1.04, 2], ["central", 1.08, 5]] },
    { id: "cafe", name: "Café torrado e moído", unit: "pacote 500 g", cat: "Copa", qty: 20, ref: 24.9, last: 24.9, lastDate: "2026-11-04", lastDays: 3, supplier: "Mercado local",
      offers: [["central", 0.88, 2], ["mega", 0.95, 4], ["prime", 1.05, 1]] },
    { id: "luva", name: "Luva nitrílica", unit: "caixa c/ 100", cat: "EPI", qty: 10, ref: 42.5, last: 38.9, lastDate: "2026-11-10", lastDays: 4, supplier: "Loja Industrial Sul",
      offers: [["sul", 0.915, 4], ["norte", 0.96, 6], ["mega", 1.0, 3]] },
    { id: "disco", name: "Disco de corte 7\" para aço", unit: "unidade", cat: "Insumos de fabricação", qty: 120, ref: 9.4, last: 8.9, lastDate: "2026-11-06", lastDays: 3, supplier: "Distribuidora Norte",
      offers: [["norte", 0.9, 7], ["sul", 0.95, 2], ["central", 1.0, 4]] },
    { id: "eletrodo", name: "Eletrodo revestido 2,5 mm", unit: "kg", cat: "Insumos de fabricação", qty: 50, ref: 31.4, last: 31.4, lastDate: "2026-10-22", lastDays: 6, supplier: "Distribuidora Norte",
      offers: [["norte", 0.97, 5], ["sul", 0.99, 1], ["central", 1.03, 4]] },
    { id: "oleo", name: "Óleo de corte solúvel", unit: "balde 20 L", cat: "Insumos de fabricação", qty: 2, ref: 389.0, last: 389.0, lastDate: "2026-10-15", lastDays: 4, supplier: "Loja Industrial Sul",
      offers: [["norte", 1.0, 3], ["sul", 1.02, 2], ["central", 1.06, 5]] },
    { id: "fita", name: "Fita isolante 19 mm × 20 m", unit: "rolo", cat: "Manutenção", qty: 30, ref: 7.8, last: 7.2, lastDate: "2026-11-12", lastDays: 3, supplier: "MegaSuprimentos",
      offers: [["mega", 0.885, 3], ["sul", 0.95, 2], ["central", 1.01, 5]] },
  ],
  // Compras já registradas antes do protótipo abrir (base da economia)
  purchases: [
    { itemId: "luva", before: 42.5, paid: 38.9, qty: 10, best: true, date: "2026-11-10T10:20:00-03:00" },
    { itemId: "disco", before: 9.4, paid: 8.9, qty: 120, best: false, date: "2026-11-06T15:05:00-03:00" },
    { itemId: "fita", before: 7.8, paid: 7.2, qty: 30, best: true, date: "2026-11-12T09:40:00-03:00" },
  ],
};
