const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://nufczinldozwykzgfxia.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    schema: 'public'
});

async function checkAllFields() {
    try {
        console.log('=== Database Data Check ===\n');
        
        const { data: rows, error } = await supabase.from('community_data').select('*').limit(5);
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        console.log(`Total rows in DB: ${await getTotalCount()}\n`);
        
        console.log('Sample data (first 5 rows):');
        rows.forEach((row, i) => {
            console.log(`\n--- Row ${i + 1} ---`);
            Object.keys(row).forEach(key => {
                const value = row[key];
                const displayValue = typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value;
                console.log(`  ${key}: "${displayValue}" (type: ${typeof value})`);
            });
        });
        
        const fieldStats = await getFieldStats();
        console.log('\n=== Field Statistics ===');
        Object.entries(fieldStats).forEach(([field, stats]) => {
            console.log(`${field}: total=${stats.total}, empty=${stats.empty}, filled=${stats.filled}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getTotalCount() {
    const { count } = await supabase.from('community_data').select('*', { count: 'exact', head: true });
    return count;
}

async function getFieldStats() {
    const { data } = await supabase.from('community_data').select('*');
    const stats = {};
    
    data.forEach(row => {
        Object.keys(row).forEach(key => {
            if (!stats[key]) stats[key] = { total: 0, empty: 0, filled: 0 };
            stats[key].total++;
            if (!row[key] || row[key] === '' || row[key] === null || row[key] === undefined) {
                stats[key].empty++;
            } else {
                stats[key].filled++;
            }
        });
    });
    
    return stats;
}

checkAllFields();
