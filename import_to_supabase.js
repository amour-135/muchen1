const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const jsonFilePath = "C:\\Users\\Lenovo\\Documents\\trae_projects\\muchen\\data_export.json";
const supabaseUrl = "https://nufczinldozwykzgfxia.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

console.log('Loading data from JSON file...');

const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
console.log(`Data loaded: ${jsonData.length} rows`);

const chineseToEnglish = {
    '帖子标题': 'post_title',
    '帖子链接': 'post_url',
    '帖子ID': 'post_id',
    '作者': 'author',
    '作者个人页链接': 'author_url',
    '帖子内容(文本)': 'post_content',
    '发布时间': 'publish_time',
    '浏览量': 'view_count',
    '用户情绪': 'sentiment',
    '内容分类': 'category'
};

const mappedData = jsonData.map(row => {
    const newRow = {};
    Object.keys(row).forEach(chineseKey => {
        const englishKey = chineseToEnglish[chineseKey];
        if (englishKey) {
            newRow[englishKey] = row[chineseKey];
        }
    });
    return newRow;
});

console.log('First mapped row keys:', Object.keys(mappedData[0]));

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    schema: 'public'
});

async function importData() {
    try {
        console.log('\nStep 1: Clear old data...');
        
        const { error: deleteError } = await supabase.from('community_data').delete().neq('id', 0);
        if (deleteError) {
            console.log('Delete result:', deleteError.message);
        } else {
            console.log('✅ Old data cleared');
        }
        
        console.log('\nStep 2: Importing data...');
        
        const batchSize = 50;
        let totalInserted = 0;
        
        for (let i = 0; i < mappedData.length; i += batchSize) {
            const batch = mappedData.slice(i, i + batchSize);
            
            const { error } = await supabase.from('community_data').insert(batch);
            
            if (error) {
                console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
                return;
            }
            
            totalInserted += batch.length;
            console.log(`Progress: ${totalInserted}/${mappedData.length} rows inserted...`);
        }
        
        const { data: countData, error: countError } = await supabase.from('community_data').select('id', { count: 'exact', head: true });
        
        if (!countError) {
            console.log(`\n🎉 Data import completed! Total: ${countData} rows`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

importData();
