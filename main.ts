import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * 狗狗视角给邮递员写的单行点评（严格控制在 200 个码点以内）。
 */
const REVIEW =
  "2/5 stars: Trespasses daily at 11:04 sharp, shoves paper that makes my human groan, never pays the biscuit tax—gets one bonus star for running away terrified on schedule every time.";

/**
 * 解析命令行参数或环境变量中的输出目标路径，默认输出到 /output/entry.txt。
 */
function resolveOutputPath(argv: string[], env: NodeJS.ProcessEnv): string {
  let fileOrDir: string | undefined;
  let outDir: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out-dir" && i + 1 < argv.length) {
      outDir = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--out-dir=")) {
      outDir = arg.slice("--out-dir=".length);
    } else if ((arg === "--out" || arg === "--output" || arg === "-o") && i + 1 < argv.length) {
      fileOrDir = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--out=")) {
      fileOrDir = arg.slice("--out=".length);
    } else if (arg.startsWith("--output=")) {
      fileOrDir = arg.slice("--output=".length);
    }
  }

  if (fileOrDir) {
    const looksLikeDir =
      fileOrDir.endsWith("/") ||
      fileOrDir.endsWith("\\") ||
      (existsSync(fileOrDir) && statSync(fileOrDir).isDirectory());
    return looksLikeDir ? join(fileOrDir, "entry.txt") : fileOrDir;
  }

  if (outDir) {
    return join(outDir, "entry.txt");
  }

  if (env.MAKEFUN_OUTPUT_DIR && env.MAKEFUN_OUTPUT_DIR.trim().length > 0) {
    return join(env.MAKEFUN_OUTPUT_DIR, "entry.txt");
  }

  return "/output/entry.txt";
}

function main(): void {
  const line = REVIEW.trim();
  const codePoints = [...line].length;
  if (codePoints === 0 || codePoints > 200 || line.includes("\n") || line.includes("\r")) {
    throw new Error(`Invalid entry length or format: ${codePoints} code points`);
  }

  const outPath = resolveOutputPath(process.argv.slice(2), process.env);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, line, "utf8");
}

main();
