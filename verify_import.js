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

async function verify() {
    try {
        console.log('Verifying data import...');
        
        const { data, error } = await supabase.from('community_data').select('*').limit(3);
        
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        console.log('\nSample data (first 3 rows):');
        data.forEach((row, i) => {
            console.log(`\nRow ${i + 1}:`);
            console.log(`  ID: ${row.id}`);
            console.log(`  Title: ${row.post_title}`);
            console.log(`  Author: ${row.author}`);
            console.log(`  Category: ${row.category}`);
            console.log(`  Sentiment: ${row.sentiment}`);
        });
        
        const { data: countData, error: countError } = await supabase.from('community_data').select('id');
        
        if (!countError) {
            console.log(`\nTotal rows: ${countData.length}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verify();
