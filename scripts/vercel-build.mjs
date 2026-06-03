import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const webDir = join(rootDir, "apps", "web");
const webOutputDir = join(webDir, ".vercel", "output");
const rootOutputDir = join(rootDir, ".vercel", "output");

execSync("npm install --legacy-peer-deps", { cwd: webDir, stdio: "inherit" });
execSync("npm run build", { cwd: webDir, stdio: "inherit" });

if (existsSync(webOutputDir)) {
  rmSync(rootOutputDir, { recursive: true, force: true });
  mkdirSync(join(rootDir, ".vercel"), { recursive: true });
  cpSync(webOutputDir, rootOutputDir, { recursive: true });
  console.log("Copied Vercel build output to repository root.");
} else {
  console.log(
    "No .vercel/output directory was generated locally. This is expected outside the Vercel environment.",
  );
}
