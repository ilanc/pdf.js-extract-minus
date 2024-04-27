export function replaceUnicodeChars(line) {
  if (!line) return;
  for (const x of line) {
    if (x.str) {
      const charCodes = [...x.str].map((x) => x.charCodeAt(0));
      if (detectUnicodeChars(x.str, charCodes)) {
        const r = replaceKnownUnicodeChars(charCodes, x);
        x.str = r;
      }
    }
  }
}

function detectUnicodeChars(_str, charCodes) {
  for (const c of charCodes) {
    // extended chars: > 126
    // control chars: < 32, except 9 (\t), 10 (\n) and 13 (\r)
    if (c > 126 || (c < 32 && c != 9 && c != 10 && c != 13)) {
      return true;
    }
  }
  return false;
}

function replaceKnownUnicodeChars(charCodes, _x) {
  // _x included for inspection in debugger
  return charCodes
    .map((c) => {
      switch (c) {
        case 0:
          return " ";
        case 160:
          return " ";
        case 173:
          return "-";
        case 8208:
          return "-";
        case 64257: // "ﬁ".charCodeAt(0) => fi
          return "fi";
        default:
          return String.fromCharCode(c);
      }
    })
    .join("");
}
