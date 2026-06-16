const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://nufczinldozwykzgfxia.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    schema: 'public'
});

async function createTable() {
    try {
        console.log('Checking for execute_sql function...');
        
        const createFunctionSql = `
            CREATE OR REPLACE FUNCTION execute_sql(sql TEXT) 
            RETURNS TEXT AS $$
            BEGIN
                EXECUTE sql;
                RETURN 'success';
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            
            GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO anon, authenticated;
        `;
        
        const { data: fnData, error: fnError } = await supabase.rpc('execute_sql', { sql: createFunctionSql });
        
        if (fnError) {
            console.log('Function may not exist, trying to create...');
            
            const baseUrl = `${supabaseUrl}/rest/v1/rpc`;
            
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: 'execute_sql',
                    args: { sql: createFunctionSql }
                })
            });
            
            const result = await response.json();
            console.log('Function creation result:', result);
        } else {
            console.log('✅ Function already exists');
        }
        
        console.log('\nCreating table...');
        
        const createTableSql = `
            DROP TABLE IF EXISTS community_data;
            CREATE TABLE community_data (
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
        `;
        
        const { data: tableData, error: tableError } = await supabase.rpc('execute_sql', { sql: createTableSql });
        
        if (tableError) {
            console.error('Table creation error:', tableError);
            return;
        }
        
        console.log('✅ Table created successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTable();
