# /public/cards/

Imagens do baralho **Rider–Waite–Smith** (1909, domínio público, ilustração de Pamela Colman Smith).

O vínculo entre imagem e carta é feito **só pelo nome do arquivo** — precisa bater exatamente com o campo `id` (e `image`) do `cards.json`. Formato recomendado: `.png` ou `.jpg`, proporção 1:1.75 (a carta é redimensionada por CSS, mas evite recortar as bordas na imagem original).

Não renomeie os arquivos depois de colocar — o app inteiro depende desses 78 nomes.

## Arcanos Maiores (22) — prioridade Fase 1

```
major_arcana_fool.png            0  - O Louco
major_arcana_magician.png        1  - O Mago
major_arcana_priestess.png       2  - A Sacerdotisa
major_arcana_empress.png         3  - A Imperatriz
major_arcana_emperor.png         4  - O Imperador
major_arcana_hierophant.png      5  - O Hierofante
major_arcana_lovers.png          6  - Os Enamorados
major_arcana_chariot.png         7  - O Carro
major_arcana_strength.png        8  - A Força   (VIII no RWS — não inverter com Justiça)
major_arcana_hermit.png          9  - O Eremita
major_arcana_wheel_of_fortune.png 10 - A Roda da Fortuna
major_arcana_justice.png         11 - A Justiça (XI no RWS — não inverter com Força)
major_arcana_hanged_man.png      12 - O Enforcado
major_arcana_death.png           13 - A Morte
major_arcana_temperance.png      14 - A Temperança
major_arcana_devil.png           15 - O Diabo
major_arcana_tower.png           16 - A Torre
major_arcana_star.png            17 - A Estrela
major_arcana_moon.png            18 - A Lua
major_arcana_sun.png             19 - O Sol
major_arcana_judgement.png       20 - O Julgamento
major_arcana_world.png           21 - O Mundo
```

## Naipe de Copas (14) — prioridade Fase 1

```
minor_arcana_cups_ace.png
minor_arcana_cups_2.png ... minor_arcana_cups_10.png
minor_arcana_cups_page.png
minor_arcana_cups_knight.png
minor_arcana_cups_queen.png
minor_arcana_cups_king.png
```

## Paus, Espadas e Ouros (42) — ficam para depois (dataset vazio na Fase 1)

Mesmo padrão, trocando o naipe:

```
minor_arcana_wands_*
minor_arcana_swords_*
minor_arcana_pentacles_*
```

(rank sempre: `ace`, `2`…`10`, `page`, `knight`, `queen`, `king`)

**Total: 78 arquivos.** Fontes de domínio público confiáveis: Wikimedia Commons (Rider–Waite tarot deck, escaneado por Pamela Colman Smith / U.S. Games falecida em copyright para a edição de 1909).
