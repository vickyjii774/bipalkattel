
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '..');
const databaseModule = pathToFileURL(
  path.join(projectRoot, 'backend', 'db.js')
).href;

function runDatabaseScript(dataDir, script) {
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd: projectRoot,
      env: { ...process.env, DATA_DIR: dataDir },
      encoding: 'utf8',
      windowsHide: true
    }
  );

  if (result.error) {
    throw result.error;
  }

  return result;
}

test('JSON database writes atomically and can be read back', () => {
  const dataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'bipal-db-test-')
  );

  try {
    const script = `
      const db = await import(${JSON.stringify(databaseModule)});
      const value = {
        ...db.defaultDb,
        projects: [{ id: 'test-project' }]
      };

      db.writeDb(value);

      const result = db.readDb();

      if (result.projects[0].id !== 'test-project') {
        process.exit(2);
      }
    `;

    const result = runDatabaseScript(dataDir, script);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(
      fs.existsSync(path.join(dataDir, 'db.json')),
      true
    );

    assert.equal(
      fs.readdirSync(dataDir).some((name) => name.endsWith('.tmp')),
      false
    );
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});

test('database corruption is reported rather than silently reset', () => {
  const dataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'bipal-db-corrupt-')
  );

  try {
    const databaseFile = path.join(dataDir, 'db.json');
    fs.writeFileSync(databaseFile, '{invalid json');

    const script = `
      const db = await import(${JSON.stringify(databaseModule)});

      try {
        db.readDb();
        process.exit(2);
      } catch (error) {
        if (!error.message.includes('invalid')) {
          process.exit(3);
        }
      }
    `;

    const result = runDatabaseScript(dataDir, script);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(
      fs.readFileSync(databaseFile, 'utf8'),
      '{invalid json'
    );
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});
