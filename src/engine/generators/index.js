import * as simboloSignificado from './simboloSignificado.js';
import * as significadoSimbolo from './significadoSimbolo.js';
import * as corSignificado from './corSignificado.js';
import * as cartaNaipe from './cartaNaipe.js';
import * as cartaKeywords from './cartaKeywords.js';
import * as numeroTema from './numeroTema.js';
import * as pareamento from './pareamento.js';
import * as naipeSignificado from './naipeSignificado.js';
import * as naipeElemento from './naipeElemento.js';
import * as cartaSimboloSignificado from './cartaSimboloSignificado.js';
import * as cartaCorSignificado from './cartaCorSignificado.js';
import * as reconhecimentoCarta from './reconhecimentoCarta.js';
import * as cartaConceito from './cartaConceito.js';
import * as reconhecimentoSimbolo from './reconhecimentoSimbolo.js';
import * as simboloCarta from './simboloCarta.js';
import * as corCarta from './corCarta.js';
import * as numeroCartaMaior from './numeroCartaMaior.js';
import * as naipeCarta from './naipeCarta.js';
import * as uprightReversed from './uprightReversed.js';
import * as significadoCarta from './significadoCarta.js';
import * as detetiveSimbolos from './detetiveSimbolos.js';

export const GENERATORS = [
  simboloSignificado,
  significadoSimbolo,
  corSignificado,
  cartaNaipe,
  cartaKeywords,
  numeroTema,
  pareamento,
  naipeSignificado,
  naipeElemento,
  cartaSimboloSignificado,
  cartaCorSignificado,
  reconhecimentoCarta,
  cartaConceito,
  reconhecimentoSimbolo,
  simboloCarta,
  corCarta,
  numeroCartaMaior,
  naipeCarta,
  uprightReversed,
  significadoCarta,
  detetiveSimbolos,
];

export const GENERATORS_BY_ID = Object.fromEntries(GENERATORS.map((g) => [g.id, g]));

export const QUESTION_TYPE_IDS = GENERATORS.map((g) => g.id);

export function applicableGenerators(pool) {
  return GENERATORS.filter((g) => g.isApplicable(pool));
}
