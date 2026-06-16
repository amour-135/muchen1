const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://nufczinldozwykzgfxia.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

async function testWithSchema() {
    try {
        console.log('Testing with public schema...');
        
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            schema: 'public'
        });
        
        const { data, error } = await supabase.from('community_data').select('*').limit(1);
        
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Success!');
            console.log('Columns:', data.length > 0 ? Object.keys(data[0]) : 'Empty');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testWithSchema();
