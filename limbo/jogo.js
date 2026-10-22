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
    if (estado === "jogando" && olhoPegouJogador()) morrer();
}


// Vinheta escura nas bordas da tela.
const vinheta = ctx.createRadialGradient(LARGURA / 2, ALTURA / 2, 150, LARGURA / 2, ALTURA / 2, 480);
vinheta.addColorStop(0, "rgba(0,0,0,0)");
vinheta.addColorStop(1, "rgba(0,0,0,0.65)");

function desenhar() {
  // Fundo com gradiente.
  const ceu = ctx.createLinearGradient(0, 0, 0, ALTURA);
  ceu.addColorStop(0, paleta.ceuCima);
  ceu.addColorStop(1, paleta.ceuBaixo);
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  // Imagem de fundo opcional (fundo.png).
  if (fundo.complete && fundo.naturalWidth > 0) {
    const escalaFundo = Math.max(ALTURA / fundo.height, (LARGURA * 1.3) / fundo.width);
    const larguraFundo = fundo.width * escalaFundo;
    const alturaFundo = fundo.height * escalaFundo;
    const progresso = camera / (FIM_DO_MUNDO - LARGURA);
    ctx.drawImage(fundo, -progresso * (larguraFundo - LARGURA), (ALTURA - alturaFundo) / 2, larguraFundo, alturaFundo);
  }

  // Árvores em camadas, com efeito de profundidade.
  camadaGalhos(0.3, 0.45, 100, 220);
  camadaGalhos(0.6, 0.85, 130, 200);

  // Elementos que acompanham a câmera.
  ctx.save();
  ctx.translate(-Math.round(camera), 0);
  ctx.fillStyle = "#050505";
  for (const p of plataformas) ctx.fillRect(p.x, p.y, p.w, p.h);

  for (const e of espinhos) {
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

  // Luz que marca o fim da fase.
  ctx.save();
  ctx.shadowColor = paleta.luz;
  ctx.shadowBlur = 40;
  ctx.fillStyle = paleta.luz;
  ctx.fillRect(luz.x, luz.y, luz.w, luz.h);
  ctx.restore();

  desenharLanterna(75);
  desenharBoneco();
  desenharAbrigos();
  desenharMonstro();
  ctx.restore();

  // Vinheta e contador de mortes ficam fixos na tela.
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
