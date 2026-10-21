
const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");
const LARGURA = canvas.width;
const ALTURA = canvas.height;

const GRAVIDADE = 0.6;     // quanto maior, mais rápido o personagem cai
const VELOCIDADE = 3.5;    // velocidade de andar
const FORCA_PULO = -12;    // negativo = para cima. Quanto mais negativo, mais alto
const ESCALA = 2;          // cada "pixel" do desenho vira um quadrado 3x3 na tela
const fundo = new Image();
fundo.src = "fundo.png";

// "#" = preto, "g" = cinza escuro (detalhe do casaco), "W" = branco (olhos), "." = vazio
const CORES = { "#": "#000000", "g": "#2b2b2b", "o": "#1d1d1d", "W": "#ffffff" };

const CABECA = [
  "....#.#..#.#..",
  "..###########.",
  ".############.",
  "..###oo##oo##.",
  "..##oWWooWWo#.",
  "..##oWWooWWo#.",
  "..###oo##oo##.",
  "..###########.",
  "...#########..",
  "....#######...",
];
const OMBROS = [".############."];

// Tronco + braços em posições diferentes (8 linhas cada)
const BRACOS_PARADOS = [
  ".##gg#####g##.",
  ".##g#g####g##.",
  ".##g##g###g##.",
  ".##g###g##g##.",
  ".##g####g#g##.",
  ".##g#####gg##.",
  ".##g######g##.",
  ".##g######g##.",
];
const BRACOS_ATRAS = [      // braço esquerdo balança para trás
  ".##gg#####g##.",
  ".##g#g####g##.",
  "##.g##g###g##.",
  "##.g###g##g##.",
  "##.g####g#g##.",
  "##.g#####gg##.",
  "##.g######g##.",
  "##.g######g##.",
];
const BRACOS_FRENTE = [     // braço direito balança para frente
  ".##gg#####g##.",
  ".##g#g####g##.",
  ".##g##g###g.##",
  ".##g###g##g.##",
  ".##g####g#g.##",
  ".##g#####gg.##",
  ".##g######g.##",
  ".##g######g.##",
];
const BRACOS_ABERTOS = [    // no pulo, os dois braços abertos
  ".##gg#####g##.",
  ".##g#g####g##.",
  "##.g##g###g.##",
  "##.g###g##g.##",
  "##.g####g#g.##",
  "##.g#####gg.##",
  "##.g######g.##",
  "##.g######g.##",
];

const BARRA = ["##############", "##############", "##############", "#.##.##.###.##"];

// Pernas (5 linhas cada)
const PERNAS_PARADO  = ["...###..###...", "...###..###...", "...###..###...", "..####..####..", "..####..#####."];
const PERNAS_ABERTAS = ["..###....###..", ".###......###.", ".###......###.", ".###......####", "####......####"];
const PERNAS_PE_E    = [".....####.....", ".....####.....", "....###.###...", "....###.####..", "........#####."];  // pé esquerdo no ar
const PERNAS_PE_D    = [".....####.....", ".....####.....", "...###.###....", "...####.###...", "...####......."];  // pé direito no ar
const PERNAS_PULO    = ["..###....###..", ".###......###.", ".###.....###..", ".####....####.", ".####.....###."];

// Junta os pedaços para formar um desenho completo
function montar(bracos, pernas) {
  return [...CABECA, ...OMBROS, ...bracos, ...BARRA, ...pernas];
}

// Agachado: a mesma cabeça, mas com olhos fechados e tudo preto
// (troca as letras W, o e g por #, que é preto)
const CABECA_FECHADA = CABECA.slice(0, 9).map((linha) => linha.replace(/[Wog]/g, "#"));
const AGACHADO = [
  ...CABECA_FECHADA,
  ".############.",
  "##############",
  "##############",
  "##############",
  "##############",
  "#.##.##.######",
  ".####....#####",
  ".####....#####",
];

const SPRITES = {
  parado:   montar(BRACOS_PARADOS, PERNAS_PARADO),
  pulando:  montar(BRACOS_ABERTOS, PERNAS_PULO),
  agachado: AGACHADO,
};

// Ciclo de caminhada: 4 quadros que se repetem
const CICLO_ANDAR = [
  montar(BRACOS_ATRAS,   PERNAS_ABERTAS),
  montar(BRACOS_PARADOS, PERNAS_PE_E),
  montar(BRACOS_FRENTE,  PERNAS_ABERTAS),
  montar(BRACOS_PARADOS, PERNAS_PE_D),
];


// =====================================================
// 3. A FASE
//    Tudo é um retângulo: x, y (canto de cima), w (largura), h (altura)
// =====================================================
const FIM_DO_MUNDO = 3100;

const plataformas = [
  // --- trecho 1: introdução ---
  { x: 0,    y: 380, w: 600, h: 100 },  // chão 1
  { x: 380,  y: 340, w: 40,  h: 40 },   // caixa para o primeiro pulo

  // --- trecho 2: buraco + plataforma no ar + espinhos ---
  { x: 700,  y: 380, w: 500, h: 100 },  // chão 2 (buraco de 100 antes)
  { x: 880,  y: 300, w: 120, h: 20 },   // plataforma no ar

  // --- trecho 3: espinhos no chão ---
  { x: 1300, y: 380, w: 400, h: 100 },  // chão 3 (buraco de 100 antes)

  // --- trecho 4: escadinha + espinhos depois dela ---
  { x: 1800, y: 380, w: 500, h: 100 },  // chão 4 (buraco de 100 antes)
  { x: 1900, y: 340, w: 60,  h: 40 },   // degrau 1
  { x: 1960, y: 300, w: 60,  h: 80 },   // degrau 2
  { x: 2020, y: 260, w: 60,  h: 120 },  // degrau 3

  // --- trecho 5: caixa, espinhos, túnel baixo e a luz ---
  { x: 2410, y: 380, w: 690, h: 100 },  // chão 5 (buraco de 110 antes)
  { x: 2480, y: 340, w: 40,  h: 40 },   // caixa
  { x: 2700, y: 150, w: 160, h: 186 },  // túnel baixo: só passa agachado (S / seta para baixo)
];

const espinhos = [
  { x: 1060, y: 360, w: 60,  h: 20 },   // chão 2
  { x: 1440, y: 360, w: 60,  h: 20 },   // chão 3
  { x: 2140, y: 360, w: 60,  h: 20 },   // depois da escadinha
  { x: 2560, y: 360, w: 60,  h: 20 },   // antes do túnel
  { x: 2900, y: 360, w: 60,  h: 20 },   // depois do túnel
];

const luz = { x: 3040, y: 290, w: 10, h: 90 };  // o fim da fasee

// As 5 cores do cenário. Aperte 1 a 5 no jogo para trocar.
const PALETAS = [
  { ceuCima: "#5f6163", ceuBaixo: "#bdbfc0", arvore: "#2a2a2a", luz: "#ffffff" },  // 1 cinza
  { ceuCima: "#1f3a36", ceuBaixo: "#6f9c92", arvore: "#0c1f1b", luz: "#bffff0" },  // 2 verde
  { ceuCima: "#3a1f12", ceuBaixo: "#c27a3c", arvore: "#1e0c05", luz: "#ffd9a0" },  // 3 âmbar
  { ceuCima: "#1b1a3a", ceuBaixo: "#5c5aa8", arvore: "#0a081e", luz: "#d6d0ff" },  // 4 roxo
  { ceuCima: "#0c1d3a", ceuBaixo: "#3a6fb0", arvore: "#050a19", luz: "#c8e4ff" },  // 5 azul
];
let paleta = PALETAS[0];

// =====================================================
// 4. ESTADO DO JOGO (as variáveis que mudam enquanto joga)
// =====================================================
const teclas = {};     // guarda quais teclas estão apertadas
const ALTURA_EM_PE = 28 * ESCALA;
const ALTURA_AGACHADO = 17 * ESCALA;
const jogador = { w: 14 * ESCALA, h: ALTURA_EM_PE };
const monstro = {
  ativo: false,
  x: 0,
  y: 0,
  destinoX: 0,
  destinoY: 0,
  espera: 100,
  tempoVisivel: 240,
  alpha: 0,
  velocidade: 0.8
};
let estado;            // "jogando", "morto" ou "venceu"
let camera;            // quanto a tela já "andou" para a direita
let contador;          // tempo da tela escura quando morre
let mortes = 0;

function reiniciar() {
  jogador.x = 60;
  jogador.y = 380 - jogador.h;
  jogador.vx = 0;
  jogador.vy = 0;
  jogador.noChao = false;
  jogador.olhaEsquerda = false;
  jogador.anim = 0;
  jogador.h = ALTURA_EM_PE
  jogador.agachado = false
  estado = "jogando";
  camera = 0;
  contador = 0;

  monstro.ativo = false;
monstro.alpha = 0;
monstro.espera = 100 + Math.random() * 200;
}

function morrer() {
  estado = "morto";
  contador = 50;
  mortes++;
}

// =====================================================
// 5. TECLADO
// =====================================================
window.addEventListener("keydown", (e) => {
  teclas[e.code] = true;
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
    e.preventDefault();   // evita a página rolar
  }
  if (e.code === "KeyR") reiniciar();
  if (e.code.startsWith("Digit") && PALETAS[Number(e.code[5]) - 1]) {
    paleta = PALETAS[Number(e.code[5]) - 1];
  }
});
window.addEventListener("keyup", (e) => { teclas[e.code] = false; });
window.addEventListener("blur", () => { for (const t in teclas) teclas[t] = false; });

// =====================================================
// 6. LÓGICA: o que acontece a cada quadro
// =====================================================
// Pergunta: os dois retângulos estão se tocando?
function colide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}






function aparecerMonstro() {
  monstro.ativo = true;
  monstro.alpha = 0;

  // Começa fora da tela, à direita.
  monstro.x = camera + LARGURA + 160;

  // Altura aleatória.
  monstro.destinoY = 100 + Math.random() * 90;
  monstro.y = monstro.destinoY;

  // Vai até ultrapassar a borda esquerda.
  monstro.destinoX = -160;

  // Velocidade aleatória.
  monstro.velocidade = 0.8 + Math.random() * 0.7;
}



function escolherDestinoMonstro() {
  monstro.destinoX = 50 + Math.random() * (LARGURA - 100);
  monstro.destinoY = 40 + Math.random() * (ALTURA * 0.45);
}






function atualizarMonstro(dt) {
  if (!monstro.ativo) {
    monstro.espera -= dt;

    if (monstro.espera <= 0) {
      aparecerMonstro();
    }

    return;
  }

  monstro.alpha = Math.min(1, monstro.alpha + 0.025 * dt);

  // Movimento contínuo para a esquerda.
  monstro.x -= monstro.velocidade * dt;

  // Oscilação visual sem acumular deslocamento.
  monstro.y = monstro.destinoY +
    Math.sin(performance.now() / 350) * 4;

  // Reinicia o ciclo quando o monstro sair da tela.
  if (monstro.x < camera -160) {
    monstro.ativo = false;
    monstro.alpha = 0;
    monstro.espera = 120 + Math.random() * 300;
  }
}


function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}


function chaoAbaixo(x, yMin) {
  let alvo = ALTURA + 40;
  for (const p of plataformas) {
    if (x >= p.x && x <= p.x + p.w && p.y >= yMin && p.y < alvo) alvo = p.y;
  }
  return alvo;
}

function desenharMonstro() {
  if (!monstro.ativo) return;

  const t = performance.now();
  const x = monstro.x;
  const y = monstro.y + Math.sin(t / 350) * 4;

  ctx.save();
  ctx.globalAlpha = monstro.alpha;

  // ---------- 1) FEIXE DE LUZ ATÉ O CHÃO ----------
  const topoY = y + 20;
  const chaoY = chaoAbaixo(x, y + 30);
  const sway = Math.sin(t / 700) * 8;                       // o feixe balança de leve
  const pisca = 0.85 + Math.sin(t / 90) * 0.05 + Math.sin(t / 230) * 0.06;
  const larguraTopo = 12;
  const larguraBase = 22 + (chaoY - topoY) * 0.22;          // abre conforme desce
  const meia = (p) => larguraTopo + (larguraBase - larguraTopo) * p;

  const feixe = ctx.createLinearGradient(0, topoY, 0, chaoY);
  feixe.addColorStop(0,   rgba(paleta.luz, 0.55 * pisca));
  feixe.addColorStop(0.6, rgba(paleta.luz, 0.18 * pisca));
  feixe.addColorStop(1,   rgba(paleta.luz, 0.08 * pisca));
  ctx.fillStyle = feixe;
  ctx.beginPath();
  ctx.moveTo(x - larguraTopo, topoY);
  ctx.lineTo(x + sway - larguraBase, chaoY);
  ctx.lineTo(x + sway + larguraBase, chaoY);
  ctx.lineTo(x + larguraTopo, topoY);
  ctx.closePath();
  ctx.fill();

  // miolo mais claro do feixe
  ctx.fillStyle = rgba(paleta.luz, 0.07 * pisca);
  ctx.beginPath();
  ctx.moveTo(x - 5, topoY);
  ctx.lineTo(x + sway - larguraBase * 0.35, chaoY);
  ctx.lineTo(x + sway + larguraBase * 0.35, chaoY);
  ctx.lineTo(x + 5, topoY);
  ctx.closePath();
  ctx.fill();

  // poeira flutuando dentro da luz
  for (let i = 0; i < 16; i++) {
    const p = ((t / 5000) + i * 0.0625) % 1;                // 0 = no olho, 1 = no chão
    const lateral = Math.sin(i * 12.9898 + t / 2500) * 0.8 * meia(p);
    const px = x + sway * p + lateral;
    const py = topoY + p * (chaoY - topoY);
    ctx.fillStyle = rgba(paleta.luz, 0.5 * (1 - p) * pisca);
    ctx.beginPath();
    ctx.arc(px, py, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // poça de luz onde o feixe encosta no chão
  if (chaoY < ALTURA) {
    const pocaX = x + sway;
    ctx.fillStyle = rgba(paleta.luz, 0.14 * pisca);
    ctx.beginPath();
    ctx.ellipse(pocaX, chaoY, larguraBase * 1.15, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(paleta.luz, 0.22 * pisca);
    ctx.beginPath();
    ctx.ellipse(pocaX, chaoY, larguraBase * 0.65, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------- 2) FUMAÇA SUBINDO PELO TOPO ----------
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const baseX = x - 50 + i * 16;
    const alt = 40 + ((i * 29) % 40);
    const bal = Math.sin(t / 600 + i * 1.3) * 10;
    ctx.strokeStyle = "rgba(4,4,4," + (0.55 - i * 0.04) + ")";
    ctx.lineWidth = 10 - (i % 3) * 2;
    ctx.beginPath();
    ctx.moveTo(baseX, y - 10);
    ctx.quadraticCurveTo(baseX + bal, y - alt * 0.6, baseX + bal * 1.6, y - alt);
    ctx.stroke();
  }

  // ---------- 3) CORPO DE SOMBRA ----------
  const sombra = ctx.createRadialGradient(x - 8, y - 8, 5, x, y, 75);
  sombra.addColorStop(0,   "#0d0d0d");
  sombra.addColorStop(0.65, "#040404");
  sombra.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = sombra;
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 82, 62, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 10, y + 18, 55, 40, 0.4, 0, Math.PI * 2);   // volume extra embaixo
  ctx.fill();

  // ---------- 4) TENTÁCULOS ONDULANTES ----------
  ctx.strokeStyle = "#020202";
  for (let i = 0; i < 8; i++) {
    const sx = x - 42 + i * 12;
    const sy = y + 28;
    const comp = 40 + ((i * 37) % 55);
    const fase = t / 380 + i * 0.9;
    const segs = 10;
    let ax = sx, ay = sy;
    for (let s = 1; s <= segs; s++) {
      const f = s / segs;
      const nx = sx + Math.sin(fase - f * 3) * (4 + f * 14) - f * 6;
      const ny = sy + f * comp;
      ctx.lineWidth = Math.max(1, (6 - (i % 3)) * (1 - f) + 1);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ax = nx; ay = ny;
    }
  }

  // ---------- 5) O OLHO ----------
  const ciclo = (t / 1000) % 5;                              // pisca a cada 5 segundos
  const abre = ciclo > 4.8 ? Math.max(0.06, Math.abs(ciclo - 4.9) * 10) : 1;
  const olhar = t / 500;
  const olharX = Math.sin(olhar) * 6;
  const olharY = 4 + Math.sin(olhar * 0.7) * 3;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.2);

  // brilho em volta
  ctx.shadowColor = paleta.luz;
  ctx.shadowBlur = 26;
  ctx.fillStyle = rgba(paleta.luz, 0.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, 27, 31 * abre, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // tudo dentro do olho fica recortado pelo formato dele
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 28 * abre, 0, 0, Math.PI * 2);
  ctx.clip();

  const esclera = ctx.createRadialGradient(-6, -8, 2, 0, 0, 30);
  esclera.addColorStop(0,   "#ffffff");
  esclera.addColorStop(0.65, "#d6d6d6");
  esclera.addColorStop(1,   "#6a6a6a");
  ctx.fillStyle = esclera;
  ctx.fillRect(-30, -34, 60, 68);

  // veias saindo das bordas
  ctx.strokeStyle = "rgba(40,40,40,0.35)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 26, Math.sin(a) * 30);
    ctx.quadraticCurveTo(
      Math.cos(a + 0.25) * 19, Math.sin(a + 0.25) * 22,
      Math.cos(a) * 14 + olharX * 0.5, Math.sin(a) * 16 + olharY * 0.5
    );
    ctx.stroke();
  }

  // íris
  const ix = olharX * 0.7, iy = olharY * 0.7;
  const iris = ctx.createRadialGradient(ix, iy, 3, ix, iy, 15);
  iris.addColorStop(0,   "#111111");
  iris.addColorStop(0.45, rgba(paleta.luz, 0.55));
  iris.addColorStop(0.85, "#3c3c3c");
  iris.addColorStop(1,   "#0a0a0a");
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.arc(ix, iy, 15, 0, Math.PI * 2);
  ctx.fill();

  // pupila em fenda, dilata e contrai
  const larguraPupila = 3 + Math.sin(t / 400) * 1.2;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(ix, iy, larguraPupila, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // reflexo
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(ix - 6, iy - 7, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // sombra nas pálpebras (cima e baixo escurecem)
  const palpebra = ctx.createLinearGradient(0, -28, 0, 28);
  palpebra.addColorStop(0,   "rgba(0,0,0,0.65)");
  palpebra.addColorStop(0.3, "rgba(0,0,0,0)");
  palpebra.addColorStop(0.7, "rgba(0,0,0,0)");
  palpebra.addColorStop(1,   "rgba(0,0,0,0.55)");
  ctx.fillStyle = palpebra;
  ctx.fillRect(-30, -34, 60, 68);
  ctx.restore();   // fim do recorte

  // contorno escuro do olho
  ctx.strokeStyle = "#030303";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 28 * abre, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function atualizar(dt) {
  if (estado === "morto") {
    contador -= dt;
    if (contador <= 0) reiniciar();
    return;
  }
  if (estado === "venceu") {
    if (teclas["Enter"]) { mortes = 0; reiniciar(); }
    return;
  }

  const esquerda = teclas["ArrowLeft"] || teclas["KeyA"];
  const direita  = teclas["ArrowRight"] || teclas["KeyD"];
  const pular    = teclas["Space"] || teclas["ArrowUp"] || teclas["KeyW"];

  // --- movimento horizontal ---
  const agachar = teclas["ArrowDown"] || teclas["KeyS"];

  // --- agachar / levantar ---
  if (agachar && jogador.noChao && !jogador.agachado) {
    jogador.agachado = true;
    jogador.y += ALTURA_EM_PE - ALTURA_AGACHADO;   // desce, para os pés continuarem no chão
    jogador.h = ALTURA_AGACHADO;
  }
  if (!agachar && jogador.agachado) {
    // só levanta se não houver nada em cima da cabeça
    const emPe = { x: jogador.x, y: jogador.y + jogador.h - ALTURA_EM_PE, w: jogador.w, h: ALTURA_EM_PE };
    if (!plataformas.some((p) => colide(emPe, p))) {
      jogador.agachado = false;
      jogador.y = emPe.y;
      jogador.h = ALTURA_EM_PE;
    }
  }

  // --- movimento horizontal ---
  const velocidade = jogador.agachado ? VELOCIDADE * 0.4 : VELOCIDADE;   // agachado anda devagar
  jogador.vx = 0;
  if (esquerda) { jogador.vx = -velocidade; jogador.olhaEsquerda = true; }
  if (direita)  { jogador.vx =  velocidade; jogador.olhaEsquerda = false; }
  if (pular && jogador.noChao && !jogador.agachado) {
    jogador.vy = FORCA_PULO;
    jogador.noChao = false;
  }
  if (pular && jogador.noChao) {
    jogador.vy = FORCA_PULO;
    jogador.noChao = false;
  }

  jogador.x += jogador.vx * dt;
  if (jogador.x < 0) jogador.x = 0;
  for (const p of plataformas) {          // bateu de lado numa parede?
    if (colide(jogador, p)) {
      if (jogador.vx > 0) jogador.x = p.x - jogador.w;
      else if (jogador.vx < 0) jogador.x = p.x + p.w;
    }
  }

  // --- movimento vertical (gravidade) ---
  jogador.vy += GRAVIDADE * dt;
  jogador.y += jogador.vy * dt;
  jogador.noChao = false;
  for (const p of plataformas) {
    if (colide(jogador, p)) {
      if (jogador.vy > 0) {               // caindo: pousou em cima
        jogador.y = p.y - jogador.h;
        jogador.noChao = true;
      } else if (jogador.vy < 0) {        // subindo: bateu a cabeça
        jogador.y = p.y + p.h;
      }
      jogador.vy = 0;
    }
  }

  // --- perigos ---
  for (const e of espinhos) {
    // hitbox um pouco menor que o desenho, para ser justo com quem joga
    const caixa = { x: e.x + 4, y: e.y + 6, w: e.w - 8, h: e.h - 6 };
    if (colide(jogador, caixa)) morrer();
  }
  if (jogador.y > ALTURA + 80) morrer();   // caiu no buraco

  // --- chegou na luz? ---
  if (colide(jogador, luz)) estado = "venceu";

  // --- animação e câmera ---
  if (jogador.vx !== 0) jogador.anim += dt;
  camera = Math.max(0, Math.min(jogador.x - LARGURA / 3, FIM_DO_MUNDO - LARGURA));

  atualizarMonstro(dt);
}

// =====================================================
// 7. DESENHO
// =====================================================
function desenharSprite(sprite, x, y, espelhar) {
  for (let l = 0; l < sprite.length; l++) {
    const linha = sprite[l];
    for (let c = 0; c < linha.length; c++) {
      const letra = linha[espelhar ? linha.length - 1 - c : c];
      if (letra === ".") continue;
      ctx.fillStyle = CORES[letra];
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = letra === "W" ? 10 : 0;   // só os olhos brilham
      ctx.fillRect(Math.round(x + c * ESCALA), Math.round(y + l * ESCALA), ESCALA, ESCALA);
    }
  }
}

function escolherSprite() {
  if (jogador.agachado) return SPRITES.agachado;
  if (!jogador.noChao) return SPRITES.pulando;
  if (jogador.vx === 0) return SPRITES.parado;
  return CICLO_ANDAR[Math.floor(jogador.anim / 6) % 4];
}

const vinheta = ctx.createRadialGradient(LARGURA / 2, ALTURA / 2, 150, LARGURA / 2, ALTURA / 2, 480);
vinheta.addColorStop(0, "rgba(0,0,0,0)");
vinheta.addColorStop(1, "rgba(0,0,0,0.65)");

function textoCentral(texto, y, tamanho) {
  ctx.fillStyle = "#fff";
  ctx.font = tamanho + "px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(texto, LARGURA / 2, y);
}

function camadaArvores(velocidade, opacidade, espaco, alturaBase) {
  ctx.globalAlpha = opacidade;
  ctx.fillStyle = paleta.arvore;
  for (let i = 0; i < 30; i++) {
    const altura = alturaBase + (i * 53) % 140;
    const x = i * espaco + (i % 3) * 20 - camera * velocidade;
    ctx.fillRect(Math.round(x), ALTURA - altura, 12 + (i % 3) * 6, altura);
  }
  ctx.globalAlpha = 1;
}

// lanterna pendurada com cone de luz, como nas imagens de referência
function desenharLanterna(x) {
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = paleta.luz;
  ctx.beginPath();
  ctx.moveTo(x, 130);
  ctx.lineTo(x - 50, 380);
  ctx.lineTo(x + 50, 380);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#050505";
  ctx.fillRect(x - 1, 0, 2, 120);
  ctx.fillRect(x - 6, 120, 12, 14);
  ctx.fillStyle = paleta.luz;
  ctx.fillRect(x - 3, 124, 6, 7);
}

// ---------- BONECO ARTICULADO ----------
// ângulo 0 = apontando para baixo; positivo = para frente; ~3 = para cima
function membro(x0, y0, a1, a2, L1, L2, dir, esp, cor, pe) {
  const x1 = x0 + Math.sin(a1) * L1 * dir;
  const y1 = y0 + Math.cos(a1) * L1;
  const x2 = x1 + Math.sin(a1 + a2) * L2 * dir;
  const y2 = y1 + Math.cos(a1 + a2) * L2;
  ctx.strokeStyle = cor;
  ctx.lineWidth = esp;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  if (pe) ctx.lineTo(x2 + dir * pe, y2);
  ctx.stroke();
  return { x: x2, y: y2 };   // ponta do membro (usada para desenhar as mãos)
}

function desenharBoneco() {
  const j = jogador;
  const d = j.olhaEsquerda ? -1 : 1;
  const cx = j.x + j.w / 2;
  const base = j.y + j.h;
  const agach = j.agachado;
  const noAr = !j.noChao;
  const andando = j.vx !== 0 && j.noChao;
  const L = 9;
  const t = performance.now() / 1000;

  const COR_CASACO = "#1b1b1b";
  const COR_BORDA = "#3a3a3a";
  const COR_CABELO = "#050505";

  let pernas, bracos, tronco, inclina, cabecaDist, cabecaRy;
  const ph = j.anim * 0.26;

  if (agach) {
    const bal = andando ? Math.sin(ph) * 0.35 : 0;
    pernas = [{ a1: 1.1 + bal, a2: -1.9 }, { a1: 1.1 - bal, a2: -1.9 }];
    bracos = [{ a1: 0.9, a2: 0.8 }, { a1: 0.5, a2: 0.8 }];
    tronco = 9; inclina = 0.5; cabecaDist = 8; cabecaRy = 9;
  } else if (noAr) {
    if (j.vy < 0) {
      pernas = [{ a1: 0.9, a2: -1.3 }, { a1: -0.4, a2: -0.4 }];
      bracos = [{ a1: 2.5, a2: 0.2 }, { a1: 2.1, a2: 0.2 }];
    } else {
      pernas = [{ a1: 0.5, a2: -0.2 }, { a1: -0.5, a2: -0.1 }];
      bracos = [{ a1: 1.7, a2: 0.1 }, { a1: -1.3, a2: -0.1 }];
    }
    tronco = 16; inclina = 0.1; cabecaDist = 11; cabecaRy = 10;
  } else if (andando) {
    pernas = [0, 1].map((i) => {
      const p = ph + i * Math.PI;
      return { a1: Math.sin(p) * 0.65, a2: -Math.max(0, Math.cos(p)) * 1.0 };
    });
    bracos = [0, 1].map((i) => {
      const p = ph + i * Math.PI;
      return { a1: -Math.sin(p) * 0.7, a2: 0.35 + 0.35 * Math.max(0, Math.sin(p + Math.PI)) };
    });
    tronco = 16; inclina = 0.12; cabecaDist = 11; cabecaRy = 10;
  } else {
    const resp = Math.sin(t * 2) * 0.04;
    pernas = [{ a1: 0.08, a2: 0 }, { a1: -0.08, a2: 0 }];
    bracos = [{ a1: 0.1 + resp, a2: 0.2 }, { a1: -0.1 - resp, a2: 0.2 }];
    tronco = 16; inclina = 0; cabecaDist = 11; cabecaRy = 10;
  }

  const alcance = (p) => Math.cos(p.a1) * L + Math.cos(p.a1 + p.a2) * L;
  const quadrilY = base - Math.max(alcance(pernas[0]), alcance(pernas[1])) - 3;

  const ombroX = cx + Math.sin(inclina) * d * tronco;
  const ombroY = quadrilY - Math.cos(inclina) * tronco;
  const cabX = ombroX + Math.sin(inclina) * d * cabecaDist;
  const cabY = ombroY - Math.cos(inclina) * cabecaDist;

  // "vento": andar joga cabelo e casaco para trás; no pulo/queda, para cima/baixo
  const sopro = andando ? 1 : 0;
  const lift = noAr ? Math.max(-1, Math.min(1, j.vy / 10)) : 0;   // + caindo, - subindo

  ctx.save();

  // 1) braço e perna de trás
  membro(ombroX, ombroY + 1, bracos[1].a1, bracos[1].a2, L, L, d, 5, "#101010", 0);
  membro(cx, quadrilY, pernas[1].a1, pernas[1].a2, L, L, d, 6, "#0c0c0c", 4);

  // 2) cabelo comprido (mechas que ficam atrás do corpo)
  ctx.strokeStyle = COR_CABELO;
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const sx = cabX - d * (3 + i * 2.2);
    const sy = cabY - 7 + i * 2.6;
    const len = 18 + i * 3.5;
    const bal = Math.sin(t * 3 + i * 0.9) * (1.5 + sopro * 3);
    const ex = sx - d * (len * (0.45 + sopro * 0.5)) + bal;
    const ey = sy + len * (0.95 - lift * 1.1);
    const c1x = sx - d * (len * 0.5 * (0.3 + sopro)) - bal * 0.5;
    const c1y = sy + len * 0.35;
    ctx.lineWidth = 6.5 - i * 0.6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(c1x, c1y, ex, ey);
    ctx.stroke();
  }

  // 3) perna da frente (o sobretudo vai cobrir o topo dela)
  membro(cx, quadrilY, pernas[0].a1, pernas[0].a2, L, L, d, 6, "#000", 4);

  // 4) sobretudo comprido
  const hemY = quadrilY + (agach ? 7 : 11) - lift * 5;
  const flare = 8 + (andando ? Math.abs(Math.sin(ph)) * 2 : 0);
  const swing = Math.sin(ph) * 3 * sopro;
  const trail = -d * sopro * 4;
  const frenteX = cx + d * flare + swing + trail * 0.3;
  const costasX = cx - d * (flare + 2) + trail - swing * 0.5;

  ctx.beginPath();
  ctx.moveTo(ombroX - d * 8, ombroY);
  ctx.lineTo(ombroX + d * 7, ombroY);
  ctx.quadraticCurveTo(cx + d * 9, quadrilY - 2, frenteX, hemY);
  ctx.lineTo(costasX, hemY + 1);
  ctx.quadraticCurveTo(cx - d * 9, quadrilY - 2, ombroX - d * 8, ombroY);
  ctx.closePath();
  ctx.fillStyle = COR_CASACO;
  ctx.fill();
  ctx.strokeStyle = COR_BORDA;
  ctx.lineWidth = 1;
  ctx.stroke();

  // abertura da frente e gola
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ombroX + d * 3, ombroY + 2);
  ctx.quadraticCurveTo(cx + d * 4, quadrilY, frenteX - d * 4, hemY);
  ctx.stroke();

  // cinto
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - d * 8, quadrilY - 2);
  ctx.lineTo(cx + d * 8, quadrilY - 2);
  ctx.stroke();

  // 5) capuz abaixado: tecido amontoado atrás do pescoço
  ctx.save();
  ctx.translate(ombroX - d * 7, ombroY + 1);
  ctx.rotate(d * 0.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.5, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = COR_CASACO;
  ctx.fill();
  ctx.strokeStyle = COR_BORDA;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = "#000";            // dobra do tecido
  ctx.beginPath();
  ctx.moveTo(-5, -1);
  ctx.quadraticCurveTo(0, 3, 5, 0);
  ctx.stroke();
  ctx.restore();

  // 6) pescoço e cabeça
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ombroX, ombroY);
  ctx.lineTo(cabX, cabY);
  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(cabX, cabY, 11, cabecaRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // topo do cabelo + franja
  ctx.fillStyle = COR_CABELO;
  ctx.beginPath();
  ctx.ellipse(cabX - d, cabY - 3, 12.5, cabecaRy + 1, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();                      // mecha caindo na frente do rosto
  ctx.moveTo(cabX + d * 11, cabY - 4);
  ctx.quadraticCurveTo(cabX + d * 12, cabY + 3, cabX + d * 6, cabY - 2);
  ctx.closePath();
  ctx.fill();

  // olhos brilhantes (somem quando agachado)
  if (!agach) {
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#fff";
    for (const dx of [-4, 4]) {
      ctx.beginPath();
      ctx.ellipse(cabX + d * 3 + dx, cabY + 1.5, 2.2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // 7) braço da frente: manga do casaco + mão preta
  const mao = membro(ombroX, ombroY + 1, bracos[0].a1, bracos[0].a2, L, L, d, 6.5, COR_CASACO, 0);
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(mao.x, mao.y, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ---------- GRAMA E OBJETOS ----------
function ruido(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function desenharGrama() {
  const t = performance.now() / 1000;
  const pesX = jogador.x + jogador.w / 2;
  const pesY = jogador.y + jogador.h;

  ctx.strokeStyle = "#050505";
  ctx.lineCap = "round";
  ctx.lineWidth = 1.6;

  for (const p of plataformas) {
    if (p.x + p.w < camera - 20 || p.x > camera + LARGURA + 20) continue;   // fora da tela
    const ini = Math.max(p.x + 2, Math.floor(camera / 4) * 4 - 8);
    const fim = Math.min(p.x + p.w - 2, camera + LARGURA + 8);

    ctx.beginPath();
    for (let x = ini; x <= fim; x += 4) {
      // não nasce grama em cima dos espinhos
      if (espinhos.some((e) => e.y + e.h === p.y && x > e.x - 4 && x < e.x + e.w + 4)) continue;

      const i = Math.round(x / 4);
      const alt = 4 + ruido(i) * 6 + (ruido(i + 5) > 0.85 ? 6 : 0);   // de vez em quando um tufo maior
      let curva = Math.sin(t * 1.6 + i * 0.5) * 1.5 + (ruido(i + 9) - 0.5) * 4;

      // o jogador empurra a grama quando passa
      const perto = Math.abs(x - pesX);
      if (perto < 18 && Math.abs(pesY - p.y) < 6) {
        curva += (x < pesX ? -1 : 1) * (18 - perto) * 0.3;
      }

      ctx.moveTo(x, p.y + 1);
      ctx.quadraticCurveTo(x + curva * 0.3, p.y - alt * 0.6, x + curva, p.y - alt);
    }
    ctx.stroke();
  }
}

// y padrão = 380 (o chão). Correntes usam y: 0 (penduradas no teto).
const objetos = [
  { tipo: "placa",     x: 170 },
  { tipo: "pedra",     x: 290, s: 1 },
  { tipo: "toco",      x: 520 },
  { tipo: "cerca",     x: 740 },
  { tipo: "cogumelos", x: 960 },
  { tipo: "pedra",     x: 1170, s: 0.7 },
  { tipo: "lanterna",  x: 1250 },
  { tipo: "galhos",    x: 1360 },
  { tipo: "corrente",  x: 1530, y: 0, comp: 120 },
  { tipo: "lapide",    x: 1600 },
  { tipo: "toco",      x: 1860 },
  { tipo: "lanterna",  x: 2000 },
  { tipo: "cogumelos", x: 2250 },
  { tipo: "corrente",  x: 2355, y: 0, comp: 150 },
  { tipo: "galhos",    x: 2440 },
  { tipo: "pedra",     x: 2985, s: 0.8 },
];

function desenharObjetos() {
  const t = performance.now() / 1000;

  for (const o of objetos) {
    if (o.x < camera - 120 || o.x > camera + LARGURA + 120) continue;   // fora da tela
    if (o.tipo === "lanterna") { desenharLanterna(o.x); continue; }

    ctx.save();
    ctx.translate(o.x, o.y === undefined ? 380 : o.y);   // (0,0) = base do objeto
    ctx.fillStyle = "#030303";
    ctx.strokeStyle = "#030303";
    ctx.lineCap = "round";

    if (o.tipo === "placa") {
      ctx.rotate(-0.04);
      ctx.fillRect(-2, -36, 4, 36);                       // poste
      ctx.save();
      ctx.translate(0, -42);
      ctx.rotate(0.05);
      ctx.fillRect(-17, -10, 34, 20);                     // tábua
      ctx.strokeStyle = "#2a2a2a";                        // seta desenhada na placa
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(9, 0);
      ctx.moveTo(4, -4);  ctx.lineTo(9, 0); ctx.lineTo(4, 4);
      ctx.stroke();
      ctx.restore();

    } else if (o.tipo === "pedra") {
      const s = o.s || 1;
      ctx.beginPath();
      ctx.moveTo(-14 * s, 1);
      ctx.quadraticCurveTo(-12 * s, -15 * s, -2 * s, -13 * s);
      ctx.quadraticCurveTo(10 * s, -17 * s, 15 * s, 1);
      ctx.closePath();
      ctx.fill();

    } else if (o.tipo === "toco") {
      ctx.beginPath();
      ctx.moveTo(-15, 1);
      ctx.quadraticCurveTo(-9, -6, -8, -22);
      ctx.lineTo(8, -24);
      ctx.quadraticCurveTo(9, -6, 16, 1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";                          // topo cortado
      ctx.beginPath();
      ctx.ellipse(0, -23, 8, 2.5, 0.05, 0, Math.PI * 2);
      ctx.fill();

    } else if (o.tipo === "cerca") {
      const alturas = [34, 28, 36, 22];
      ctx.save();
      ctx.rotate(-0.03);
      ctx.fillRect(-4, -24, 40, 4);                       // travessa (a última tábua caiu)
      ctx.fillRect(52, -22, 18, 4);
      for (let k = 0; k < 4; k++) {
        const px = k * 22;
        ctx.save();
        ctx.translate(px, 0);
        ctx.rotate((k - 1.5) * 0.04);
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(-3, -alturas[k]);
        ctx.lineTo(0, -alturas[k] - 5);                   // ponta da estaca
        ctx.lineTo(3, -alturas[k]);
        ctx.lineTo(3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

    } else if (o.tipo === "galhos") {
      ctx.lineWidth = 1.8;
      for (let k = 0; k < 7; k++) {
        const a = -Math.PI / 2 + (k - 3) * 0.38 + Math.sin(t * 1.2 + k) * 0.03;
        const len = 18 + ruido(o.x + k) * 16;
        const ex = Math.cos(a) * len, ey = Math.sin(a) * len;
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.quadraticCurveTo(ex * 0.3 + (ruido(k) - 0.5) * 6, ey * 0.6, ex, ey);
        ctx.moveTo(ex * 0.6, ey * 0.6);                   // gravetinho
        ctx.lineTo(ex * 0.6 + (k % 2 ? 8 : -8), ey * 0.6 - 6);
        ctx.stroke();
      }

    } else if (o.tipo === "cogumelos") {
      for (const [dx, h, r] of [[-10, 10, 6], [0, 17, 8], [11, 8, 5]]) {
        ctx.fillStyle = "#030303";
        ctx.fillRect(dx - 1.5, -h, 3, h + 1);             // haste
        ctx.shadowColor = paleta.luz;                     // chapéu brilha de leve
        ctx.shadowBlur = 10;
        ctx.fillStyle = rgba(paleta.luz, 0.6);
        ctx.beginPath();
        ctx.ellipse(dx, -h, r, r * 0.6, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

    } else if (o.tipo === "lapide") {
      ctx.rotate(0.05);
      ctx.beginPath();
      ctx.moveTo(-9, 1);
      ctx.lineTo(-9, -26);
      ctx.quadraticCurveTo(0, -38, 9, -26);
      ctx.lineTo(9, 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#2a2a2a";                        // cruz
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -29); ctx.lineTo(0, -14);
      ctx.moveTo(-4, -24); ctx.lineTo(4, -24);
      ctx.stroke();

    } else if (o.tipo === "corrente") {
      ctx.rotate(Math.sin(t * 0.9 + o.x) * 0.04);         // balança como pêndulo
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 1.5;
      const n = Math.floor(o.comp / 7);
      for (let k = 0; k < n; k++) {                       // elos alternados (de frente e de lado)
        ctx.beginPath();
        ctx.ellipse(0, k * 7 + 3.5, k % 2 ? 1.2 : 3, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();                                    // gancho na ponta
      ctx.arc(0, n * 7 + 6, 4, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }
}



// ---------- INSTRUÇÕES (acima da placa) ----------
function desenharInstrucoes() {
  const placa = objetos.find((o) => o.tipo === "placa");
  if (!placa) return;

  // some aos poucos quando o jogador se afasta da placa
  const dist = Math.abs(jogador.x - placa.x);
  const alpha = Math.max(0, Math.min(1, 1 - (dist - 350) / 250));
  if (alpha <= 0) return;

  const linhas = [
    "Setas ou A / D  -  andar",
    "Espaço, W ou seta para cima  -  pular",
    "S ou seta para baixo  -  agachar",
    "R  -  reiniciar",
    "1 a 5  -  trocar a cor do cenário",
  ];

  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  ctx.font = "15px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 6;
  for (let i = 0; i < linhas.length; i++) {
    ctx.fillText(linhas[i], placa.x, 220 + i * 20);   // termina logo acima da placa
  }
  ctx.restore();
}

  function desenhar() {
    // 1) cor de base: apaga o quadro anterior e serve de reserva se a imagem falhar
    const ceu = ctx.createLinearGradient(0, 0, 0, ALTURA);
    ceu.addColorStop(0, paleta.ceuCima);
    ceu.addColorStop(1, paleta.ceuBaixo);
    ctx.fillStyle = ceu;
    ctx.fillRect(0, 0, LARGURA, ALTURA);
  
    // 2) imagem de fundo, andando devagar junto com a câmera
    if (fundo.complete && fundo.naturalWidth > 0) {
      // cobre a altura da tela e fica 30% mais larga que ela (folga para andar)
      const escalaFundo = Math.max(ALTURA / fundo.height, (LARGURA * 1.3) / fundo.width);
      const larguraFundo = fundo.width * escalaFundo;
      const alturaFundo = fundo.height * escalaFundo;
      const progresso = camera / (FIM_DO_MUNDO - LARGURA);   // 0 no início, 1 no fim da fase
      ctx.drawImage(
        fundo,
        -progresso * (larguraFundo - LARGURA),
        (ALTURA - alturaFundo) / 2,
        larguraFundo,
        alturaFundo
      );
    }
  
camadaGalhos(0.3, 0.45, 100, 220);    // fundo, mais apagada
camadaGalhos(0.6, 0.85, 130, 200);  

  // tudo daqui pra baixo se move junto com a câmera
  ctx.save();
  ctx.translate(-Math.round(camera), 0);

  ctx.fillStyle = "#050505";
  for (const p of plataformas) ctx.fillRect(p.x, p.y, p.w, p.h);

  for (const e of espinhos) {               // um triângulo a cada 20 de largura
    for (let x = e.x; x < e.x + e.w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, e.y + e.h);
      ctx.lineTo(x + 10, e.y);
      ctx.lineTo(x + 20, e.y + e.h);
      ctx.fill();
    }
  }

  desenharGrama();
  desenharObjetos();
  desenharInstrucoes();


  // a luz do fim da fase
  ctx.save();
  ctx.shadowColor = paleta.luz;
  ctx.shadowBlur = 40;
  ctx.fillStyle = paleta.luz;
  ctx.fillRect(luz.x, luz.y, luz.w, luz.h);
  ctx.restore();

// número "aleatório" que sempre dá o mesmo resultado para a mesma entrada
// (assim as árvores não ficam tremendo a cada quadro)
function pseudo(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// desenha um galho e vai dividindo em galhos menores
function desenharGalho(x, y, ang, comp, esp, prof, seed) {
  if (prof === 0 || comp < 5) return;
  const x2 = x + Math.cos(ang) * comp;
  const y2 = y + Math.sin(ang) * comp;
  ctx.lineWidth = Math.max(1, esp);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const filhos = pseudo(seed) > 0.6 ? 3 : 2;
  for (let k = 0; k < filhos; k++) {
    const lado = filhos === 3 ? k - 1 : (k === 0 ? -1 : 1);
    const desvio = lado * (0.3 + pseudo(seed + k * 7) * 0.45);
    desenharGalho(
      x2, y2,
      ang + desvio,
      comp * (0.62 + pseudo(seed + k * 3) * 0.15),
      esp * 0.65,
      prof - 1,
      seed + k * 13 + 1
    );
  }
}

// árvores com tronco afinando e galhos ramificados
function camadaGalhos(velocidade, opacidade, espaco, alturaBase) {
  ctx.globalAlpha = opacidade;
  ctx.fillStyle = paleta.arvore;
  ctx.strokeStyle = paleta.arvore;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 0; i < 30; i++) {
    const x = i * espaco + (i % 3) * 20 - camera * velocidade;
    if (x < -160 || x > LARGURA + 160) continue;   // fora da tela, nem desenha

    const altura = alturaBase * 0.8 + pseudo(i) * 120;
    const largura = 10 + pseudo(i + 50) * 8;
    const inclina = (pseudo(i + 9) - 0.5) * 14;     // tronco levemente torto
    const baseY = ALTURA;
    const topoX = x + largura / 2 + inclina;
    const topoY = ALTURA - altura;

    // tronco: trapézio, grosso embaixo e fino em cima
    ctx.beginPath();
    ctx.moveTo(x - 3, baseY);
    ctx.lineTo(x + largura + 3, baseY);
    ctx.lineTo(topoX + 2, topoY);
    ctx.lineTo(topoX - 2, topoY);
    ctx.closePath();
    ctx.fill();

    // galhos laterais ao longo do tronco
    for (let j = 0; j < 5; j++) {
      const t = 0.35 + j * 0.13;                    // altura no tronco (0 base, 1 topo)
      const gx = x + largura / 2 + inclina * t;
      const gy = baseY - altura * t;
      const lado = (i + j) % 2 === 0 ? -1 : 1;
      const ang = -Math.PI / 2 + lado * (0.7 + pseudo(i * 5 + j) * 0.5);
      desenharGalho(gx, gy, ang, 22 + pseudo(i + j * 11) * 22, 3.5 - j * 0.4, 3, i * 31 + j * 17);
    }

    // copa: o topo se abre em galhos finos
    desenharGalho(topoX, topoY, -Math.PI / 2, 26 + pseudo(i + 3) * 14, 3.5, 4, i * 97);
  }
  ctx.globalAlpha = 1;
}
  desenharLanterna(75);
  desenharBoneco()
  desenharMonstro()

  
  ctx.restore();
  


  ctx.fillStyle = vinheta;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "16px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("Mortes: " + mortes, 16, 28);

  if (estado === "morto") {
    ctx.fillStyle = "rgba(0,0,0," + Math.min(1, 1.2 - contador / 50) + ")";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
  }
  if (estado === "venceu") {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    textoCentral("Você chegou à luz.", ALTURA / 2 - 6, 34);
    textoCentral("Aperte Enter para jogar de novo", ALTURA / 2 + 30, 18);
  }


}

// =====================================================
// 8. LOOP PRINCIPAL (roda ~60 vezes por segundo)
//    "dt" ajusta a velocidade para ficar igual em qualquer monitor
// =====================================================
let ultimo = 0;


function loop(agora) {
  const dt = Math.min((agora - ultimo) / 16.667, 2);
  ultimo = agora;

  atualizar(dt);

  // O monstro é atualizado independentemente do estado do jogador.
  

  desenhar();

  requestAnimationFrame(loop);
}


reiniciar();

requestAnimationFrame((t) => {
  ultimo = t;
  loop(t);
})
