// CONFIGURAÇÕES GERAIS DO CANVAS E DO JOGO
const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");
const LARGURA = canvas.width;
const ALTURA = canvas.height;

const GRAVIDADE = 0.6;
const VELOCIDADE = 4.6;
const FORCA_PULO = -12;
const ESCALA = 2;

let depurar = false;

const fundo = new Image();
fundo.src = "fundo.png";


// Pontuação: começa em 20000 e cada morte tira um pouco (nunca fica abaixo de 0)
const PONTOS_INICIAIS = 20000;
const PONTOS_POR_MORTE = 250;

function pontos() {
  return Math.max(0, PONTOS_INICIAIS - mortes * PONTOS_POR_MORTE);
}