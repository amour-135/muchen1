const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://nufczinldozwykzgfxia.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkTable() {
    try {
        console.log('Querying community_data with id only...');
        
        const { data: idData, error: idError } = await supabase.from('community_data').select('id').limit(1);
        
        if (idError) {
            console.error('Error:', idError.code, '-', idError.message);
            return;
        }
        
        if (idData.length > 0) {
            console.log('Can query id column, table exists');
        } else {
            console.log('Table exists but empty');
        }
        
        console.log('\nTrying to list all tables...');
        
        const { data: tables, error: tablesError } = await supabase.from('pg_catalog.pg_tables').select('tablename');
        
        if (tablesError) {
            console.error('Tables error:', tablesError.message);
        } else {
            console.log('Tables:', tables.map(t => t.tablename).slice(0, 10));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkTable();
