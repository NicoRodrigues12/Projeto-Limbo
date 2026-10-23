// =====================================================
// FASES
//   Cada fase é um objeto com tudo que muda de uma para outra.
//   Tudo é um retângulo: x, y (canto de cima), w (largura), h (altura)
//   O chão fica sempre em y = 380 (vários arquivos contam com isso).
// =====================================================

// As cores do cenário. Aperte 1 a 6 no jogo para trocar.
const PALETAS = [
  { ceuCima: "#5f6163", ceuBaixo: "#bdbfc0", arvore: "#2a2a2a", luz: "#ffffff" },  // 1 cinza
  { ceuCima: "#1f3a36", ceuBaixo: "#6f9c92", arvore: "#0c1f1b", luz: "#bffff0" },  // 2 verde
  { ceuCima: "#3a1f12", ceuBaixo: "#c27a3c", arvore: "#1e0c05", luz: "#ffd9a0" },  // 3 âmbar
  { ceuCima: "#1b1a3a", ceuBaixo: "#5c5aa8", arvore: "#0a081e", luz: "#d6d0ff" },  // 4 roxo
  { ceuCima: "#0c1d3a", ceuBaixo: "#3a6fb0", arvore: "#050a19", luz: "#c8e4ff" },  // 5 azul
  { ceuCima: "#2b2a2e", ceuBaixo: "#8a8478", arvore: "#121114", luz: "#f2e6cf" },  // 6 cinzas
  { ceuCima: "#1a1618", ceuBaixo: "#b5683f", arvore: "#0d0a0b", luz: "#ffd2a8" },  // 7 pôr do sol em ruínas
];
let paleta = PALETAS[0];

const FASES = [
  // ---------------------------------------------------
  // FASE 1: floresta
  // ---------------------------------------------------
  {
    nome: "Floresta",
    cenario: "floresta",
    paleta: 0,
    fim: 3100,

    plataformas: [
      // --- trecho 1: introdução ---
      { x: 0,    y: 380, w: 600, h: 100 },  // chão 1
      { x: 380,  y: 340, w: 40,  h: 40 },   // caixa para o primeiro pulo

      // --- trecho 2: buraco + plataforma no ar ---
      { x: 700,  y: 380, w: 500, h: 100 },  // chão 2 (buraco de 100 antes)
      { x: 880,  y: 300, w: 120, h: 20 },   // plataforma no ar

      // --- trecho 3: espinhos no chão ---
      { x: 1300, y: 380, w: 400, h: 100 },  // chão 3

      // --- trecho 4: escadinha ---
      { x: 1800, y: 380, w: 500, h: 100 },  // chão 4
      { x: 1900, y: 340, w: 60,  h: 40 },   // degrau 1
      { x: 1960, y: 300, w: 60,  h: 80 },   // degrau 2
      { x: 2020, y: 260, w: 60,  h: 120 },  // degrau 3

      // --- trecho 5: caixa, espinhos, túnel baixo e a luz ---
      { x: 2410, y: 380, w: 690, h: 100 },  // chão 5 (buraco de 110 antes)
      { x: 2480, y: 340, w: 40,  h: 40 },   // caixa
      { x: 2700, y: 150, w: 160, h: 186 },  // túnel baixo: só passa agachado
    ],

    espinhos: [
      { x: 1060, y: 360, w: 60, h: 20 },
      { x: 1440, y: 360, w: 60, h: 20 },
      { x: 2140, y: 360, w: 60, h: 20 },
      { x: 2560, y: 360, w: 60, h: 20 },
      { x: 2900, y: 360, w: 60, h: 20 },
    ],

    luz: { x: 3040, y: 290, w: 10, h: 90 },

    // y padrão = 380 (o chão). Correntes usam y: 0 (penduradas no teto).
    objetos: [
      { tipo: "placa",     x: 170 },
      { tipo: "pedra",     x: 290, s: 1 },
      { tipo: "moita",     x: 330 },
      { tipo: "toco",      x: 520 },
      { tipo: "muro",      x: 545 },
      { tipo: "cerca",     x: 740 },
      { tipo: "tronco",    x: 900 },
      { tipo: "cogumelos", x: 960 },
      { tipo: "rochedo",   x: 1160 },
      { tipo: "pedra",     x: 1170, s: 0.7 },
      { tipo: "lanterna",  x: 1250 },
      { tipo: "galhos",    x: 1315 },
      { tipo: "moita",     x: 1385 },
      { tipo: "corrente",  x: 1530, y: 0, comp: 120 },
      { tipo: "tronco",    x: 1620 },
      { tipo: "lapide",    x: 1688 },
      { tipo: "muro",      x: 1848 },
      { tipo: "lanterna",  x: 2000 },
      { tipo: "toco",      x: 2110 },
      { tipo: "rochedo",   x: 2250 },
      { tipo: "corrente",  x: 2355, y: 0, comp: 150 },
      { tipo: "moita",     x: 2462 },
      { tipo: "cogumelos", x: 2540 },
      { tipo: "galhos",    x: 2650 },
      { tipo: "rochedo",   x: 3000 },
      { tipo: "pedra",     x: 3070, s: 0.8 },
    ],
  },

  // ---------------------------------------------------
  // FASE 2: cidade abandonada
  // ---------------------------------------------------
  {
    nome: "Cidade",
    cenario: "cidade",
    paleta: 6,
    fim: 4700,

    plataformas: [
      // --- trecho 1: rua de entrada ---
      { x: 0,    y: 380, w: 760, h: 100 },

      // --- trecho 2: van como degrau, vergalhões depois ---
      { x: 860,  y: 380, w: 540, h: 100, invisivel : true},  // buraco de 100 antes
      { x: 1000, y: 340, w: 100, h: 40, invisivel : true},   // van (objeto "van" em x: 1050)

      // --- trecho 3: o ônibus ---
      { x: 1510, y: 380, w: 990, h: 100 },  // buraco de 110 antes
      { x: 1750, y: 340, w: 40,  h: 40 },   // caixote para subir no teto
      { x: 1820, y: 276, w: 420, h: 14 },   // teto do ônibus (objeto "onibus" em x: 1820)
      { x: 1900, y: 366, w: 34,  h: 14 },   // bancos (x = ônibus + 80, + 220, + 330)
      { x: 2040, y: 366, w: 34,  h: 14 },
      { x: 2150, y: 366, w: 34,  h: 14 },

      // --- trecho 4: vala ---
      { x: 2610, y: 410, w: 300, h: 100 },  // 30 mais baixa (buraco de 110 antes)

      // --- trecho 5: laje levantada e laje desabada ---
      { x: 2910, y: 380, w: 790, h: 100 },
      { x: 3040, y: 350, w: 110, h: 30 },   // laje levantada
      { x: 3400, y: 150, w: 160, h: 186 },  // laje desabada: só passa agachado

      // --- trecho 6: reta final ---
      { x: 3800, y: 380, w: 900, h: 100 },  // buraco de 100 antes
      { x: 4000, y: 290, w: 140, h: 20 },   // viga no ar
      { x: 4400, y: 340, w: 40,  h: 40 },   // caixote
    ],

    espinhos: [   // vergalhões e cacos
      { x: 1140, y: 360, w: 60, h: 20 },    // depois da van
      { x: 1630, y: 360, w: 60, h: 20 },    // antes do ônibus
      { x: 2000, y: 256, w: 60, h: 20 },    // em cima do teto do ônibus
      { x: 2740, y: 390, w: 60, h: 20 },    // dentro da vala
      { x: 3200, y: 360, w: 60, h: 20 },    // antes da laje desabada
      { x: 4170, y: 360, w: 60, h: 20 },    // depois da viga
      { x: 4500, y: 360, w: 60, h: 20 },    // depois do caixote
    ],

    luz: { x: 4640, y: 290, w: 10, h: 90 },

    // y padrão = 380 (o chão). Objetos na vala usam y: 410.
    objetos: [
      // trecho 1
      { tipo: "poste",          x: 130 },
      { tipo: "lixeira",        x: 240 },
      { tipo: "lixeiraTombada", x: 330 },
      { tipo: "pneus",          x: 430 },
      { tipo: "muro",           x: 570 },                 // abrigo
      { tipo: "escombros",      x: 700 },
      // trecho 2
      { tipo: "fio",            x: 880, y: 0, comp: 220 },
      { tipo: "carro",          x: 1050 },                // x = centro (plataforma 1000..1100)           // combina com a plataforma 1000..1100
      { tipo: "carrinho",       x: 1240 },
      { tipo: "rochedo",        x: 1320 },                // abrigo (bloco de concreto)
      // trecho 3
      { tipo: "semaforo",       x: 1560 },
      { tipo: "escombros",      x: 1720 },
      { tipo: "onibus",         x: 1820, w: 420 },         // x = ponta esquerda do ônibus
      { tipo: "lixeira",        x: 2300 },
      { tipo: "muro",           x: 2420 },                // abrigo
      // vala
      { tipo: "escombros",      x: 2660, y: 410 },
      { tipo: "pneus",          x: 2860, y: 410 },
      // trecho 5
      { tipo: "poste",          x: 2970 },
      { tipo: "fio",            x: 3000, y: 0, comp: 200 },
      { tipo: "carrinho",       x: 3340 },
      { tipo: "predio",         x: 3400, w: 160 },         // x = ponta esquerda, igual à plataforma
      { tipo: "ponto",          x: 3600 },
      { tipo: "lixeiraTombada", x: 3665 },
      // trecho 6
      { tipo: "poste",          x: 3860 },
      { tipo: "escombros",      x: 3930 },
      { tipo: "lixeira",        x: 4290 },
      { tipo: "rochedo",        x: 4340 },                // abrigo
      { tipo: "semaforo",       x: 4470 },
      { tipo: "pneus",          x: 4590 },

      { tipo: "semaforo",       x: 4470 },
      { tipo: "pneus",          x: 4590 },

      { tipo: "poste",          x: 960 },
      { tipo: "poste",          x: 2360 },
    ],
  },
];
    

// O que a fase atual está usando (preenchido por carregarFase)
let faseAtual;
let numeroFase = 0;
let FIM_DO_MUNDO, plataformas, espinhos, luz, objetos;

function carregarFase(n) {
  numeroFase = n;
  faseAtual = FASES[n];
  FIM_DO_MUNDO = faseAtual.fim;
  plataformas = faseAtual.plataformas;
  espinhos = faseAtual.espinhos;
  luz = faseAtual.luz;
  objetos = faseAtual.objetos;
  paleta = PALETAS[faseAtual.paleta];
}