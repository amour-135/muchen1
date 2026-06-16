const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const jsonFilePath = "C:\\Users\\Lenovo\\Documents\\trae_projects\\muchen\\data_export.json";
const supabaseUrl = "https://nufczinldozwykzgfxia.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

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

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkAndImport() {
    try {
        console.log('Checking table structure...');
        
        const { data: testData, error: testError } = await supabase.from('community_data').select('id').limit(1);
        
        if (testError