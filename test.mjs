import { readFileSync, writeFileSync } from "fs";
import pdfJs from "pdfjs-dist/build/pdf.js"; // using pdfjs-dist v2.6.347 works - preserves unicode minuses
import { replaceUnicodeChars } from "./unicode.mjs";

const __dirname = import.meta.url.substr(7).replace(/[\\/][^\\/]*$/, "");

const defaultOptions = {
  getDocument: {
    // verbosity: -1,
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
  const doc = await pdfJs.getDocument(options).promise;
  const text = await loadPage(1, doc, getTextContentOptions);
  return text;
}

async function loadPage(pageNum, doc, options = defaultOptions.getTextContent) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.0 });
  const content = await page.getTextContent(options);
  return content.items.map((item) => {
    const tm = item.transform;
    const x = tm[4];
    const y = viewport.height - tm[5];
    return {
      str: item.str,
      x,
      y,
    };
  });
}

async function run(filename, password, yLine) {
  const options = password
    ? { password }
    : { normalizeWhitespace: false, disableCombineTextItems: false };
  const buffer = readFileSync(filename);
  const raw = await extractPage1(buffer);
  const line = raw.filter((x) => x.y === yLine);
  replaceUnicodeChars(line);

  // check whether minuses are preserved on the line?
  const fixed = line.map((x) => x.str).join();
  console.log(fixed);

  /// dump to raw.json
  const p = filename.slice(0, -4) + ".raw.json";
  writeFileSync(p, JSON.stringify(raw, null, 2));
  console.log("wrote:", p);
}

run(__dirname + "/0.pdf", undefined, 248.10181548000003);
