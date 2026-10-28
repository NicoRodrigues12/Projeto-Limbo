// =====================================================
// CAVERNA E ARANHA
//   Uma fase com "cavernaAranha: true" começa na floresta. O chão acaba
//   num buraco: o boneco cai, a tela escurece e ele reaparece caindo do
//   teto de uma caverna. Lá ele só anda, e uma aranha gigante vem atrás.
//
//   Este arquivo é chamado por jogo.js, jogador.js e fase.js
//   (procure por "Caverna" e "Aranha" nesses arquivos).
// =====================================================

// ---------- AJUSTES (mexa aqui para deixar mais fácil ou mais difícil) ----------
const CFG_ARANHA = {
  gatilhoX: 2300,        // quando o boneco passa deste x, a aranha desce do buraco
  corpoY: 314,           // altura do centro do corpo quando ela anda (chão = 380)
  descida: 11,           // velocidade da descida pelo fio
  velocidade: 0.97,      // velocidade normal, como fração da velocidade do boneco
  investida: 1.9,        // velocidade na investida (fração da velocidade do boneco)
  alcance: 420,          // só investe se o boneco estiver a menos que isso de distância
  pausa: [150, 260],     // frames entre uma investida e outra (sorteia entre os dois)
};

// ---------- GEOMETRIA DA CAVERNA (tem que bater com as plataformas da fase) ----------
const CAV_X = 1940;                          // começo da caverna (parede da esquerda)
const CAV_FIM = 3700;                        // fim da caverna (parede da direita)
const CAV_BURACO = { x0: 2010, x1: 2160 };   // abertura no teto, por onde o boneco cai
const CAV_CENTRO = (CAV_BURACO.x0 + CAV_BURACO.x1) / 2;

// ---------- ESTADO ----------
const cavernaEstado = {
  dentro: false,       // já caiu na caverna?
  checkpoint: false,   // se morrer, volta para a caverna (e não para a floresta)
  fade: 0,             // 0 = tela normal, 1 = tela preta
  tremor: 0,           // tremor da tela no pouso
  pousou: true,
};

const aranhaCaverna = {
  estado: "espera",    // "espera" | "descendo" | "perseguindo"
  modo: "andando",     // "andando" | "armando" | "investindo"
  x: 0, y: 0, vel: 0, ciclo: 0, t: 0,
};

// ---------- FUNÇÕES AUXILIARES ----------
function cavRuido(n) {                       // número "aleatório" sempre igual para o mesmo n
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function cavSorteio(faixa) {
  return faixa[0] + Math.random() * (faixa[1] - faixa[0]);
}

function dentroDaCaverna() {
  return !!(faseAtual && faseAtual.cavernaAranha && cavernaEstado.dentro);
}

// ---------- TETO (calculado uma vez só) ----------
function cavTetoY(x) {
  let y = 50 + Math.sin(x * 0.011) * 22 + Math.sin(x * 0.027 + 1.3) * 14;
  const cel = Math.floor(x / 95);                       // estalactites: uma por "célula" de 95px
  const centro = cel * 95 + 25 + cavRuido(cel) * 45;
  const larg = 12 + cavRuido(cel + 4) * 6;
  const dist = Math.abs(x - centro);
  if (dist < larg) y += (30 + cavRuido(cel + 8) * 95) * (1 - dist / larg);
  return y;
}

const CAV_TETO = (function () {
  const p = new Path2D();
  function trecho(x0, x1) {
    p.moveTo(x0, -400);
    p.lineTo(x1, -400);
    for (let x = x1; x >= x0; x -= 5) p.lineTo(x, cavTetoY(x));
    p.closePath();
  }
  trecho(CAV_X, CAV_BURACO.x0);                // o teto tem um buraco no meio
  trecho(CAV_BURACO.x1, CAV_FIM + 60);
  return p;
})();

const CAV_PEDRAS = (function () {              // pedrinhas no chão (só enfeite)
  const lista = [];
  for (let i = 0, x = CAV_X + 140; x < CAV_FIM; i++) {
    lista.push({ x, w: 12 + cavRuido(i) * 28, h: 4 + cavRuido(i + 50) * 13 });
    x += 60 + cavRuido(i + 100) * 90;
  }
  return lista;
})();

// ---------- QUEDA, REINÍCIO E TREMOR ----------
function colocarJogadorNaCaverna() {
  const c = cavernaEstado;
  c.dentro = true;
  c.checkpoint = true;
  c.fade = 1;
  c.tremor = 0;
  c.pousou = false;
  jogador.x = CAV_CENTRO - jogador.w / 2;
  jogador.y = -150;                             // começa acima da tela, caindo pelo buraco
  jogador.vx = 0;
  jogador.vy = 0;
  jogador.noChao = false;
  jogador.olhaEsquerda = false;
  aranhaCaverna.estado = "espera";
}

// Chamada por jogo.js quando o boneco cai fora da tela.
// Devolve true se a queda levou à caverna (e então ele NÃO morre).
function cairNaCaverna() {
  if (!faseAtual.cavernaAranha || cavernaEstado.dentro) return false;
  colocarJogadorNaCaverna();
  return true;
}

// Chamada por jogador.js dentro de reiniciar().
function reiniciarAranhaCaverna() {
  aranhaCaverna.estado = "espera";
  if (!faseAtual || !faseAtual.cavernaAranha) {
    cavernaEstado.dentro = false;
    cavernaEstado.fade = 0;
    return;
  }
  if (cavernaEstado.checkpoint) {
    colocarJogadorNaCaverna();                  // morreu na caverna: volta para a caverna
  } else {
    cavernaEstado.dentro = false;               // morreu na floresta: volta para o começo
    cavernaEstado.fade = 0;
  }
}

// Chamada por fase.js dentro de carregarFase(): fase nova, tudo zerado.
function aoCarregarFaseAranha() {
  cavernaEstado.dentro = false;
  cavernaEstado.checkpoint = false;
  cavernaEstado.fade = 0;
  cavernaEstado.tremor = 0;
  aranhaCaverna.estado = "espera";
}

function tremorCaverna() {
  const t = cavernaEstado.tremor;
  if (t <= 0) return null;
  return { x: (Math.random() - 0.5) * t * 0.5, y: (Math.random() - 0.5) * t * 0.5 };
}

// ---------- LÓGICA DA ARANHA ----------
function atualizarAranhaCaverna(dt) {
  if (!faseAtual || !faseAtual.cavernaAranha) return;
  const c = cavernaEstado;
  const a = aranhaCaverna;

  // ainda na floresta: a tela vai escurecendo enquanto ele cai no buraco
  if (!c.dentro) {
    c.fade = Math.max(0, Math.min(1, (jogador.y - 330) / 200));
    return;
  }

  c.fade = Math.max(0, c.fade - 0.022 * dt);                    // a caverna vai aparecendo
  if (c.tremor > 0) c.tremor = Math.max(0, c.tremor - dt);
  if (!c.pousou && jogador.noChao) { c.pousou = true; c.tremor = 16; }   // pousou: a tela treme

  // a aranha ainda não apareceu: espera o boneco andar um pouco
  if (a.estado === "espera") {
    if (jogador.x > CFG_ARANHA.gatilhoX) {
      a.estado = "descendo";
      a.modo = "andando";
      a.x = CAV_CENTRO;
      a.y = -170;
      a.vel = 0;
      a.ciclo = 0;
      a.t = 0;
    }
    return;
  }

  // desce do buraco pendurada num fio
  if (a.estado === "descendo") {
    a.y += CFG_ARANHA.descida * dt;
    a.ciclo += dt * 0.1;
    if (a.y >= CFG_ARANHA.corpoY) {
      a.y = CFG_ARANHA.corpoY;
      a.estado = "perseguindo";
      a.modo = "andando";
      a.t = cavSorteio(CFG_ARANHA.pausa);
      c.tremor = 14;                                            // ela pousou
    }
    return;
  }

  // persegue: anda, se prepara (levanta as patas da frente) e investe
  const V = VELOCIDADE;
  a.t -= dt;
  if (a.modo === "andando") {
    a.vel = V * CFG_ARANHA.velocidade;
    if (a.t <= 0 && jogador.x - a.x < CFG_ARANHA.alcance) { a.modo = "armando"; a.t = 26; }
  } else if (a.modo === "armando") {
    a.vel = V * 0.1;
    if (a.t <= 0) { a.modo = "investindo"; a.t = 42; }
  } else {
    a.vel = V * CFG_ARANHA.investida;
    if (a.t <= 0) { a.modo = "andando"; a.t = cavSorteio(CFG_ARANHA.pausa); }
  }
  a.x = Math.min(a.x + a.vel * dt, CAV_FIM - 30);
  a.ciclo += dt * 0.14 * Math.max(0.35, a.vel / V);
}

function aranhaPegouJogador() {
  const a = aranhaCaverna;
  if (!faseAtual.cavernaAranha || a.estado === "espera") return false;
  // hitbox do corpo e das patas da frente (um pouco menor que o desenho)
  return colide(jogador, { x: a.x - 45, y: a.y - 40, w: 125, h: 120 });
}

// ---------- DESENHO: FUNDO (fixo na tela, com paralaxe) ----------
function cavCamada(fator, passo, cor, hMin, hMax, deBaixo) {
  const desl = camera * fator;
  const i0 = Math.floor(desl / passo) - 1;
  const i1 = i0 + Math.ceil(LARGURA / passo) + 3;
  ctx.fillStyle = cor;
  for (let i = i0; i <= i1; i++) {
    const x = i * passo - desl + cavRuido(i + 3) * passo * 0.6;
    const w = passo * (0.25 + cavRuido(i + 5) * 0.35);
    const h = hMin + cavRuido(i + 9) * (hMax - hMin);
    ctx.beginPath();
    if (deBaixo) {
      ctx.moveTo(x - w, 400);
      ctx.lineTo(x, 400 - h);
      ctx.lineTo(x + w, 400);
    } else {
      ctx.moveTo(x - w, -10);
      ctx.lineTo(x, h);
      ctx.lineTo(x + w, -10);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function desenharFundoCaverna() {
  const g = ctx.createLinearGradient(0, 0, 0, ALTURA);
  g.addColorStop(0, "#0a0b0e");
  g.addColorStop(0.5, "#22252b");
  g.addColorStop(1, "#4d5057");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  cavCamada(0.2, 130, "rgba(6,7,10,0.5)", 50, 150, false);    // estalactites lá longe
  cavCamada(0.2, 150, "rgba(10,11,14,0.45)", 40, 130, true);  // pilares lá longe

  const nev = ctx.createLinearGradient(0, 200, 0, 380);       // névoa rente ao chão
  nev.addColorStop(0, "rgba(150,155,165,0)");
  nev.addColorStop(1, "rgba(150,155,165,0.35)");
  ctx.fillStyle = nev;
  ctx.fillRect(0, 200, LARGURA, 190);

  cavCamada(0.45, 110, "rgba(4,4,6,0.7)", 40, 110, false);    // estalactites mais perto
  cavCamada(0.45, 170, "rgba(4,4,6,0.75)", 30, 90, true);     // pilares mais perto
}

// ---------- DESENHO: CENÁRIO (acompanha a câmera, antes das plataformas) ----------
function desenharCenarioCaverna() {
  const t = performance.now() / 1000;

  // o céu lá fora, visto pelo buraco
  ctx.fillStyle = "#dfe3ec";
  ctx.fillRect(CAV_BURACO.x0, -120, CAV_BURACO.x1 - CAV_BURACO.x0, 180);

  // feixe de luz que entra pelo buraco
  const feixe = ctx.createLinearGradient(0, 40, 0, 380);
  feixe.addColorStop(0, "rgba(235,238,248,0.55)");
  feixe.addColorStop(1, "rgba(235,238,248,0.05)");
  ctx.fillStyle = feixe;
  ctx.beginPath();
  ctx.moveTo(CAV_BURACO.x0, 40);
  ctx.lineTo(CAV_BURACO.x1, 40);
  ctx.lineTo(CAV_BURACO.x1 + 70, 380);
  ctx.lineTo(CAV_BURACO.x0 - 10, 380);
  ctx.closePath();
  ctx.fill();

  // poeira flutuando na luz
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 14; i++) {
    const px = CAV_CENTRO + Math.sin(t * 0.4 + i * 2.1) * (30 + i * 4) + i * 3;
    const py = 60 + ((t * 14 + i * 47) % 300);
    ctx.fillRect(px, py, 2, 2);
  }

  // teto com estalactites
  ctx.fillStyle = "#020203";
  ctx.fill(CAV_TETO);

  // borda clara do chão e pedrinhas
  ctx.strokeStyle = "rgba(120,125,135,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CAV_X + 60, 379);
  ctx.lineTo(CAV_FIM, 379);
  ctx.stroke();

  ctx.fillStyle = "#000";
  for (const r of CAV_PEDRAS) {
    ctx.beginPath();
    ctx.ellipse(r.x, 381, r.w, r.h, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
}

// ---------- DESENHO: ARANHA ----------
function desenharAranhaCaverna() {
  const a = aranhaCaverna;
  if (!faseAtual || !faseAtual.cavernaAranha || a.estado === "espera") return;

  const pendurada = a.estado === "descendo";
  const armando = !pendurada && a.modo === "armando";
  const mov = pendurada ? 0 : Math.max(0.3, Math.min(1.4, a.vel / VELOCIDADE));
  const t = performance.now() / 1000;
  const bx = a.x;
  const by = a.y + (pendurada ? 0 : Math.sin(a.ciclo * 2) * 2);
  const BASE = [135, 68, -68, -135];     // onde cada pata encosta no chão, em relação ao corpo

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // o fio de teia
  if (pendurada) {
    ctx.strokeStyle = "rgba(225,228,235,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, -700);
    ctx.lineTo(bx, by - 10);
    ctx.stroke();
  }

  // k de 0 a 3 = patas do lado de perto, 4 a 7 = patas do lado de longe
  function perna(k) {
    const g = k % 4;
    const longe = k >= 4;
    const qx = bx + (1.5 - g) * 13 + (longe ? 6 : 0);
    const qy = by + 6;
    let fx, fy;
    if (pendurada) {                                    // pernas soltas no ar
      fx = bx + BASE[g] * 0.45 + Math.sin(t * 5 + k) * 6;
      fy = by + 78 + Math.sin(t * 6 + k * 1.7) * 7;
    } else if (armando && g === 0) {                    // se prepara: levanta as patas da frente
      fx = bx + 78 + (longe ? 14 : 0);
      fy = by - 110 + Math.sin(t * 25 + k) * 4;
    } else {                                            // andando
      const p = a.ciclo + (g % 2) * Math.PI + (longe ? Math.PI / 2 : 0);
      fx = bx + BASE[g] + (longe ? 22 : 0) + Math.sin(p) * 22 * mov;
      fy = 380 - Math.max(0, Math.cos(p)) * 17 * mov;
    }
    const kx = qx + (fx - qx) * 0.5;
    const ky = Math.min(qy, fy) - 62 - Math.abs(fx - qx) * 0.1;   // o "joelho" fica bem acima do corpo
    ctx.strokeStyle = longe ? "#0d0e11" : "#000";
    ctx.lineWidth = longe ? 3.5 : 4.5;
    ctx.beginPath();
    ctx.moveTo(qx, qy);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy);
    ctx.stroke();
  }

  for (let k = 4; k < 8; k++) perna(k);

  // corpo: abdômen atrás, cabeça na frente (ela olha para a direita)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(bx - 30, by + 2, 38, 28, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bx + 16, by, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // presas
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx + 30, by + 8);
  ctx.lineTo(bx + 35, by + 22);
  ctx.moveTo(bx + 24, by + 12);
  ctx.lineTo(bx + 26, by + 25);
  ctx.stroke();

  for (let k = 0; k < 4; k++) perna(k);

  // olhos brilhantes (como os do boneco)
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#ffffff";
  const olhos = [[bx + 27, by - 5, 3.2], [bx + 33, by + 3, 2.6], [bx + 21, by - 9, 1.7], [bx + 36, by - 3, 1.4]];
  for (const [ox, oy, r] of olhos) {
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---------- DESENHO: ESCURECER A TELA (por cima de tudo) ----------
function desenharFadeCaverna() {
  if (!faseAtual || !faseAtual.cavernaAranha) return;
  if (cavernaEstado.fade <= 0) return;
  ctx.fillStyle = "rgba(0,0,0," + cavernaEstado.fade + ")";
  ctx.fillRect(0, 0, LARGURA, ALTURA);
}