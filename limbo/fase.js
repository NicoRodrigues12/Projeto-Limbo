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

