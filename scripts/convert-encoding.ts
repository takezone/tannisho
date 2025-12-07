/**
 * SHIFT-JISからUTF-8へのエンコーディング変換スクリプト
 *
 * 使用方法:
 *   npx ts-node scripts/convert-encoding.ts <入力ディレクトリ> <出力ディレクトリ>
 *
 * 例:
 *   npx ts-node scripts/convert-encoding.ts ./downloads/shinshu ./data/kyogyoshinsho
 *
 * 依存関係:
 *   npm install iconv-lite
 */

import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";

function detectEncoding(buffer: Buffer): string {
  // SHIFT-JISの特徴的なバイトパターンをチェック
  // 0x81-0x9F または 0xE0-0xFC の範囲で始まる2バイト文字
  let shiftJisScore = 0;
  let utf8Score = 0;

  for (let i = 0; i < buffer.length - 1; i++) {
    const b1 = buffer[i];
    const b2 = buffer[i + 1];

    // SHIFT-JIS判定
    if (
      (b1 >= 0x81 && b1 <= 0x9f) ||
      (b1 >= 0xe0 && b1 <= 0xfc)
    ) {
      if (
        (b2 >= 0x40 && b2 <= 0x7e) ||
        (b2 >= 0x80 && b2 <= 0xfc)
      ) {
        shiftJisScore++;
        i++; // 2バイト文字なので次へ
      }
    }

    // UTF-8判定（3バイト日本語文字）
    if (i < buffer.length - 2) {
      const b3 = buffer[i + 2];
      if (
        b1 >= 0xe0 && b1 <= 0xef &&
        b2 >= 0x80 && b2 <= 0xbf &&
        b3 >= 0x80 && b3 <= 0xbf
      ) {
        utf8Score++;
      }
    }
  }

  // BOMチェック
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return "utf-8";
  }

  return utf8Score > shiftJisScore ? "utf-8" : "shift_jis";
}

function convertFile(inputPath: string, outputPath: string): void {
  const buffer = fs.readFileSync(inputPath);
  const encoding = detectEncoding(buffer);

  let content: string;
  if (encoding === "utf-8") {
    content = buffer.toString("utf-8");
    // BOM除去
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }
    console.log(`  [UTF-8] ${path.basename(inputPath)}`);
  } else {
    content = iconv.decode(buffer, "Shift_JIS");
    console.log(`  [SHIFT-JIS → UTF-8] ${path.basename(inputPath)}`);
  }

  // 改行コードをLFに統一
  content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 出力ディレクトリが存在しない場合は作成
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, "utf-8");
}

function convertDirectory(inputDir: string, outputDir: string): void {
  if (!fs.existsSync(inputDir)) {
    console.error(`エラー: 入力ディレクトリが見つかりません: ${inputDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(inputDir);
  const txtFiles = files.filter((f) => f.endsWith(".txt"));

  if (txtFiles.length === 0) {
    console.log("変換対象の.txtファイルが見つかりません。");
    return;
  }

  console.log(`${txtFiles.length} 個のファイルを変換します...\n`);

  for (const file of txtFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    convertFile(inputPath, outputPath);
  }

  console.log(`\n完了！ファイルは ${outputDir} に保存されました。`);
}

// メイン処理
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
使用方法:
  npx ts-node scripts/convert-encoding.ts <入力ディレクトリ> <出力ディレクトリ>

例:
  npx ts-node scripts/convert-encoding.ts ./downloads/shinshu ./data/kyogyoshinsho

説明:
  SHIFT-JISでエンコードされたテキストファイルをUTF-8に変換します。
  すでにUTF-8のファイルはそのままコピーされます。
`);
  process.exit(0);
}

const [inputDir, outputDir] = args;
convertDirectory(inputDir, outputDir);
