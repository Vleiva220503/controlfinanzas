const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const connectionString = "postgresql://postgres:vLEIVA220503%2A%2F@db.trwpwqrncgszuvuvfbyo.supabase.co:5432/postgres";
async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, 'supabase/migrations', '006_notifications.sql'), 'utf8');
  await client.query(sql);
  await client.end();
  console.log("Applied 006");
}
run().catch(console.error);
