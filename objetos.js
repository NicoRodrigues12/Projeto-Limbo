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
  { tipo: "moita",   x: 330 },
  { tipo: "muro",    x: 545 },
  { tipo: "tronco",  x: 900 },
  { tipo: "rochedo", x: 1160 },
  { tipo: "moita",   x: 1385 },
  { tipo: "tronco",  x: 1620 },
  { tipo: "muro",    x: 1848 },
  { tipo: "rochedo", x: 2250 },
  { tipo: "moita",   x: 2462 },
  { tipo: "rochedo", x: 3000 },
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

// Objetos grandes o bastante para esconder o jogador agachado.
// w e h = área protegida (o desenho é um pouco maior). O x do objeto é o centro dele.
const TAMANHO_ABRIGO = {
  rochedo: { w: 54, h: 40 },
  tronco:  { w: 90, h: 40 },
  muro:    { w: 80, h: 42 },
  moita:   { w: 60, h: 38 },
};

// O jogador está escondido do olho?
function escondido() {
  if (!jogador.agachado || !jogador.noChao) return false;

  // 1) atrás de um objeto grande o bastante para cobrir o jogador agachado
  for (const o of objetos) {
    const tam = TAMANHO_ABRIGO[o.tipo];
    if (!tam || tam.h < jogador.h) continue;
    const dentro = jogador.x >= o.x - tam.w / 2 && jogador.x + jogador.w <= o.x + tam.w / 2;
    const noMesmoChao = Math.abs(jogador.y + jogador.h - 380) < 4;
    if (dentro && noMesmoChao) return true;
  }

  // 2) embaixo de um teto (o túnel baixo ou uma plataforma no ar)
  return plataformas.some((p) =>
    p.y + p.h <= jogador.y + 2 &&
    jogador.x >= p.x && jogador.x + jogador.w <= p.x + p.w
  );
}

// Os abrigos são desenhados DEPOIS do boneco, para ele parecer estar atrás deles.
function desenharAbrigos() {
  const t = performance.now() / 1000;

  for (const o of objetos) {
    if (!TAMANHO_ABRIGO[o.tipo]) continue;
    if (o.x < camera - 120 || o.x > camera + LARGURA + 120) continue;   // fora da tela

    ctx.save();
    ctx.translate(o.x, 380);          // (0,0) = base do objeto, no chão
    ctx.fillStyle = "#030303";
    ctx.strokeStyle = "#030303";
    ctx.lineCap = "round";

    if (o.tipo === "rochedo") {
      ctx.beginPath();
      ctx.moveTo(-38, 1);
      ctx.lineTo(-38, -22);
      ctx.quadraticCurveTo(-36, -46, -16, -50);
      ctx.quadraticCurveTo(0, -56, 16, -50);
      ctx.quadraticCurveTo(36, -44, 38, -22);
      ctx.lineTo(38, 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1f1f1f";                        // rachaduras
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, -50); ctx.lineTo(-10, -34); ctx.lineTo(-4, -22);
      ctx.moveTo(14, -48); ctx.lineTo(18, -30);
      ctx.stroke();

    } else if (o.tipo === "tronco") {
      ctx.beginPath();
      ctx.moveTo(-54, 1);
      ctx.quadraticCurveTo(-58, -20, -52, -42);
      ctx.lineTo(50, -42);
      ctx.quadraticCurveTo(56, -20, 52, 1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";                          // ponta cortada, com anéis
      ctx.beginPath();
      ctx.ellipse(51, -21, 5, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(51, -21, 2.5, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#030303";                        // tocos de galhos quebrados
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-26, -40); ctx.lineTo(-32, -58);
      ctx.moveTo(10, -41);  ctx.lineTo(16, -56);
      ctx.stroke();

    } else if (o.tipo === "muro") {
      ctx.beginPath();                                    // topo todo quebrado
      ctx.moveTo(-45, 1);
      ctx.lineTo(-45, -48); ctx.lineTo(-32, -50); ctx.lineTo(-28, -60); ctx.lineTo(-12, -58);
      ctx.lineTo(-8, -48);  ctx.lineTo(8, -52);   ctx.lineTo(14, -46);  ctx.lineTo(30, -48);
      ctx.lineTo(34, -42);  ctx.lineTo(45, -44);  ctx.lineTo(45, 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1c1c1c";                        // juntas dos tijolos
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let y = -12; y > -48; y -= 12) { ctx.moveTo(-45, y); ctx.lineTo(45, y); }
      ctx.moveTo(-22, -12); ctx.lineTo(-22, -24);
      ctx.moveTo(12, -24);  ctx.lineTo(12, -36);
      ctx.moveTo(-6, -36);  ctx.lineTo(-6, -48);
      ctx.stroke();

    } else if (o.tipo === "moita") {
      for (let k = 0; k < 5; k++) {                       // folhagem feita de várias bolhas
        ctx.beginPath();
        ctx.ellipse(-34 + k * 17, -20 - (k % 2) * 8, 20, 24, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillRect(-48, -14, 96, 15);
      ctx.lineWidth = 1.6;                                // gravetos balançando
      for (let k = 0; k < 9; k++) {
        const bx = -40 + k * 10;
        const topo = -44 - (k % 3) * 4;
        ctx.beginPath();
        ctx.moveTo(bx, topo + 10);
        ctx.lineTo(bx + Math.sin(t * 1.5 + k) * 2, topo - 6);
        ctx.stroke();
      }
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
