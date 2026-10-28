// =====================================================
// CAVERNA + CHÃO FALSO (fase 4)
//   plataforma com  falso: true  parece chão normal, mas desmorona quando o jogador pisa.
//   A fase precisa de  caverna: { poco, tunel, piso }  para desenhar o fundo.
// =====================================================

let entulho = [];   // pedaços do chão caindo

// Chamada por reiniciar(): devolve o chão falso e limpa o entulho.
function aoReiniciar() {
  plataformas = faseAtual.plataformas.slice();   // cópia: o chão falso pode sumir sem alterar a fase
  for (const p of faseAtual.plataformas) delete p.cai;
  entulho = [];
}

function desmoronar(p) {
  for (let x = p.x; x < p.x + p.w; x += 14) {
    for (let y = p.y; y < p.y + p.h; y += 20) {
      const w = 10 + Math.random() * 10;
      entulho.push({
        x: x + 2 + Math.random() * 4,
        y: y,
        w: w,
        h: 10 + Math.random() * 12,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 1.5,
        rot: 0,
        vr: (Math.random() - 0.5) * 0.12,
        lo: p.x + 2,
        hi: p.x + p.w - w - 2,
        parado: false,
      });
    }
  }
}

function atualizarFalsos(dt) {
  const cx = jogador.x + jogador.w / 2;
  const pes = jogador.y + jogador.h;

  for (const p of plataformas.slice()) {
    if (!p.falso) continue;
    if (p.cai === undefined) {
      // gatilho: pés no chão falso e o meio do corpo em cima dele
      if (jogador.noChao && Math.abs(pes - p.y) < 2 && cx > p.x + 24 && cx < p.x + p.w - 24) {
        p.cai = p.atraso === undefined ? 6 : p.atraso;
      }
    } else {
      p.cai -= dt;
      if (p.cai <= 0) {
        desmoronar(p);
        plataformas.splice(plataformas.indexOf(p), 1);
        jogador.noChao = false;
      }
    }
  }

  for (const e of entulho) {
    if (e.parado) continue;
    e.vy += GRAVIDADE * dt;
    e.x = Math.min(Math.max(e.x + e.vx * dt, e.lo), e.hi);
    e.y += e.vy * dt;
    e.rot += e.vr * dt;
    const solo = chaoAbaixo(e.x + e.w / 2, e.y + e.h - 4);
    if (e.y + e.h >= solo) {                      // chegou no fundo: fica na pilha
      e.y = solo - e.h;
      e.vx = e.vy = e.vr = 0;
      e.rot = 0;
      e.parado = true;
    }
  }
}

function desenharEntulho() {
  ctx.save();
  ctx.fillStyle = "#070707";
  ctx.strokeStyle = "#1d1d1d";
  ctx.lineWidth = 1;
  for (const e of entulho) {
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    ctx.rotate(e.rot);
    ctx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
    ctx.strokeRect(-e.w / 2, -e.h / 2, e.w, e.h);
    ctx.restore();
  }
  ctx.restore();
}

// Interior oco do poço e do túnel (desenhado ANTES das plataformas pretas)
function desenharCaverna() {
  const c = faseAtual.caverna;
  if (!c) return;
  const poco = c.poco, tun = c.tunel;
  const t = performance.now() / 1000;

  ctx.save();

  // o vazio
  const g = ctx.createLinearGradient(0, poco.y, 0, c.piso);
  g.addColorStop(0, "#14161a");
  g.addColorStop(1, "#08090b");
  ctx.fillStyle = g;
  ctx.fillRect(poco.x, poco.y, poco.w, c.piso - poco.y);
  ctx.fillRect(tun.x, tun.y, tun.w, c.piso - tun.y);

  // luz que entra pelo buraco
  ctx.fillStyle = rgba(paleta.luz, 0.07);
  ctx.beginPath();
  ctx.moveTo(poco.x + 10, poco.y);
  ctx.lineTo(poco.x + poco.w - 10, poco.y);
  ctx.lineTo(poco.x + poco.w + 120, c.piso);
  ctx.lineTo(poco.x + 160, c.piso);
  ctx.closePath();
  ctx.fill();

  // estalactites no teto do túnel (menos onde o teto desce)
  ctx.fillStyle = "#050505";
  for (let x = tun.x + 30; x < tun.x + tun.w; x += 70) {
    if (plataformas.some((p) => p.y === tun.y && x > p.x - 20 && x < p.x + p.w + 20)) continue;
    const h = 14 + ruido(x) * 30;
    ctx.beginPath();
    ctx.moveTo(x - 8, tun.y);
    ctx.lineTo(x + 8, tun.y);
    ctx.lineTo(x + (ruido(x + 1) - 0.5) * 4, tun.y + h);
    ctx.closePath();
    ctx.fill();
  }

  // gotas caindo do teto
  ctx.fillStyle = "rgba(190,205,215,0.55)";
  for (let k = 0; k < 5; k++) {
    const gx = tun.x + 150 + k * 270;
    const f = ((t + k * 0.83) % 2.8) / 2.8;
    const gy = tun.y + 24 + f * f * (c.piso - tun.y - 30);
    ctx.fillRect(gx, gy, 1.6, 4);
  }

  ctx.restore();
}