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

async function checkColumns() {
    try {
        console.log('Querying community_data table...');
        
        const { data, error } = await supabase.from('community_data').select('*').limit(1);
        
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
            console.log('Sample data:', JSON.stringify(data[0]).substring(0, 500));
        } else {
            console.log('Table is empty');
            console.log('Trying to select id only...');
            
            const { data: idData, error: idError } = await supabase.from('community_data').select('id').limit(1);
            
            if (idError) {
                console.error('ID error:', idError);
            } else {
                console.log('Can select id, table exists');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkColumns();
