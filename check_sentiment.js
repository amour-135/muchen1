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

async function checkData() {
    try {
        console.log('Checking sentiment data...');
        
        const { data, error } = await supabase.from('community_data').select('sentiment').limit(20);
        
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        console.log('\nSample sentiment values:');
        data.forEach((row, i) => {
            console.log(`${i + 1}. sentiment: "${row.sentiment}" (type: ${typeof row.sentiment}, length: ${row.sentiment ? row.sentiment.length : 0})`);
        });
        
        const sentimentMap = {};
        const { data: allData } = await supabase.from('community_data').select('sentiment');
        allData.forEach(row => {
            const val = row.sentiment || '空值';
            sentimentMap[val] = (sentimentMap[val] || 0) + 1;
        });
        
        console.log('\nSentiment distribution:');
        Object.entries(sentimentMap).forEach(([key, value]) => {
            console.log(`  "${key}": ${value}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkData();
