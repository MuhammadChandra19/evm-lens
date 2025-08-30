#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRIZZLE_DIR = path.join(__dirname, '..', 'drizzle');
const MIGRATION_INDEX_FILE = path.join(__dirname, '..', 'src', 'repository', 'migration', 'index.ts');
const JOURNAL_FILE = path.join(DRIZZLE_DIR, 'meta', '_journal.json');

/**
 * Read and parse the Drizzle journal file to get migration metadata
 */
function readJournal() {
  try {
    const journalContent = fs.readFileSync(JOURNAL_FILE, 'utf8');
    return JSON.parse(journalContent);
  } catch (error) {
    console.error('❌ Error reading journal file:', error.message);
    process.exit(1);
  }
}

/**
 * Get all SQL migration files from the drizzle directory
 */
function getMigrationFiles() {
  try {
    const files = fs.readdirSync(DRIZZLE_DIR);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure consistent order
  } catch (error) {
    console.error('❌ Error reading drizzle directory:', error.message);
    process.exit(1);
  }
}

/**
 * Parse existing migration index file to get current migrations
 */
function parseExistingMigrations() {
  try {
    if (!fs.existsSync(MIGRATION_INDEX_FILE)) {
      return { imports: [], migrations: [] };
    }

    const content = fs.readFileSync(MIGRATION_INDEX_FILE, 'utf8');
    
    // Extract imports
    const importRegex = /import\s+(\w+)\s+from\s+"([^"]+)";/g;
    const imports = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        variable: match[1],
        path: match[2],
        fileName: path.basename(match[2].replace('?raw', ''))
      });
    }

    // Extract migration objects
    const migrationArrayMatch = content.match(/const migrations: MigrationMeta\[\] = \[([\s\S]*?)\];/);
    const migrations = [];
    
    if (migrationArrayMatch) {
      // Parse each migration object
      const migrationContent = migrationArrayMatch[1];
      const migrationRegex = /{\s*sql:\s*\[(\w+)\],\s*folderMillis:\s*(\d+),\s*hash:\s*"([^"]+)",\s*bps:\s*(true|false),?\s*}/g;
      
      while ((match = migrationRegex.exec(migrationContent)) !== null) {
        migrations.push({
          variable: match[1],
          folderMillis: parseInt(match[2]),
          hash: match[3],
          bps: match[4] === 'true'
        });
      }
    }

    return { imports, migrations };
  } catch (error) {
    console.log('⚠️  Could not parse existing migrations, will regenerate all:', error.message);
    return { imports: [], migrations: [] };
  }
}

/**
 * Generate the migration index file content (incremental)
 */
function generateMigrationIndex(journal, migrationFiles) {
  const existing = parseExistingMigrations();
  
  // Create a map of existing migrations by hash
  const existingMigrations = new Map();
  existing.migrations.forEach(migration => {
    existingMigrations.set(migration.hash, migration);
  });

  // Create a map of existing imports by fileName
  const existingImports = new Map();
  existing.imports.forEach(imp => {
    existingImports.set(imp.fileName, imp);
  });

  // Create a map of journal entries
  const journalMap = {};
  journal.entries.forEach(entry => {
    journalMap[entry.tag] = entry;
  });

  const imports = [];
  const migrations = [];
  let variableCounter = existing.imports.length;

  migrationFiles.forEach((file) => {
    const fileName = path.basename(file, '.sql');
    
    // Check if this migration already exists
    if (existingMigrations.has(fileName)) {
      // Use existing migration
      const existingMigration = existingMigrations.get(fileName);
      const existingImport = existingImports.get(file);
      
      if (existingImport) {
        imports.push(`import ${existingImport.variable} from "${existingImport.path}";`);
        migrations.push(`  {
    sql: [${existingImport.variable}],
    folderMillis: ${existingMigration.folderMillis},
    hash: "${existingMigration.hash}",
    bps: ${existingMigration.bps},
  }`);
      }
    } else {
      // Add new migration
      variableCounter++;
      const variableName = `m${variableCounter}`;
      
      // Add import statement
      imports.push(`import ${variableName} from "../../../drizzle/${file}?raw";`);
      
      // Get journal entry for this migration
      const journalEntry = journalMap[fileName];
      const folderMillis = journalEntry ? journalEntry.when : 0;
      const bps = journalEntry ? journalEntry.breakpoints : false;
      
      // Add migration object
      migrations.push(`  {
    sql: [${variableName}],
    folderMillis: ${folderMillis},
    hash: "${fileName}",
    bps: ${bps},
  }`);
      
      console.log(`➕ Adding new migration: ${fileName}`);
    }
  });

  return `${imports.join('\n')}

import { MigrationMeta } from "./migrate-browser";
const migrations: MigrationMeta[] = [
${migrations.join(',\n')}
];

export default migrations;
`;
}

/**
 * Write the updated migration index file
 */
function writeMigrationIndex(content) {
  try {
    fs.writeFileSync(MIGRATION_INDEX_FILE, content, 'utf8');
    console.log('✅ Migration index file updated successfully!');
  } catch (error) {
    console.error('❌ Error writing migration index file:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Updating migration index file...');
  
  // Check if drizzle directory exists
  if (!fs.existsSync(DRIZZLE_DIR)) {
    console.error('❌ Drizzle directory not found. Please run "npx drizzle-kit generate" first.');
    process.exit(1);
  }

  // Check if journal file exists
  if (!fs.existsSync(JOURNAL_FILE)) {
    console.error('❌ Journal file not found. Please run "npx drizzle-kit generate" first.');
    process.exit(1);
  }

  const journal = readJournal();
  const migrationFiles = getMigrationFiles();

  if (migrationFiles.length === 0) {
    console.log('ℹ️  No migration files found.');
    return;
  }

  console.log(`📁 Found ${migrationFiles.length} migration file(s):`);
  migrationFiles.forEach(file => console.log(`   - ${file}`));

  // Parse existing migrations to see what's already there
  const existing = parseExistingMigrations();
  console.log(`📋 Current migration index has ${existing.migrations.length} migration(s)`);

  const content = generateMigrationIndex(journal, migrationFiles);
  writeMigrationIndex(content);

  console.log(`✅ Migration index updated successfully!`);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
