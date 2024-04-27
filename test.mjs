import { readFileSync, writeFileSync } from "fs";
import pdfJs from "pdfjs-dist/build/pdf.js"; // using pdfjs-dist v2.6.347 works - preserves unicode minuses
import { replaceUnicodeChars } from "./unicode.mjs";

const defaultOptions = {
  getDocument: {
    verbosity: -1,
  },
  getTextContent: {
    // normalizeWhitespace: false,
    // disableCombineTextItems: false,
  },
};

async function extractPage1(
  buffer,
  getDocumentOptions = defaultOptions.getDocument,
  getTextContentOptions = defaultOptions.getTextContent
) {
  const options = { ...getDocumentOptions, data: new Uint8Array(buffer) };
  const doc = await pdfJs.getDocument(options);
  const text = await loadPage(1, getTextContentOptions);
  return text;
}

async function loadPage(pageNum, options = defaultOptions.getTextContent) {
  const page = await doc.getPage(pageNum);
  const content = await page.getTextContent(options);
  return content.items.map((item) => ({
    str: item.str,
    y: item.y,
  }));
}

async function run(filename, password, yLine) {
  const options = password
    ? { password }
    : { normalizeWhitespace: false, disableCombineTextItems: false };
  const buffer = readFileSync(filename);
  const raw = await extractPage1(buffer);
  let line = raw.filter((x) => x.y === yLine);
  replaceUnicodeChars(line);
  const fixed = line.map((x) => x.str).join();
  console.log(fixed);
  let p = filename.slice(0, -4) + ".raw.json";
  writeFileSync(p, JSON.stringify(raw.data, null, 2));
  console.log("wrote:", p);
}

// run("/code/prototype/pdf.js-extract-minus/3.pdf", undefined, 397);
run(
  "/code/prototype/pdf.js-extract-minus/4.pdf",
  undefined,
  248.10181548000003
);
