// Interface get/set/list isolada sobre localStorage, com namespace próprio.
// Nesta fase, único uso: lembrar quais lições já foram concluídas (pro nó
// da Jornada mostrar check entre sessões). XP/streak/revisão espaçada
// ficam para uma fase futura, mas essa interface já está pronta pra isso.

const NS = 'tarot:';

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NS + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    // localStorage indisponível (modo privado, quota etc.) — falha silenciosa,
    // o app continua funcionando sem persistência.
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(NS + key);
  } catch {
    // idem
  }
}

export function list(prefix = '') {
  const result = {};
  try {
    const fullPrefix = NS + prefix;
    for (let i = 0; i < localStorage.length; i++) {
      const rawKey = localStorage.key(i);
      if (!rawKey || !rawKey.startsWith(fullPrefix)) continue;
      const shortKey = rawKey.slice(NS.length);
      result[shortKey] = get(shortKey);
    }
  } catch {
    // idem
  }
  return result;
}
