/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:vLEIVA220503%2A%2F@db.trwpwqrncgszuvuvfbyo.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Connected to DB. Dropping existing tables to re-apply migrations cleanly...");
  const tables = [
    'movement_tags', 'attachments', 'transfers', 'budgets', 'savings_contributions',
    'savings_goals', 'movements', 'recurring_transactions', 'tags', 'payment_methods',
    'categories', 'accounts', 'app_settings'
  ];

  for (const table of tables) {
    try {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
    } catch (e) {
      console.log(`Failed to drop ${table}:`, e.message);
    }
  }

  console.log("Running migrations...");
  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_indexes.sql',
    '004_triggers.sql'
  ];

  for (const file of migrations) {
    console.log(`Applying ${file}...`);
    const sql = fs.readFileSync(path.join(__dirname, 'supabase/migrations', file), 'utf8');
    try {
      await client.query(sql);
      console.log(`${file} applied successfully.`);
    } catch (e) {
      console.error(`Error applying ${file}:`, e.message);
      // We log but continue, although in production we might abort
    }
  }

  await client.end();
  console.log("Done.");
}

run().catch(console.error);
