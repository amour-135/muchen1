const { Client } = require('pg');

const supabaseHost = "nufczinldozwykzgfxia.supabase.co";
const supabasePort = 5432;
const supabaseDatabase = "postgres";
const supabaseUser = "postgres";
const supabasePassword = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

console.log('Connecting to Supabase...');

const client = new Client({
    host: supabaseHost,
    port: supabasePort,
    database: supabaseDatabase,
    user: supabaseUser,
    password: supabasePassword,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 120000
});

async function createTable() {
    try {
        await client.connect();
        console.log('✅ Connected successfully!');
        
        console.log('\nCreating table in api schema...');
        
        const createTableSql = `
            DROP TABLE IF EXISTS api.community_data;
            CREATE TABLE api.community_data (
                id SERIAL PRIMARY KEY,
                post_title text,
                post_url text,
                post_id text,
                author text,
                author_url text,
                post_content text,
                publish_time text,
                view_count text,
                sentiment text,
                category text
            );
            ALTER TABLE api.community_data ENABLE ROW LEVEL SECURITY;
        `;
        
        await client.query(createTableSql);
        console.log('✅ Table created in api schema!');
        
        const result = await client.query("SELECT * FROM information_schema.columns WHERE table_name = 'community_data'");
        console.log('\nTable columns:');
        result.rows.forEach(col => {
            console.log(`  ${col.table_schema}.${col.column_name}: ${col.data_type}`);
        });
        
        await client.end();
        console.log('\n✅ Connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await client.end();
    }
}

createTable();
