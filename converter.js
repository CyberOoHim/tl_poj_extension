/*
 * Copyright (c) 2026 Cyber O͘-hîm ki-tē
 * Licensed under the MIT License: https://opensource.org/licenses/MIT
 */
// --- Converter Logic ---

// --- Flag Initialization (set before TL_Converter check to ensure flags are always set) ---
if (typeof window.TL_TONE6_USE_CARON === 'undefined') {
  window.TL_TONE6_USE_CARON = false; // Default: use acute (á) like tone 2. Set to true for caron (ǎ)
}
if (typeof window.TL_ALL_CAPS_SUPPORT === 'undefined') {
  window.TL_ALL_CAPS_SUPPORT = true; // Default: OFF. Set to true to enable all-caps conversion (OO→O͘, TS→CH, etc.)
}

if (typeof window.TL_Converter === 'undefined') {
  window.TL_Converter = (function () {

    // --- Core Conversion Logic (Private) ---
    // (Same regex helpers as before)
    const TL_bue = '((?:rm|rng|rn|r|m|ng|n|nnh|nn|ⁿ|N)?)';

    function createRC(char) { return new RegExp(char + '([aAeEgGhHiIkKmMnNoOpPtTuU]*)', 'g'); }
    function createRC1(tailo) { const prefix = tailo.slice(0, -1); const lastChar = tailo.slice(-1); return new RegExp(prefix + TL_bue + lastChar, 'g'); }
    function createRC2(tailo) { return new RegExp(tailo[0] + '(u|i)((?:N|ⁿ|nn)?)' + tailo[1], 'g'); }
    function createRC3(tailo) { return new RegExp(tailo, 'g'); }
    function createRC3_Regex(pattern) { return new RegExp(pattern, 'g'); }
    function createRC4(tailo) { const prefix = tailo.slice(0, -1); const lastChar = tailo.slice(-1); return new RegExp(prefix + '(h(?:N|ⁿ|nn)?|H(?:N|ⁿ|nn)?|p|P|t|T|k|K)' + lastChar + '?', 'g'); }
    function createRC8(tailo) { const prefix = tailo.slice(0, -1); const lastChar = tailo.slice(-1); return new RegExp(prefix + '(h(?:N|ⁿ|nn)?|H(?:N|ⁿ|nn)?|p|P|t|T|k|K)' + lastChar, 'g'); }

    // 1. TL Tone Marks -> TL Numbers
    function TLtiau_2_TLsoo(tl_tiau, nasal = 'nn', use14 = false) {
      let tl_soo = tl_tiau;
      if (!tl_soo) return '';
      // (Same mapping as before, condensed for brevity in file write but assuming full logic is preserved)
      const TL_T2S = [
        { r: createRC('á'), s: 'a$12' }, { r: createRC('Á'), s: 'A$12' },
        { r: createRC('à'), s: 'a$13' }, { r: createRC('À'), s: 'A$13' },
        { r: createRC('â'), s: 'a$15' }, { r: createRC('Â'), s: 'A$15' },
        { r: createRC('ǎ'), s: 'a$16' }, { r: createRC('Ǎ'), s: 'A$16' },
        { r: createRC('ā'), s: 'a$17' }, { r: createRC('Ā'), s: 'A$17' },
        { r: createRC('a̍'), s: 'a$18' }, { r: createRC('A̍'), s: 'A$18' },
        { r: createRC('a̋'), s: 'a$19' }, { r: createRC('A̋'), s: 'A$19' },
        { r: createRC('é'), s: 'e$12' }, { r: createRC('É'), s: 'E$12' },
        { r: createRC('è'), s: 'e$13' }, { r: createRC('È'), s: 'E$13' },
        { r: createRC('ê'), s: 'e$15' }, { r: createRC('Ê'), s: 'E$15' },
        { r: createRC('ě'), s: 'e$16' }, { r: createRC('Ě'), s: 'E$16' },
        { r: createRC('ē'), s: 'e$17' }, { r: createRC('Ē'), s: 'E$17' },
        { r: createRC('e̍'), s: 'e$18' }, { r: createRC('E̍'), s: 'E$18' },
        { r: createRC('e̋'), s: 'e$19' }, { r: createRC('E̋'), s: 'E$19' },
        { r: createRC('í'), s: 'i$12' }, { r: createRC('Í'), s: 'I$12' },
        { r: createRC('ì'), s: 'i$13' }, { r: createRC('Ì'), s: 'I$13' },
        { r: createRC('î'), s: 'i$15' }, { r: createRC('Î'), s: 'I$15' },
        { r: createRC('ǐ'), s: 'i$16' }, { r: createRC('Ǐ'), s: 'I$16' },
        { r: createRC('ī'), s: 'i$17' }, { r: createRC('Ī'), s: 'I$17' },
        { r: createRC('i̍'), s: 'i$18' }, { r: createRC('I̍'), s: 'I$18' },
        { r: createRC('i̋'), s: 'i$19' }, { r: createRC('I̋'), s: 'I$19' },
        { r: createRC('ó͘'), s: 'oo$12' }, { r: createRC('Ó͘'), s: 'Oo$12' },
        { r: createRC('ò͘'), s: 'oo$13' }, { r: createRC('Ò͘'), s: 'Oo$13' },
        { r: createRC('ô͘'), s: 'oo$15' }, { r: createRC('Ô͘'), s: 'Oo$15' },
        { r: createRC('ǒ͘'), s: 'oo$16' }, { r: createRC('Ǒ͘'), s: 'Oo$16' },
        { r: createRC('ō͘'), s: 'oo$17' }, { r: createRC('Ō͘'), s: 'Oo$17' },
        { r: createRC('o̍͘'), s: 'oo$18' }, { r: createRC('O̍͘'), s: 'Oo$18' },
        { r: createRC('ő͘'), s: 'oo$19' }, { r: createRC('Ő͘'), s: 'Oo$19' },
        { r: createRC('ó'), s: 'o$12' }, { r: createRC('Ó'), s: 'O$12' },
        { r: createRC('ò'), s: 'o$13' }, { r: createRC('Ò'), s: 'O$13' },
        { r: createRC('ô'), s: 'o$15' }, { r: createRC('Ô'), s: 'O$15' },
        { r: createRC('ǒ'), s: 'o$16' }, { r: createRC('Ǒ'), s: 'O$16' },
        { r: createRC('ō'), s: 'o$17' }, { r: createRC('Ō'), s: 'O$17' },
        { r: createRC('o̍'), s: 'o$18' }, { r: createRC('O̍'), s: 'O$18' },
        { r: createRC('ő'), s: 'o$19' }, { r: createRC('Ő'), s: 'O$19' },
        { r: createRC('ú'), s: 'u$12' }, { r: createRC('Ú'), s: 'U$12' },
        { r: createRC('ù'), s: 'u$13' }, { r: createRC('Ù'), s: 'U$13' },
        { r: createRC('û'), s: 'u$15' }, { r: createRC('Û'), s: 'U$15' },
        { r: createRC('ǔ'), s: 'u$16' }, { r: createRC('Ǔ'), s: 'U$16' },
        { r: createRC('ū'), s: 'u$17' }, { r: createRC('Ū'), s: 'U$17' },
        { r: createRC('u̍'), s: 'u$18' }, { r: createRC('U̍'), s: 'U$18' },
        { r: createRC('ű'), s: 'u$19' }, { r: createRC('Ű'), s: 'U$19' },
        { r: createRC('ḿ'), s: 'm$12' }, { r: createRC('Ḿ'), s: 'M$12' },
        { r: createRC('m̀'), s: 'm$13' }, { r: createRC('M̀'), s: 'M$13' },
        { r: createRC('m̂'), s: 'm$15' }, { r: createRC('M̂'), s: 'M$15' },
        { r: createRC('m̌'), s: 'm$16' }, { r: createRC('M̌'), s: 'M$16' },
        { r: createRC('m̄'), s: 'm$17' }, { r: createRC('M̄'), s: 'M$17' },
        { r: createRC('m̍'), s: 'm$18' }, { r: createRC('M̍'), s: 'M$18' },
        { r: createRC('m̋'), s: 'm$19' }, { r: createRC('M̋'), s: 'M$19' },
        { r: createRC('ń'), s: 'n$12' }, { r: createRC('Ń'), s: 'N$12' },
        { r: createRC('ǹ'), s: 'n$13' }, { r: createRC('Ǹ'), s: 'N$13' },
        { r: createRC('n̂'), s: 'n$15' }, { r: createRC('N̂'), s: 'N$15' },
        { r: createRC('ň'), s: 'n$16' }, { r: createRC('N̋'), s: 'N$16' },
        { r: createRC('n̄'), s: 'n$17' }, { r: createRC('N̄'), s: 'N$17' },
        { r: createRC('n̍'), s: 'n$18' }, { r: createRC('N̍'), s: 'N$18' },
        { r: createRC('n̋'), s: 'n$19' }, { r: createRC('N̋'), s: 'N$19' }
      ];
      for (const map of TL_T2S) { tl_soo = tl_soo.replace(map.r, map.s); }
      tl_soo = tl_soo.replace(/o͘/g, 'oo').replace(/O͘/g, 'Oo').replace(/ⁿ/g, 'nn');
      if (nasal === 'N') tl_soo = tl_soo.replace(/(?<=[aeiouAEIOU])nn/g, 'N');
      if (use14) {
        const add1 = /(a|A|e|E|i|I|o|O|u|U|m|M|ng|Ng|n)\b/g;
        const add4 = /(h|H|p|P|t|T|k|K)\b/g;
        tl_soo = tl_soo.replace(add1, '$11').replace(add4, '$14');
      }
      return tl_soo;
    }

    // 2. TL Numbers -> POJ Numbers
    function TLsoo_2_POJsoo(tailo_soo, keep14 = false) {
      if (!tailo_soo) return '';
      let poj_soo = tailo_soo;
      if (!keep14) {
        const remove1 = /([aeiouAEIOU](?:nn|N)?|[aeiouAEIOU](?:ng|n|m)|(?:p|P|ph|Ph|m|M|b|B|t|T|th|Th|n|N|l|L|k|K|kh|Kh|ng|Ng|g|G|s|S|h|H)?(?:ng|Ng|m|M))1/g;
        poj_soo = poj_soo.replace(remove1, '$1');
        const remove4 = /([aeiouAEIOU](?:(?:nn|N)?(?:h|H)|p|P|t|T|k|K)|(?:m|M|ng|Ng)(?:h|H))4/g;
        poj_soo = poj_soo.replace(remove4, '$1');
      }
      // (Tailo2POJ mappings same as before)
      const tailo2poj = [
        ['oonn', 'o͘nn'], ['Oonn', 'O͘nn'],
        /* ['onn', 'o͘N'], ['Onn', 'O͘N'], <-- REMOVED: onn should be oⁿ, not o͘N */
        ['ts', 'ch'], ['Ts', 'Ch'], ['oo', 'o͘'], ['Oo', 'O͘'],
        ['ua', 'oa'], ['Ua', 'Oa'], ['ue', 'oe'], ['Ue', 'Oe'],
        ['ing', 'eng'], ['Ing', 'Eng'], ['ik', 'ek'], ['Ik', 'Ek'],
        // nnh → hnn (always converts to hⁿ), Nh handled in POJsoo_2_POJtiau
        ['nnh', 'hnn']
      ];
      // Add all-caps variants if flag enabled
      if (window.TL_ALL_CAPS_SUPPORT) {
        tailo2poj.push(
          ['OONN', 'O͘NN'], ['ONN', 'O͘NN'],
          ['TS', 'CH'], ['OO', 'O͘'],
          ['UA', 'OA'], ['UE', 'OE'],
          ['ING', 'ENG'], ['IK', 'EK'],
          ['NNH', 'HNN']
        );
      }
      for (const [k, v] of tailo2poj) { poj_soo = poj_soo.replace(new RegExp(k, 'g'), v); }
      // Only normalize N patterns, don't convert nn to N here
      // nn will be handled in POJsoo_2_POJtiau (always converts to ⁿ)
      // N will be handled in POJsoo_2_POJtiau (toggle-dependent)
      return poj_soo;
    }

    // 3. POJ Numbers -> POJ Tone Marks
    function POJsoo_2_POJtiau(poj_soo) {
      if (!poj_soo) return '';
      let poj_tiau = poj_soo;

      // Nasal superscript conversion:
      // - nn at syllable tail (after vowel or vowel+h or m+h): ALWAYS convert to ⁿ
      // - N at syllable tail (after vowel or vowel+h or m+h): Only convert when toggle is ON
      // - Standalone nn/N (not after valid pattern): Preserve as-is
      // Patterns: vowel+nn, vowel+h+nn, m+h+nn (and same for N)
      // Fix: Include combining dot \u0358 for o͘ handling
      const nn_to_superscript = /([aeiouAEIOUmM]\u0358?h?|[aeiouAEIOUmM]\u0358?)nn(\d?)\b/g;
      poj_tiau = poj_tiau.replace(nn_to_superscript, '$1ⁿ$2');

      const useNasalSuperscript = typeof window !== 'undefined' &&
        window.TL_USE_NASAL_SUPERSCRIPT !== false;
      if (useNasalSuperscript) {
        const N_to_superscript = /([aeiouAEIOUmM]\u0358?h?|[aeiouAEIOUmM]\u0358?)N(\d?)\b/g;
        poj_tiau = poj_tiau.replace(N_to_superscript, '$1ⁿ$2');
        // Also handle Nh pattern (reorder and convert): aNh → ahⁿ
        const Nh_to_superscript = /([aeiouAEIOUmM]\u0358?)Nh?(\d?)\b/g;
        poj_tiau = poj_tiau.replace(Nh_to_superscript, '$1hⁿ$2');
      }

      // Tone 6 character selection: caron (ǎ) or acute (á) like tone 2
      // Default is false = use acute (same as tone 2)
      const useTone6Caron = typeof window !== 'undefined' &&
        window.TL_TONE6_USE_CARON === true;
      const t6 = useTone6Caron
        ? { a: 'ǎ', A: 'Ǎ', e: 'ě', E: 'Ě', i: 'ǐ', I: 'Ǐ', o: 'ǒ', O: 'Ǒ', u: 'ǔ', U: 'Ǔ', 'o͘': 'ǒ͘', 'O͘': 'Ǒ͘', m: 'm̌', M: 'M̌', n: 'ň', N: 'Ň' }
        : { a: 'á', A: 'Á', e: 'é', E: 'É', i: 'í', I: 'Í', o: 'ó', O: 'Ó', u: 'ú', U: 'Ú', 'o͘': 'ó͘', 'O͘': 'Ó͘', m: 'ḿ', M: 'Ḿ', n: 'ń', N: 'Ń' };
      // (POJ_S2T mappings same as before)
      const POJ_S2T = [
        { r: createRC2('a1'), s: 'a$1$2' }, { r: createRC2('A1'), s: 'A$1$2' },
        { r: createRC2('a2'), s: 'á$1$2' }, { r: createRC2('A2'), s: 'Á$1$2' },
        { r: createRC2('a3'), s: 'à$1$2' }, { r: createRC2('A3'), s: 'À$1$2' },
        { r: createRC3_Regex('a(i|u)((?:N|ⁿ|nn)?)h4'), s: 'a$1$2h' },
        { r: createRC3_Regex('A(i|u)((?:N|ⁿ|nn)?)h4'), s: 'A$1$2h' },
        { r: createRC2('a5'), s: 'â$1$2' }, { r: createRC2('A5'), s: 'Â$1$2' },
        { r: createRC2('a6'), s: t6.a + '$1$2' }, { r: createRC2('A6'), s: t6.A + '$1$2' },
        { r: createRC2('a7'), s: 'ā$1$2' }, { r: createRC2('A7'), s: 'Ā$1$2' },
        { r: createRC3_Regex('a(i|u)h(?:N|ⁿ|nn)8'), s: 'a̍$1hⁿ' },
        { r: createRC3_Regex('A(i|u)h(?:N|ⁿ|nn)8'), s: 'A̍$1hⁿ' },
        { r: createRC3_Regex('a(i|u)h8'), s: 'a̍$1h' },
        { r: createRC3_Regex('A(i|u)h8'), s: 'A̍$1h' },
        { r: createRC2('a9'), s: 'ă$1$2' }, { r: createRC2('A9'), s: 'Ă$1$2' },
        { r: createRC2('u1'), s: 'u$1$2' }, { r: createRC2('U1'), s: 'U$1$2' },
        { r: createRC2('u2'), s: 'ú$1$2' }, { r: createRC2('U2'), s: 'Ú$1$2' },
        { r: createRC2('u3'), s: 'ù$1$2' }, { r: createRC2('U3'), s: 'Ù$1$2' },
        { r: createRC3_Regex('uih((?:N|ⁿ|nn)?)4'), s: 'uih$1' },
        { r: createRC3_Regex('Uih((?:N|ⁿ|nn)?)4'), s: 'Uih$1' },
        { r: createRC2('u5'), s: 'û$1$2' }, { r: createRC2('U5'), s: 'Û$1$2' },
        { r: createRC2('u6'), s: t6.u + '$1$2' }, { r: createRC2('U6'), s: t6.U + '$1$2' },
        { r: createRC2('u7'), s: 'ū$1$2' }, { r: createRC2('U7'), s: 'Ū$1$2' },
        { r: createRC3_Regex('uih((?:N|ⁿ|nn)?)8'), s: 'u̍ih$1' },
        { r: createRC3_Regex('Uih((?:N|ⁿ|nn)?)8'), s: 'U̍ih$1' },
        { r: createRC2('u9'), s: 'ŭ$1$2' }, { r: createRC2('U9'), s: 'Ŭ$1$2' },
        { r: createRC3_Regex('(o|O)([ae])((?:N|ⁿ|nn)?)1?\\b'), s: '$1$2$3' },
        { r: createRC3_Regex('o([ae])((?:N|ⁿ|nn)?)2\\b'), s: 'ó$1$2' },
        { r: createRC3_Regex('O([ae])((?:N|ⁿ|nn)?)2\\b'), s: 'Ó$1$2' },
        { r: createRC3_Regex('o([ae])((?:N|ⁿ|nn)?)3\\b'), s: 'ò$1$2' },
        { r: createRC3_Regex('O([ae])((?:N|ⁿ|nn)?)3\\b'), s: 'Ò$1$2' },
        { r: createRC3_Regex('o([ae])((?:N|ⁿ|nn)?)5\\b'), s: 'ô$1$2' },
        { r: createRC3_Regex('O([ae])((?:N|ⁿ|nn)?)5\\b'), s: 'Ô$1$2' },
        { r: createRC3_Regex('o([ae])((?:N|ⁿ|nn)?)6\\b'), s: t6.o + '$1$2' },
        { r: createRC3_Regex('O([ae])((?:N|ⁿ|nn)?)6\\b'), s: t6.O + '$1$2' },
        { r: createRC3_Regex('o([ae])((?:N|ⁿ|nn)?)7\\b'), s: 'ō$1$2' },
        { r: createRC3_Regex('O([ae])((?:N|ⁿ|nn)?)7\\b'), s: 'Ō$1$2' },
        { r: createRC3_Regex('o([ae])((?:N|ⁿ|nn)?)9\\b'), s: 'ŏ$1$2' },
        { r: createRC3_Regex('O([ae])((?:N|ⁿ|nn)?)9\\b'), s: 'Ŏ$1$2' },
        { r: createRC1('a1'), s: 'a$1' }, { r: createRC1('A1'), s: 'A$1' },
        { r: createRC1('a2'), s: 'á$1' }, { r: createRC1('A2'), s: 'Á$1' },
        { r: createRC1('a3'), s: 'à$1' }, { r: createRC1('A3'), s: 'À$1' },
        { r: createRC4('a4'), s: 'a$1' }, { r: createRC4('A4'), s: 'A$1' },
        { r: createRC1('a5'), s: 'â$1' }, { r: createRC1('A5'), s: 'Â$1' },
        { r: createRC1('a6'), s: t6.a + '$1' }, { r: createRC1('A6'), s: t6.A + '$1' },
        { r: createRC1('a7'), s: 'ā$1' }, { r: createRC1('A7'), s: 'Ā$1' },
        { r: createRC8('a8'), s: 'a̍$1' }, { r: createRC8('A8'), s: 'A̍$1' },
        { r: createRC1('a9'), s: 'ă$1' }, { r: createRC1('A9'), s: 'Ă$1' },
        { r: createRC1('e1'), s: 'e$1' }, { r: createRC1('E1'), s: 'E$1' },
        { r: createRC1('e2'), s: 'é$1' }, { r: createRC1('E2'), s: 'É$1' },
        { r: createRC1('e3'), s: 'è$1' }, { r: createRC1('E3'), s: 'È$1' },
        { r: createRC4('e4'), s: 'e$1' }, { r: createRC4('E4'), s: 'E$1' },
        { r: createRC1('e5'), s: 'ê$1' }, { r: createRC1('E5'), s: 'Ê$1' },
        { r: createRC1('e6'), s: t6.e + '$1' }, { r: createRC1('E6'), s: t6.E + '$1' },
        { r: createRC1('e7'), s: 'ē$1' }, { r: createRC1('E7'), s: 'Ē$1' },
        { r: createRC8('e8'), s: 'e̍$1' }, { r: createRC8('E8'), s: 'E̍$1' },
        { r: createRC1('e9'), s: 'ĕ$1' }, { r: createRC1('E9'), s: 'Ĕ$1' },
        { r: createRC1('i1'), s: 'i$1' }, { r: createRC1('I1'), s: 'I$1' },
        { r: createRC1('i2'), s: 'í$1' }, { r: createRC1('I2'), s: 'Í$1' },
        { r: createRC1('i3'), s: 'ì$1' }, { r: createRC1('I3'), s: 'Ì$1' },
        { r: createRC4('i4'), s: 'i$1' }, { r: createRC4('I4'), s: 'I$1' },
        { r: createRC1('i5'), s: 'î$1' }, { r: createRC1('I5'), s: 'Î$1' },
        { r: createRC1('i6'), s: t6.i + '$1' }, { r: createRC1('I6'), s: t6.I + '$1' },
        { r: createRC1('i7'), s: 'ī$1' }, { r: createRC1('I7'), s: 'Ī$1' },
        { r: createRC8('i8'), s: 'i̍$1' }, { r: createRC8('I8'), s: 'I̍$1' },
        { r: createRC1('i9'), s: 'ĭ$1' }, { r: createRC1('I9'), s: 'Ĭ$1' },
        { r: createRC1('o͘1'), s: 'o͘$1' }, { r: createRC1('O͘1'), s: 'O͘$1' },
        { r: createRC1('o͘2'), s: 'ó͘$1' }, { r: createRC1('O͘2'), s: 'Ó͘$1' },
        { r: createRC1('o͘3'), s: 'ò͘$1' }, { r: createRC1('O͘3'), s: 'Ò͘$1' },
        { r: createRC4('o͘4'), s: 'o͘$1' }, { r: createRC4('O͘4'), s: 'O͘$1' },
        { r: createRC1('o͘5'), s: 'ô͘$1' }, { r: createRC1('O͘5'), s: 'Ô͘$1' },
        { r: createRC1('o͘6'), s: t6['o͘'] + '$1' }, { r: createRC1('O͘6'), s: t6['O͘'] + '$1' },
        { r: createRC1('o͘7'), s: 'ō͘$1' }, { r: createRC1('O͘7'), s: 'Ō͘$1' },
        { r: createRC8('o͘8'), s: 'o̍͘$1' }, { r: createRC8('O͘8'), s: 'O̍͘$1' },
        { r: createRC1('o͘9'), s: 'ŏ͘$1' }, { r: createRC1('O͘9'), s: 'Ŏ͘$1' },
        { r: createRC1('o1'), s: 'o$1' }, { r: createRC1('O1'), s: 'O$1' },
        { r: createRC1('o2'), s: 'ó$1' }, { r: createRC1('O2'), s: 'Ó$1' },
        { r: createRC1('o3'), s: 'ò$1' }, { r: createRC1('O3'), s: 'Ò$1' },
        { r: createRC4('o4'), s: 'o$1' }, { r: createRC4('O4'), s: 'O$1' },
        { r: createRC1('o5'), s: 'ô$1' }, { r: createRC1('O5'), s: 'Ô$1' },
        { r: createRC1('o6'), s: t6.o + '$1' }, { r: createRC1('O6'), s: t6.O + '$1' },
        { r: createRC1('o7'), s: 'ō$1' }, { r: createRC1('O7'), s: 'Ō$1' },
        { r: createRC8('o8'), s: 'o̍$1' }, { r: createRC8('O8'), s: 'O̍$1' },
        { r: createRC1('o9'), s: 'ŏ$1' }, { r: createRC1('O9'), s: 'Ŏ$1' },
        { r: createRC1('u1'), s: 'u$1' }, { r: createRC1('U1'), s: 'U$1' },
        { r: createRC1('u2'), s: 'ú$1' }, { r: createRC1('U2'), s: 'Ú$1' },
        { r: createRC1('u3'), s: 'ù$1' }, { r: createRC1('U3'), s: 'Ù$1' },
        { r: createRC4('u4'), s: 'u$1' }, { r: createRC4('U4'), s: 'U$1' },
        { r: createRC1('u5'), s: 'û$1' }, { r: createRC1('U5'), s: 'Û$1' },
        { r: createRC1('u6'), s: t6.u + '$1' }, { r: createRC1('U6'), s: t6.U + '$1' },
        { r: createRC1('u7'), s: 'ū$1' }, { r: createRC1('U7'), s: 'Ū$1' },
        { r: createRC8('u8'), s: 'u̍$1' }, { r: createRC8('U8'), s: 'U̍$1' },
        { r: createRC1('u9'), s: 'ŭ$1' }, { r: createRC1('U9'), s: 'Ŭ$1' },
        { r: createRC3_Regex('m1'), s: 'm' }, { r: createRC3_Regex('M1'), s: 'M' },
        { r: createRC3_Regex('m2'), s: 'ḿ' }, { r: createRC3_Regex('M2'), s: 'Ḿ' },
        { r: createRC3_Regex('m3'), s: 'm̀' }, { r: createRC3_Regex('M3'), s: 'M̀' },
        { r: createRC3_Regex('mh4'), s: 'mh' }, { r: createRC3_Regex('Mh4'), s: 'Mh' },
        { r: createRC3_Regex('m5'), s: 'm̂' }, { r: createRC3_Regex('M5'), s: 'M̂' },
        { r: createRC3_Regex('m6'), s: t6.m }, { r: createRC3_Regex('M6'), s: t6.M },
        { r: createRC3_Regex('m7'), s: 'm̄' }, { r: createRC3_Regex('M7'), s: 'M̄' },
        { r: createRC3_Regex('mh8'), s: 'm̍h' }, { r: createRC3_Regex('Mh8'), s: 'M̍h' },
        { r: createRC3_Regex('m9'), s: 'm̆' }, { r: createRC3_Regex('M9'), s: 'M̆' },
        { r: createRC3_Regex('ng1'), s: 'ng' }, { r: createRC3_Regex('Ng1'), s: 'Ng' },
        { r: createRC3_Regex('ng2'), s: 'ńg' }, { r: createRC3_Regex('Ng2'), s: 'Ńg' },
        { r: createRC3_Regex('ng3'), s: 'ǹg' }, { r: createRC3_Regex('Ng3'), s: 'Ǹg' },
        { r: createRC3_Regex('ngh4'), s: 'ngh' }, { r: createRC3_Regex('Ngh4'), s: 'Ngh' },
        { r: createRC3_Regex('ng5'), s: 'n̂g' }, { r: createRC3_Regex('Ng5'), s: 'N̂g' },
        { r: createRC3_Regex('ng6'), s: t6.n + 'g' }, { r: createRC3_Regex('Ng6'), s: t6.N + 'g' },
        { r: createRC3_Regex('ng7'), s: 'n̄g' }, { r: createRC3_Regex('Ng7'), s: 'N̄g' },
        { r: createRC3_Regex('ngh8'), s: 'n̍gh' }, { r: createRC3_Regex('Ngh8'), s: 'N̍gh' },
        { r: createRC3_Regex('ng9'), s: 'n̆g' }, { r: createRC3_Regex('Ng9'), s: 'N̆g' }
      ];
      // Add all-caps NG rules if flag enabled
      if (window.TL_ALL_CAPS_SUPPORT) {
        POJ_S2T.push(
          { r: createRC3_Regex('NG1'), s: 'NG' },
          { r: createRC3_Regex('NG2'), s: t6.N + 'G' },
          { r: createRC3_Regex('NG3'), s: 'ǸG' },
          { r: createRC3_Regex('NGH4'), s: 'NGH' },
          { r: createRC3_Regex('NG5'), s: 'N̂G' },
          { r: createRC3_Regex('NG6'), s: t6.N + 'G' },
          { r: createRC3_Regex('NG7'), s: 'N̄G' },
          { r: createRC3_Regex('NGH8'), s: 'N̍GH' },
          { r: createRC3_Regex('NG9'), s: 'N̆G' }
        );
      }
      for (const map of POJ_S2T) { poj_tiau = poj_tiau.replace(map.r, map.s); }
      return poj_tiau;
    }

    function TLtiau_2_POJtiau(tl_tiau) {
      // 0a. Preserve URLs and markdown links from conversion
      // Replace URLs with placeholders, restore after conversion
      const urlPlaceholders = [];

      // Preserve markdown image syntax: ![alt](url)
      tl_tiau = tl_tiau.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
        urlPlaceholders.push(match);
        return `⟪URL${urlPlaceholders.length - 1}⟫`;
      });

      // Preserve markdown link syntax: [text](url)
      tl_tiau = tl_tiau.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
        urlPlaceholders.push(match);
        return `⟪URL${urlPlaceholders.length - 1}⟫`;
      });

      // Preserve standalone URLs (http, https, ftp)
      tl_tiau = tl_tiau.replace(/(https?|ftp):\/\/[^\s\)\]\\]+/g, (match) => {
        urlPlaceholders.push(match);
        return `⟪URL${urlPlaceholders.length - 1}⟫`;
      });

      // 0b. Handle escape sequences: \[text\] is preserved as-is (supports multi-line)
      // Uses O(n) state machine scan instead of regex for robustness
      // Delimiter: \[ opens, \] closes (allows regular ] inside)
      const escapes = [];
      let processedInput = '';
      let i = 0;
      while (i < tl_tiau.length) {
        if (tl_tiau[i] === '\\' && tl_tiau[i + 1] === '[') {
          // Found escape start \[
          let start = i + 2;
          let end = tl_tiau.indexOf('\\]', start);
          if (end === -1) {
            // No closing \] → escape everything to end of string
            escapes.push(tl_tiau.slice(start));
            processedInput += `⟪ESC${escapes.length - 1}⟫`;
            break;
          }
          // Found closing \]
          escapes.push(tl_tiau.slice(start, end));
          processedInput += `⟪ESC${escapes.length - 1}⟫`;
          i = end + 2; // Skip past \]
        } else {
          processedInput += tl_tiau[i];
          i++;
        }
      }

      // 0c. Preserve POJ text (syllables with POJ-specific markers)
      // POJ-specific characters: ⁿ (superscript n), o͘/O͘ (o with dot above)
      // Match words/syllables containing these POJ markers and preserve them
      const pojPlaceholders = [];

      // Pattern explanation:
      // - Word boundaries containing ⁿ or o͘/O͘ (POJ-specific characters)
      // - Match the whole "word" (sequence of romanization characters with diacritics)
      // - Romanization chars: letters, tone marks (combining diacritics), hyphens within words
      const pojSyllablePattern = /[\p{L}\p{M}]+(?:ⁿ|o͘|O͘)[\p{L}\p{M}]*/gu;
      // Also match syllables ending with ⁿ that might not be caught above
      const pojNasalEndPattern = /[\p{L}\p{M}]+ⁿ/gu;
      // And match standalone o͘/O͘ syllables  
      const pojOoPattern = /[\p{L}\p{M}]*[oO]͘[\p{L}\p{M}]*/gu;

      // First pass: preserve syllables with ⁿ
      processedInput = processedInput.replace(pojNasalEndPattern, (match) => {
        pojPlaceholders.push(match);
        return `⟪POJ${pojPlaceholders.length - 1}⟫`;
      });

      // Second pass: preserve syllables with o͘/O͘ (that weren't already captured)
      processedInput = processedInput.replace(pojOoPattern, (match) => {
        // Skip if already a placeholder
        if (match.includes('⟪POJ')) return match;
        pojPlaceholders.push(match);
        return `⟪POJ${pojPlaceholders.length - 1}⟫`;
      });

      // 1. Convert TL-style tone marks to corresponding numbers
      const tl_soo = TLtiau_2_TLsoo(processedInput);
      // 2. Convert TL number-style to POJ number-style
      const poj_soo = TLsoo_2_POJsoo(tl_soo);
      // 3. Convert POJ number-style to POJ tone marks
      let poj_tiau = POJsoo_2_POJtiau(poj_soo);

      // 4a. Restore escaped content
      poj_tiau = poj_tiau.replace(/⟪ESC(\d+)⟫/g, (match, index) => {
        return escapes[parseInt(index)];
      });

      // 4b. Restore POJ content (preserved syllables with POJ-specific markers)
      poj_tiau = poj_tiau.replace(/⟪POJ(\d+)⟫/g, (match, index) => {
        return pojPlaceholders[parseInt(index)];
      });

      // 5. Restore URL/markdown link placeholders
      poj_tiau = poj_tiau.replace(/⟪URL(\d+)⟫/g, (match, index) => {
        return urlPlaceholders[parseInt(index)];
      });

      return poj_tiau;
    }

    // --- History Management ---
    const historyStack = [];
    let _pageConverted = false;

    function updateState() {
      // Notify background script about state change
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: "TL_EXTENSION_STATE_UPDATE",
          pageConverted: _pageConverted,
          hasHistory: historyStack.length > 0
        }).catch(() => { }); // Catch error if popup/background not listening
      }
    }

    function pushHistory(changes) {
      historyStack.push(changes);
      updateState();
    }

    function undo() {
      if (historyStack.length === 0) return;

      const lastAction = historyStack.pop();
      lastAction.forEach(change => {
        if (change.node && change.node.parentNode) {
          change.node.nodeValue = change.oldValue;
        }
      });

      // If we undid the page conversion (detected by analyzing changes or simplified state)
      // Ideally we track what kind of action pushed history. 
      // For now, if history is empty, assume reset.
      if (historyStack.length === 0) {
        _pageConverted = false;
      }
      updateState();
    }

    function undoAll() {
      while (historyStack.length > 0) {
        const lastAction = historyStack.pop();
        lastAction.forEach(change => {
          if (change.node && change.node.parentNode) {
            change.node.nodeValue = change.oldValue;
          }
        });
      }
      _pageConverted = false;
      updateState();
    }

    // --- DOM Walker Helpers ---
    function isIgnoredNode(node) {
      let parent = node.parentNode;
      while (parent) {
        if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'NOSCRIPT' || parent.isContentEditable) {
          return true;
        }
        parent = parent.parentNode;
      }
      return false;
    }

    function convertPageContent() {
      if (_pageConverted) return; // Prevent double conversion if already tracked? Or allow re-scan?
      // Allow re-scan but track it.

      const changes = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) { return isIgnoredNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
      });

      let node;
      while (node = walker.nextNode()) {
        const text = node.nodeValue;
        if (text.trim().length > 0) {
          const converted = TLtiau_2_POJtiau(text);
          if (converted !== text) {
            changes.push({ node: node, oldValue: text });
            node.nodeValue = converted;
          }
        }
      }

      if (changes.length > 0) {
        pushHistory(changes);
        _pageConverted = true;
        updateState();
      }
    }

    function convertSelection() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const changes = [];

      // (Selection logic same as before)
      if (range.startContainer === range.endContainer && range.startContainer.nodeType === 3) {
        const node = range.startContainer;
        const text = node.nodeValue;
        const before = text.substring(0, range.startOffset);
        const selected = text.substring(range.startOffset, range.endOffset);
        const after = text.substring(range.endOffset);
        const convertedSelected = TLtiau_2_POJtiau(selected);
        if (convertedSelected !== selected) {
          const newNodeValue = before + convertedSelected + after;
          changes.push({ node: node, oldValue: text });
          node.nodeValue = newNodeValue;
        }
      } else {
        const commonAncestor = range.commonAncestorContainer;
        const walker = document.createTreeWalker(commonAncestor, NodeFilter.SHOW_TEXT, null);
        let node;
        while (node = walker.nextNode()) {
          if (selection.containsNode(node, true)) {
            let text = node.nodeValue;
            let start = (node === range.startContainer) ? range.startOffset : 0;
            let end = (node === range.endContainer) ? range.endOffset : text.length;
            const before = text.substring(0, start);
            const target = text.substring(start, end);
            const after = text.substring(end);
            if (target.trim().length > 0) {
              const converted = TLtiau_2_POJtiau(target);
              if (converted !== target) {
                changes.push({ node: node, oldValue: text });
                node.nodeValue = before + converted + after;
              }
            }
          }
        }
      }

      if (changes.length > 0) {
        pushHistory(changes);
        updateState();
      }
      selection.removeAllRanges();
    }

    function runTests() {
      // console.log("Running comprehensive self-test...");

      const originalNasal = window.TL_USE_NASAL_SUPERSCRIPT;
      const originalTone6 = window.TL_TONE6_USE_CARON;
      const originalAllCaps = window.TL_ALL_CAPS_SUPPORT;

      const runTestCase = (input, expected, config = {}) => {
        // Apply config or defaults
        window.TL_USE_NASAL_SUPERSCRIPT = config.nasal !== undefined ? config.nasal : true;
        window.TL_TONE6_USE_CARON = config.tone6 !== undefined ? config.tone6 : false;
        window.TL_ALL_CAPS_SUPPORT = config.allCaps !== undefined ? config.allCaps : true;

        const result = TLtiau_2_POJtiau(input);
        if (result !== expected) {
          console.error(`[FAIL] In: "${input}" | Expected: "${expected}" | Got: "${result}" | Config: ${JSON.stringify(config)}`);
          return false;
        }
        return true;
      };

      let passed = 0;
      let total = 0;

      const testCases = [
        // 1. Basic Rules
        { in: "phah", out: "phah" },
        { in: "Tâi-uân", out: "Tâi-oân" },
        { in: "tsuí", out: "chúi" },
        { in: "tshuí", out: "chhúi" },
        { in: "ing", out: "eng" },
        { in: "tsa", out: "cha" },
        { in: "ua", out: "oa" },
        { in: "ue", out: "oe" },

        // 2. OO Mapping
        { in: "óo", out: "ó͘" },
        { in: "oo", out: "o͘" },
        { in: "Oo", out: "O͘" },
        { in: "Ōo", out: "Ō͘" },

        // 3. Nasal Superscript (Default: ON)
        { in: "siann", out: "siaⁿ" },
        { in: "Siann", out: "Siaⁿ" },
        { in: "hnn", out: "hⁿ" },  // Syllabic nasal h+nn
        { in: "Hnn", out: "Hⁿ" },
        { in: "mng", out: "mng" }, // mng is generally kept or mapped to mng, distinct from nasal chart if not defined
        { in: "ng", out: "ng" },
        // Specific 'nn' vs 'N' Logic
        { in: "ann", out: "aⁿ" },
        { in: "aN", out: "aⁿ", config: { nasal: true } },
        { in: "aN", out: "aN", config: { nasal: false } }, // Toggle OFF: N stays N
        // Edge case: nnh -> hnn -> hⁿ
        { in: "annh", out: "ahⁿ" }, // a + nnh -> a + hnn -> ahⁿ
        { in: "innh", out: "ihⁿ" },
        // Edge case: Nh mapping
        { in: "aNh", out: "ahⁿ", config: { nasal: true } },  // Toggle ON
        { in: "aNh", out: "aNh", config: { nasal: false } }, // Toggle OFF

        // 4. Tone 6 (Acute vs Caron)
        { in: "si6", out: "sí", config: { tone6: false } }, // Default (false) -> acute (tone 2 style)
        { in: "si6", out: "sǐ", config: { tone6: true } },  // True -> caron

        // 5. All Caps (Detailed)
        // TS -> CH
        { in: "TSUI", out: "CHUI", config: { allCaps: true } },
        { in: "TSUI", out: "TSUI", config: { allCaps: false } },
        // TSH -> CHH
        { in: "TSHUI", out: "CHHUI", config: { allCaps: true } },
        // U -> O (standard rules apply in caps too)
        { in: "UAN", out: "OAN", config: { allCaps: true } },
        // OO -> O͘
        { in: "OO", out: "O͘", config: { allCaps: true } },

        // 6. Mixed text preserve
        { in: "123", out: "123" },
        { in: "Hello (Tâi-gí)!", out: "Hello (Tâi-gí)!" },
        { in: "html", out: "html" },

        // 7. Escape sequences \[...\]
        // Basic escape
        { in: "\\[Tâi-uân\\]", out: "Tâi-uân" },
        { in: "\\[tsuí\\]", out: "tsuí" },
        // Multi-line escape
        { in: "\\[line 1\nline 2\\]", out: "line 1\nline 2" },
        // Unclosed escape → escapes to EOF
        { in: "\\[no closing", out: "no closing" },
        // Nested \[ (first \] wins)
        { in: "\\[first \\[ second\\] rest", out: "first \\[ second rest" },
        // Mixed with conversion
        { in: "a tsuí \\[tsuí\\] b", out: "a chúi tsuí b" },
        // Regular ] inside escape
        { in: "\\[arr[0]\\]", out: "arr[0]" },

        // 8. POJ text preservation (POJ input should not be converted)
        // Syllables with ⁿ (POJ nasal superscript) should be preserved
        { in: "chiâⁿ", out: "chiâⁿ" },  // POJ stays POJ
        { in: "siaⁿ", out: "siaⁿ" },    // POJ nasal syllable
        { in: "koaⁿ", out: "koaⁿ" },    // POJ nasal with oa
        // Syllables with o͘ (POJ o-dot) should be preserved
        { in: "hó͘", out: "hó͘" },       // POJ o-dot syllable
        { in: "gô͘", out: "gô͘" },       // POJ o-dot with tone
        { in: "o͘", out: "o͘" },         // Standalone o-dot
        // Mixed POJ and TL (POJ preserved, TL converted)
        { in: "chiâⁿ tsuí", out: "chiâⁿ chúi" },  // POJ + TL
        { in: "hó͘ oo", out: "hó͘ o͘" },           // POJ o͘ + TL oo
        // Capital POJ
        { in: "Chiâⁿ", out: "Chiâⁿ" },  // Capital POJ nasal
        { in: "Ô͘", out: "Ô͘" }          // Capital POJ o-dot
      ];

      testCases.forEach(t => {
        total++;
        if (runTestCase(t.in, t.out, t.config)) {
          passed++;
        }
      });

      // Restore original state
      window.TL_USE_NASAL_SUPERSCRIPT = originalNasal;
      window.TL_TONE6_USE_CARON = originalTone6;
      window.TL_ALL_CAPS_SUPPORT = originalAllCaps;

      // console.log(`Self-test finished: ${passed}/${total} passed.`);
      if (passed === total) {
        // console.log("%cAll tests passed!", "color: green; font-weight: bold;");
      } else {
        console.error("Some tests failed. Check console for details.");
      }
    }

    // Initialize state check when loaded (in case script re-injected or page reload)
    updateState();

    return {
      convertText: TLtiau_2_POJtiau,
      convertPageContent: convertPageContent,
      convertSelection: convertSelection,
      fetchArticleContent: function () {
        try {
          // Clear any selected text on the page first
          window.getSelection().removeAllRanges();

          // Check if Readability is loaded
          if (typeof Readability === 'undefined') {
            console.error("Readability library not loaded.");
            return;
          }

          const documentClone = document.cloneNode(true);
          const reader = new Readability(documentClone);
          const article = reader.parse();

          if (article) {
            const title = article.title || document.title;
            const byline = article.byline ? `By ${article.byline}` : "";
            const url = window.location.href;

            // --- Markdown Conversion using Turndown ---
            let markdown = '';
            const Turndown = (typeof TurndownService !== 'undefined') ? TurndownService : (window.TurndownService || window['TurndownService']);
            const TurndownGfm = (typeof turndownPluginGfm !== 'undefined') ? turndownPluginGfm : (window.turndownPluginGfm || window['turndownPluginGfm']);

            if (Turndown) {
              try {
                const turndownService = new Turndown({
                  headingStyle: 'atx',
                  codeBlockStyle: 'fenced',
                  preformattedCode: true,
                  bulletListMarker: '-',
                });
                // Add GFM plugin if available (tables, strikethrough, etc.)
                if (TurndownGfm && TurndownGfm.gfm) {
                  turndownService.use(TurndownGfm.gfm);
                }

                // Custom rule for images (preserve original src)
                turndownService.addRule('images', {
                  filter: 'img',
                  replacement: function (content, node) {
                    const alt = node.getAttribute('alt') || '';
                    const src = node.getAttribute('src') || '';
                    const title = node.getAttribute('title');
                    if (!src) return '';
                    const titlePart = title ? ` "${title}"` : '';
                    return `![${alt}](${src}${titlePart})`;
                  }
                });

                // Get localized media labels for inline references (fallback to English)
                const inlineLabels = (typeof UI_STRINGS !== 'undefined' && UI_STRINGS.markdown) ? UI_STRINGS.markdown : {
                  videoLabel: 'Video',
                  audioLabel: 'Audio',
                  embedLabel: 'Embedded content'
                };

                // Custom rule for video elements
                turndownService.addRule('video', {
                  filter: 'video',
                  replacement: function (content, node) {
                    const src = node.getAttribute('src') || node.querySelector('source')?.getAttribute('src') || '';
                    const poster = node.getAttribute('poster') || '';
                    if (!src) return '';
                    const posterLabel = poster ? ` (poster: ${poster})` : '';
                    return `\n\n[🎬 ${inlineLabels.videoLabel}: ${src}${posterLabel}]\n\n`;
                  }
                });

                // Custom rule for audio elements
                turndownService.addRule('audio', {
                  filter: 'audio',
                  replacement: function (content, node) {
                    const src = node.getAttribute('src') || node.querySelector('source')?.getAttribute('src') || '';
                    if (!src) return '';
                    return `\n\n[🔊 ${inlineLabels.audioLabel}: ${src}]\n\n`;
                  }
                });

                // Custom rule for iframe (YouTube, Vimeo embeds)
                turndownService.addRule('iframe', {
                  filter: 'iframe',
                  replacement: function (content, node) {
                    const src = node.getAttribute('src') || '';
                    const title = node.getAttribute('title') || inlineLabels.embedLabel;
                    if (!src) return '';
                    return `\n\n[📺 ${title}: ${src}]\n\n`;
                  }
                });

                // Convert HTML content to Markdown
                if (article.content && article.content.trim().length > 0) {
                  markdown = turndownService.turndown(article.content);
                }

                // Poetry detection for markdown: if most paragraphs are short, collapse double newlines
                const mdLines = markdown.split('\n');
                const nonEmptyLines = mdLines.filter(l => l.trim().length > 0);
                const shortLines = nonEmptyLines.filter(l => l.trim().length <= 80);
                const mdIsPoetry = nonEmptyLines.length > 0 && (shortLines.length / nonEmptyLines.length) >= 0.6;
                // console.log(`[TL Converter] Markdown poetry detection: ${nonEmptyLines.length} lines, ${shortLines.length} short, isPoetry: ${mdIsPoetry}`);

                if (mdIsPoetry) {
                  // For poetry: collapse double newlines to single, but preserve triple+ as double (stanza breaks)
                  // First, mark stanza breaks (3+ newlines or lines with just whitespace between content)
                  markdown = markdown.replace(/\n{3,}/g, '\n⟪STANZA⟫\n');
                  // Collapse double newlines to single
                  markdown = markdown.replace(/\n\n/g, '\n');
                  // Restore stanza breaks as double newlines
                  markdown = markdown.replace(/⟪STANZA⟫/g, '\n');
                }

                // --- Extract media from original document with smart blacklist filtering ---
                // Blacklist patterns for URLs to exclude (sidebars, banners, tracking, social share, etc.)
                const urlBlacklist = [
                  // Ad networks and tracking
                  /ads?\./i, /banner/i, /pixel/i, /track/i, /analytics/i, /beacon/i,
                  /doubleclick/i, /googlesyndication/i, /googleadservices/i,
                  /facebook\.com\/tr/i, /fbcdn.*?\/rsrc/i,
                  // Social share widgets
                  /share/i, /sharer/i, /intent\/tweet/i, /pinterest\.com\/pin/i,
                  // Common UI/widget patterns
                  /widget/i, /sidebar/i, /related/i, /recommend/i, /popular/i,
                  /sprite/i, /icon/i, /logo/i, /avatar/i, /profile/i, /thumb/i,
                  // Navigation and footer
                  /nav/i, /menu/i, /footer/i, /header-logo/i,
                  // Tiny images (usually tracking pixels or icons)
                  /1x1/i, /spacer/i, /blank\./i, /transparent\./i,
                  // CDN patterns for UI assets
                  /\/static\/.*?(icon|button|ui)/i,
                ];

                // Helper to check if URL should be excluded
                const isBlacklistedUrl = (url) => {
                  if (!url) return true;
                  return urlBlacklist.some(pattern => pattern.test(url));
                };

                // Find the main article container in the original document
                const articleContainer = document.querySelector('article') ||
                  document.querySelector('[role="main"]') ||
                  document.querySelector('main') ||
                  document.querySelector('.post-content') ||
                  document.querySelector('.entry-content') ||
                  document.querySelector('.content') ||
                  document.body;

                const extractedMedia = {
                  images: [],
                  videos: [],
                  audio: [],
                  iframes: []
                };

                if (articleContainer) {
                  // Extract images (filtered)
                  articleContainer.querySelectorAll('img').forEach(img => {
                    const src = img.getAttribute('src');
                    if (src && !src.startsWith('data:') && !isBlacklistedUrl(src)) {
                      // Also filter by size if available (skip tiny images)
                      const width = img.naturalWidth || img.width || 0;
                      const height = img.naturalHeight || img.height || 0;
                      if (width === 0 || width > 50 || height > 50) { // Skip obvious icons/pixels
                        extractedMedia.images.push({
                          src: src,
                          alt: img.getAttribute('alt') || '',
                          title: img.getAttribute('title') || ''
                        });
                      }
                    }
                  });

                  // Extract videos (filtered)
                  articleContainer.querySelectorAll('video').forEach(video => {
                    const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src');
                    if (src && !isBlacklistedUrl(src)) {
                      extractedMedia.videos.push({
                        src: src,
                        poster: video.getAttribute('poster') || ''
                      });
                    }
                  });

                  // Extract audio (filtered)
                  articleContainer.querySelectorAll('audio').forEach(audio => {
                    const src = audio.getAttribute('src') || audio.querySelector('source')?.getAttribute('src');
                    if (src && !isBlacklistedUrl(src)) {
                      extractedMedia.audio.push({ src: src });
                    }
                  });

                  // Extract iframes (YouTube, Vimeo, etc. - filtered)
                  articleContainer.querySelectorAll('iframe').forEach(iframe => {
                    const src = iframe.getAttribute('src');
                    if (src && !isBlacklistedUrl(src)) {
                      // Use inlineLabels from earlier (or provide fallback)
                      const embedFallback = (typeof UI_STRINGS !== 'undefined' && UI_STRINGS.markdown && UI_STRINGS.markdown.embedLabel)
                        ? UI_STRINGS.markdown.embedLabel
                        : 'Embedded content';
                      extractedMedia.iframes.push({
                        src: src,
                        title: iframe.getAttribute('title') || embedFallback
                      });
                    }
                  });
                }

                let mediaSection = '';

                // Log for debugging
                // console.log('[TL Converter] Extracted media (with blacklist filtering):', extractedMedia);

                // Get localized headers (fallback to English if UI_STRINGS not available)
                const mdStrings = (typeof UI_STRINGS !== 'undefined' && UI_STRINGS.markdown) ? UI_STRINGS.markdown : {
                  imagesHeader: '🖼️ Images',
                  videosHeader: '🎬 Videos',
                  audioHeader: '🔊 Audio',
                  embedHeader: '📺 Embedded Content',
                  imageLabel: 'Image',
                  videoLabel: 'Video',
                  audioLabel: 'Audio',
                  embedLabel: 'Embedded content'
                };

                // Add images
                if (extractedMedia.images.length > 0) {
                  mediaSection += `\n\n---\n\n### ${mdStrings.imagesHeader}\n\n`;
                  extractedMedia.images.forEach(img => {
                    const altText = img.alt || mdStrings.imageLabel;
                    mediaSection += `- ![${altText}](${img.src})`;
                    if (img.title) mediaSection += ` "${img.title}"`;
                    mediaSection += '\n';
                  });
                }

                // Add videos
                if (extractedMedia.videos.length > 0) {
                  mediaSection += `\n\n### ${mdStrings.videosHeader}\n\n`;
                  extractedMedia.videos.forEach(v => {
                    mediaSection += `- [${mdStrings.videoLabel}](${v.src})`;
                    if (v.poster) mediaSection += ` (poster: ${v.poster})`;
                    mediaSection += '\n';
                  });
                }

                // Add audio
                if (extractedMedia.audio.length > 0) {
                  mediaSection += `\n\n### ${mdStrings.audioHeader}\n\n`;
                  extractedMedia.audio.forEach(a => {
                    mediaSection += `- [${mdStrings.audioLabel}](${a.src})\n`;
                  });
                }

                // Add iframes (YouTube, Vimeo, etc.)
                if (extractedMedia.iframes.length > 0) {
                  mediaSection += `\n\n### ${mdStrings.embedHeader}\n\n`;
                  extractedMedia.iframes.forEach(f => {
                    const iframeTitle = f.title || mdStrings.embedLabel;
                    mediaSection += `- [${iframeTitle}](${f.src})\n`;
                  });
                }

                if (mediaSection) {
                  markdown += mediaSection;
                }

                if (!markdown || markdown.trim().length === 0) {
                  markdown = `_[Markdown conversion returned empty content]_`;
                }

              } catch (err) {
                console.error("Turndown conversion error:", err);
                markdown = `_[Markdown conversion failed: ${err.message}]_`;
              }
            } else {
              console.warn("TurndownService not found via typeof or window");
              markdown = `_[Turndown library not loaded. Typeof: ${typeof TurndownService}, Window: ${!!window.TurndownService}]_`;
            }

            // --- Plain Text with preserved newlines (fallback/option) ---
            const tempDiv = document.createElement('div');
            let contentHtml = article.content;

            // Global content-type detection: Poetry vs Prose
            // Poetry: mostly short lines, single newlines between lines, double for stanzas
            // Prose: longer paragraphs, double newlines between paragraphs
            const POEM_LINE_THRESHOLD = 80;
            const POEM_RATIO_THRESHOLD = 0.6; // If >60% of paragraphs are short, treat as poetry

            // First pass: analyze all paragraphs to determine content type
            const paragraphs = [];
            contentHtml.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, inner) => {
              const textOnly = inner.replace(/<[^>]+>/g, '').trim();
              if (textOnly.length > 0) {
                paragraphs.push(textOnly.length);
              }
              return match;
            });

            const shortCount = paragraphs.filter(len => len <= POEM_LINE_THRESHOLD).length;
            const isPoetry = paragraphs.length > 0 && (shortCount / paragraphs.length) >= POEM_RATIO_THRESHOLD;

            // console.log(`[TL Converter] Content detection: ${paragraphs.length} paragraphs, ${shortCount} short (≤${POEM_LINE_THRESHOLD} chars), isPoetry: ${isPoetry}`);

            // Second pass: apply appropriate newlines based on content type
            if (isPoetry) {
              // Poetry mode: single newlines between lines, but detect visible stanza breaks
              // Detect various stanza gap patterns and mark them:
              // 1. Empty <p> tags
              contentHtml = contentHtml.replace(/<p[^>]*>\s*<\/p>/gi, '⟪STANZA_BREAK⟫');
              // 2. Paragraphs with only &nbsp; or whitespace entities
              contentHtml = contentHtml.replace(/<p[^>]*>(?:&nbsp;|\s)*<\/p>/gi, '⟪STANZA_BREAK⟫');
              // 3. Multiple consecutive <br> tags (2 or more)
              contentHtml = contentHtml.replace(/(<br\s*\/?>\s*){2,}/gi, '⟪STANZA_BREAK⟫');
              // Single newlines after regular paragraphs
              contentHtml = contentHtml.replace(/<\/p>/gi, '</p>\n');
              // Single newline for single <br>
              contentHtml = contentHtml.replace(/<br\s*\/?>/gi, '\n');
              // Restore stanza breaks as double newlines
              contentHtml = contentHtml.replace(/⟪STANZA_BREAK⟫/g, '\n\n');
            } else {
              // Prose mode: double newlines between paragraphs
              contentHtml = contentHtml.replace(/<\/p>/gi, '</p>\n\n');
            }

            contentHtml = contentHtml.replace(/<\/h[1-6]>/gi, (match) => match + '\n\n');
            // For prose, <br> still gets single newline (poetry handled above)
            if (!isPoetry) {
              contentHtml = contentHtml.replace(/<br\s*\/?>/gi, '<br>\n');
            }
            contentHtml = contentHtml.replace(/<\/div>/gi, '</div>\n\n');
            contentHtml = contentHtml.replace(/<\/li>/gi, '</li>\n');

            tempDiv.innerHTML = contentHtml;
            const rawText = tempDiv.textContent;

            // Clean up: trim each line, then collapse excessive newlines
            const cleanText = rawText
              .split('\n')
              .map(line => line.trim())
              .join('\n')
              .replace(/\n{3,}/g, '\n\n');

            const plainText = cleanText.replace(/\n{3,}/g, '\n\n');

            // Final cleanup for markdown: ensure no more than 2 consecutive newlines
            const cleanMarkdown = markdown.replace(/\n{3,}/g, '\n\n');

            // Get source label (use same mdStrings reference or create new)
            const sourceLabel = (typeof UI_STRINGS !== 'undefined' && UI_STRINGS.markdown && UI_STRINGS.markdown.sourceLabel)
              ? UI_STRINGS.markdown.sourceLabel
              : 'Source';

            // Format final outputs with title and source
            let formattedMarkdown = `# ${title}\n${byline ? byline + '\n' : ''}\n${cleanMarkdown}\n\n---\n${sourceLabel}: ${url}`;
            let formattedPlainText = `${title}\n${byline ? byline + '\n' : ''}\n${plainText}\n\n${sourceLabel}: ${url}`;

            // Helper: Remove duplicate title line (if first two non-empty lines are identical)
            const removeDuplicateTitle = (text) => {
              const lines = text.split('\n');
              const nonEmptyIndices = [];
              for (let i = 0; i < lines.length && nonEmptyIndices.length < 2; i++) {
                if (lines[i].trim().length > 0) {
                  nonEmptyIndices.push(i);
                }
              }
              if (nonEmptyIndices.length === 2) {
                // Strip all markdown heading prefixes (any number of #)
                const line1 = lines[nonEmptyIndices[0]].replace(/^#+\s*/, '').trim();
                const line2 = lines[nonEmptyIndices[1]].replace(/^#+\s*/, '').trim();
                if (line1 === line2) {
                  lines.splice(nonEmptyIndices[1], 1);
                }
              }
              return lines.join('\n');
            };

            formattedMarkdown = removeDuplicateTitle(formattedMarkdown);
            formattedPlainText = removeDuplicateTitle(formattedPlainText);

            // Final cleanup: normalize whitespace-only lines to empty, then collapse 3+ newlines to 2
            const finalCleanup = (text) => {
              return text
                .split('\n')
                .map(line => line.trim().length === 0 ? '' : line)  // Normalize whitespace-only lines
                .join('\n')
                .replace(/\n{3,}/g, '\n\n');  // Collapse 3+ newlines
            };
            formattedMarkdown = finalCleanup(formattedMarkdown);
            formattedPlainText = finalCleanup(formattedPlainText);

            // Store for side panel to pull if it opens late
            window.TL_LAST_FETCHED_ARTICLE = {
              markdown: formattedMarkdown,
              plainText: formattedPlainText,
              title: title,
              sourceUrl: url
            };

            // Send to Side Panel (both versions)
            chrome.runtime.sendMessage({
              type: 'TL_EXTENSION_SELECTION_UPDATE',
              markdown: formattedMarkdown,
              plainText: formattedPlainText,
              text: formattedPlainText, // Backward compatibility
              title: title,
              sourceUrl: url,
              isArticle: true
            }).catch(e => { /* console.log("Side panel might be closed / opening", e) */ });

          } else {
            // console.log("Readability could not parse article.");
            // Send error message to sidepanel for toast display
            chrome.runtime.sendMessage({
              type: 'TL_EXTENSION_FETCH_ERROR',
              errorType: 'NO_ARTICLE'
            }).catch(e => { /* console.log("Side panel might be closed", e) */ });
          }
        } catch (e) {
          console.error("Fetch article failed:", e);
        }
      },
      undo: undo,
      undoAll: undoAll,
      runTests: runTests
    };

    // Self-test on load (Default: OFF)
    const ENABLE_SELF_TEST = false;
    if (ENABLE_SELF_TEST) {
      runTests();
    }

    return exports;
  })();
}

