// casa.js - Fase 3 (casa mal-assombrada): desenho da casa, dos detalhes dos degraus e da decoração.
// Os DADOS da fase (plataformas, espinhos, luz, objetos) ficam em fase.js, na terceira entrada de FASES.
// A casa começa em x = 800 e vai até x = 1600: quando a câmera chega no fim, ela ocupa a tela inteira.
const CASA_X = 800;

// ---------- CENÁRIO DA CASA (desenhado ANTES das plataformas) ----------
function janela(x, y) {   // x, y = canto de cima à esquerda; 44 x 70
  ctx.save();
  ctx.shadowColor = "#ff9a3c";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "rgba(255,160,60,0.5)";
  ctx.beginPath();
  ctx.moveTo(x, y + 70); ctx.lineTo(x, y + 20);
  ctx.quadraticCurveTo(x + 22, y - 10, x + 44, y + 20);
  ctx.lineTo(x + 44, y + 70);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#050505";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 4); ctx.lineTo(x + 22, y + 70);
  ctx.moveTo(x, y + 38);     ctx.lineTo(x + 44, y + 38);
  ctx.stroke();
  ctx.restore();
}

function desenharCasa() {
  const X = CASA_X, W = 800;

  // parede de dentro, com papel de parede listrado
  const g = ctx.createLinearGradient(0, 0, 0, 380);
  g.addColorStop(0, "#120c18");
  g.addColorStop(1, "#261b2d");
  ctx.fillStyle = g;
  ctx.fillRect(X, 0, W, 380);
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let x = X + 20; x < X + W; x += 40) ctx.fillRect(x, 0, 14, 380);

  for (const [wx, wy] of [[840, 95], [1000, 95], [1180, 40], [1300, 40]]) janela(wx, wy);

  // telhado e vigas
  ctx.fillStyle = "#07040a";
  ctx.beginPath();
  ctx.moveTo(X - 20, 40); ctx.lineTo(X + W / 2, -30); ctx.lineTo(X + W + 20, 40);
  ctx.lineTo(X + W + 20, -40); ctx.lineTo(X - 20, -40);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#07040a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let k = 1; k <= 5; k++) { ctx.moveTo(X + W / 2, -30); ctx.lineTo(X + k * 133, 55 - Math.abs(3 - k) * 4); }
  ctx.stroke();

  // parede da esquerda (a entrada fica aberta no térreo)
  ctx.fillStyle = "#050505";
  ctx.fillRect(X - 14, 0, 14, 300);

  // ponte: postes e cordas
  ctx.strokeStyle = "#050505";
  ctx.lineWidth = 3;
  for (const x of [330, 425, 515, 585, 680, 770]) { ctx.beginPath(); ctx.moveTo(x, 380); ctx.lineTo(x, 338); ctx.stroke(); }
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(330, 338); ctx.quadraticCurveTo(422, 360, 515, 338);
  ctx.moveTo(585, 338); ctx.quadraticCurveTo(677, 360, 770, 338);
  ctx.stroke();
}

// ---------- DETALHES DOS DEGRAUS (desenhados DEPOIS das plataformas) ----------
function desenharDetalhesCasa() {
  ctx.strokeStyle = "#2f2536";
  ctx.lineWidth = 1.5;
  for (const p of plataformas) {
    if (!p.tipo) continue;
    ctx.beginPath();
    if (p.tipo === "caixote") { ctx.rect(p.x + 3, p.y + 3, p.w - 6, p.h - 6); ctx.moveTo(p.x + 3, p.y + 3); ctx.lineTo(p.x + p.w - 3, p.y + p.h - 3); }
    if (p.tipo === "bau")     { ctx.moveTo(p.x, p.y + 12); ctx.lineTo(p.x + p.w, p.y + 12); ctx.rect(p.x + p.w / 2 - 4, p.y + 8, 8, 10); }
    if (p.tipo === "comoda")  { ctx.moveTo(p.x, p.y + p.h / 2); ctx.lineTo(p.x + p.w, p.y + p.h / 2); ctx.moveTo(p.x + p.w / 2 - 4, p.y + 8); ctx.lineTo(p.x + p.w / 2 + 4, p.y + 8); }
    if (p.tipo === "barril")  { ctx.moveTo(p.x, p.y + 12); ctx.lineTo(p.x + p.w, p.y + 12); ctx.moveTo(p.x, p.y + p.h - 12); ctx.lineTo(p.x + p.w, p.y + p.h - 12); }
    ctx.stroke();
  }
}

// ---------- DECORAÇÃO E ARMÁRIO ----------
const TIPOS_DECOR = ["abobora", "candelabro", "teia", "quadro", "lustre", "morcego", "armario"];

function desenharDecoracaoCasa() {
  const t = performance.now() / 1000;

  for (const o of objetos) {
    if (!TIPOS_DECOR.includes(o.tipo)) continue;
    if (o.x < camera - 120 || o.x > camera + LARGURA + 120) continue;   // fora da tela

    ctx.save();
    ctx.translate(o.x, o.y === undefined ? 380 : o.y);   // (0,0) = base do objeto
    ctx.fillStyle = "#030303";
    ctx.strokeStyle = "#030303";
    ctx.lineCap = "round";
    const pisca = 0.8 + Math.sin(t * 9 + o.x) * 0.1 + Math.sin(t * 5.3 + o.x) * 0.1;

    if (o.tipo === "abobora") {
      ctx.fillStyle = "#3a1a06";
      ctx.beginPath(); ctx.ellipse(0, -12, 15, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#030303"; ctx.fillRect(-1.5, -27, 3, 6);                 // cabinho
      ctx.shadowColor = "#ff9a3c"; ctx.shadowBlur = 14 * pisca;
      ctx.fillStyle = "rgba(255,179,71," + pisca + ")";                          // rosto aceso
      ctx.beginPath();
      ctx.moveTo(-9, -15); ctx.lineTo(-4, -15); ctx.lineTo(-6.5, -21);
      ctx.moveTo(4, -15);  ctx.lineTo(9, -15);  ctx.lineTo(6.5, -21);
      ctx.moveTo(-8, -9); ctx.lineTo(-4, -6); ctx.lineTo(-1, -9); ctx.lineTo(2, -6); ctx.lineTo(5, -9); ctx.lineTo(8, -8); ctx.lineTo(5, -3); ctx.lineTo(-5, -3);
      ctx.fill();

    } else if (o.tipo === "candelabro") {
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -30); ctx.moveTo(-9, -38); ctx.quadraticCurveTo(-9, -30, 0, -30); ctx.quadraticCurveTo(9, -30, 9, -38); ctx.stroke();
      ctx.fillRect(-8, -2, 16, 3);
      for (const [dx, dy] of [[-9, -38], [0, -42], [9, -38]]) {
        ctx.fillStyle = "#1d1814"; ctx.fillRect(dx - 2, dy - 10, 4, 10);
        ctx.shadowColor = "#ffb347"; ctx.shadowBlur = 12;
        ctx.fillStyle = "rgba(255,207,107," + pisca + ")";
        ctx.beginPath(); ctx.ellipse(dx, dy - 14, 2, 4 * pisca, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

    } else if (o.tipo === "teia") {
      if (o.espelho) ctx.scale(-1, 1);
      ctx.strokeStyle = "rgba(225,225,225,0.35)";
      ctx.lineWidth = 1;
      for (let k = 0; k <= 4; k++) { const a = k * Math.PI / 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 58, Math.sin(a) * 58); ctx.stroke(); }
      for (let r = 14; r <= 58; r += 14) { ctx.beginPath(); ctx.arc(0, 0, r, 0.05, Math.PI / 2 - 0.05); ctx.stroke(); }

    } else if (o.tipo === "quadro") {
      ctx.rotate(((o.x % 3) - 1) * 0.06);                // sempre meio torto
      ctx.beginPath(); ctx.moveTo(-14, -26); ctx.lineTo(0, -38); ctx.lineTo(14, -26); ctx.lineWidth = 1; ctx.stroke();
      ctx.fillRect(-20, -26, 40, 52);
      ctx.fillStyle = "#1e1624"; ctx.fillRect(-16, -22, 32, 44);
      ctx.fillStyle = "#08050b"; ctx.beginPath(); ctx.ellipse(0, -2, 11, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "#fff"; ctx.shadowBlur = 6; ctx.fillStyle = "#fff";   // retrato com olhos que brilham
      ctx.fillRect(-7, -6, 3, 5); ctx.fillRect(4, -6, 3, 5);

    } else if (o.tipo === "lustre") {
      ctx.rotate(Math.sin(t * 0.8) * 0.03);               // balança pendurado no teto
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, o.comp); ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, o.comp, 28, 7, 0, 0, Math.PI * 2); ctx.stroke();
      for (const dx of [-24, -12, 0, 12, 24]) {
        ctx.shadowColor = "#ffb347"; ctx.shadowBlur = 12;
        ctx.fillStyle = "rgba(255,207,107," + pisca + ")";
        ctx.beginPath(); ctx.ellipse(dx, o.comp - 10, 2, 4 * pisca, 0, 0, Math.PI * 2); ctx.fill();
      }

    } else if (o.tipo === "morcego") {
      const f = Math.sin(t * 9 + o.x) * 6;                // bate as asas
      ctx.translate(Math.sin(t * 0.6 + o.x) * 15, Math.sin(t * 1.1 + o.x) * 6);
      for (const d of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(d * 8, -10 - f, d * 22, -4 + f);
        ctx.quadraticCurveTo(d * 15, 0, d * 11, 4);
        ctx.quadraticCurveTo(d * 6, 1, 0, 6);
        ctx.fill();
      }
      ctx.beginPath(); ctx.ellipse(0, 2, 3, 5, 0, 0, Math.PI * 2); ctx.fill();

    } else if (o.tipo === "armario") {
      ctx.fillStyle = "#0d0807";
      ctx.fillRect(-26, -62, 52, 60);                      // corpo
      ctx.fillRect(-30, -68, 60, 7);                       // coroa
      ctx.fillRect(-24, -2, 6, 3); ctx.fillRect(18, -2, 6, 3);   // pés
      ctx.strokeStyle = "#2b1e1a"; ctx.lineWidth = 1.5;
      ctx.strokeRect(-22, -56, 19, 50); ctx.strokeRect(3, -56, 19, 50);   // portas
      ctx.fillStyle = "#5a4a34";
      ctx.beginPath(); ctx.arc(-6, -32, 2, 0, Math.PI * 2); ctx.arc(7, -32, 2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }
}