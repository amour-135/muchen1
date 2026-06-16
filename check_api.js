const supabaseUrl = "https://nufczinldozwykzgfxia.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

async function testAPI() {
    try {
        const urls = [
            `${supabaseUrl}/rest/v1/public/community_data?select=*&limit=1`,
            `${supabaseUrl}/rest/v1/community_data?select=id&limit=1`
        ];
        
        for (const url of urls) {
            console.log('\nTesting:', url);
            
            const response = await fetch(url, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });
            
            const result = await response.json();
            console.log('Status:', response.status);
            console.log('Result:', JSON.stringify(result).substring(0, 500));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();
