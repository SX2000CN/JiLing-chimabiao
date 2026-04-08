const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const errors = [];

function ensureExists(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

function readText(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

function verifyDocsReadmeLinks() {
  const docsReadmePath = path.join(repoRoot, 'docs', 'README.md');
  if (!fs.existsSync(docsReadmePath)) {
    errors.push('docs/README.md not found, cannot validate docs links.');
    return;
  }

  const content = fs.readFileSync(docsReadmePath, 'utf8');
  const matches = [...content.matchAll(/`([^`]+\.md)`/g)];

  for (const match of matches) {
    const raw = match[1];
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      continue;
    }

    const resolved = raw.startsWith('../')
      ? path.resolve(repoRoot, 'docs', raw)
      : path.resolve(repoRoot, 'docs', raw);

    if (!fs.existsSync(resolved)) {
      const relative = path.relative(repoRoot, resolved).replace(/\\/g, '/');
      errors.push(`Broken docs reference in docs/README.md: ${raw} -> ${relative}`);
    }
  }
}

function verifyScriptCommands() {
  const packageJsonPath = path.join(repoRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    errors.push('package.json not found, cannot verify scripts.');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const scripts = pkg.scripts || {};
  const requiredScripts = ['lint:check', 'type-check', 'test', 'build', 'verify', 'verify:docs'];

  for (const scriptName of requiredScripts) {
    if (!scripts[scriptName]) {
      errors.push(`Missing package script: ${scriptName}`);
    }
  }
}

function verifyArtifactsOutputConfig() {
  const viteConfig = readText('vite.config.js');
  if (!viteConfig.includes("outDir: 'artifacts/dist'")) {
    errors.push("vite.config.js is not configured with outDir: 'artifacts/dist'.");
  }

  const pkg = JSON.parse(readText('package.json'));
  const electronOutput = pkg?.build?.directories?.output;
  if (electronOutput !== 'artifacts/dist-electron') {
    errors.push("package.json build.directories.output must be 'artifacts/dist-electron'.");
  }

  const mainProcess = readText('main.cjs');
  if (!mainProcess.includes("path.join(__dirname, 'artifacts', 'dist', 'index.html')")) {
    errors.push('main.cjs production load path is not pointing to artifacts/dist/index.html.');
  }
}

function main() {
  ensureExists('README.md');
  ensureExists('docs/README.md');
  ensureExists('docs/PROJECT_STRUCTURE.md');
  ensureExists('docs/REMEDIATION_REORG_PLAN.md');
  ensureExists('.github/pull_request_template.md');

  verifyDocsReadmeLinks();
  verifyScriptCommands();
  verifyArtifactsOutputConfig();

  if (errors.length > 0) {
    console.error('Documentation verification failed:');
    for (const issue of errors) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log('Documentation verification passed.');
}

main();
