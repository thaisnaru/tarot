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
];

export const GENERATORS_BY_ID = Object.fromEntries(GENERATORS.map((g) => [g.id, g]));

export const QUESTION_TYPE_IDS = GENERATORS.map((g) => g.id);

export function applicableGenerators(pool) {
  return GENERATORS.filter((g) => g.isApplicable(pool));
}
