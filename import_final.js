const fs = require('fs');
const { Client } = require('pg');

const jsonFilePath = "C:\\Users\\Lenovo\\Documents\\trae_projects\\muchen\\data_export.json";
const supabaseHost = "nufczinldozwykzgfxia.supabase.co";
const supabasePort = 5432;
const supabaseDatabase = "postgres";
const supabaseUser = "postgres";
const supabasePassword = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

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

const englishHeaders = Object.values(chineseToEnglish);

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

console.log('Columns:', englishHeaders);

const client = new Client({
    host: supabaseHost,
    port: supabasePort,
    database: supabaseDatabase,
    user: supabaseUser,
    password: supabasePassword,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 60000
});

async function createTableAndImport() {
    try {
        console.log('\nStep 1: Connecting to Supabase...');
        await client.connect();
        console.log('✅ Connected successfully!');
        
        console.log('\nStep 2: Creating table...');
        
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
            ALTER TABLE community_data ENABLE ROW LEVEL SECURITY;
        `;
        
        await client.query(createTableSql);
        console.log('✅ Table created successfully');
        
        console.log('\nStep 3: Importing data...');
        
        const batchSize = 50;
        let totalInserted = 0;
        
        for (let i = 0; i < mappedData.length; i += batchSize) {
            const batch = mappedData.slice(i, i + batchSize);
            
            for (const row of batch) {
                const keys = englishHeaders.join(', ');
                const placeholders = englishHeaders.map((_, idx) => `$${idx + 1}`).join(', ');
                const values = englishHeaders.map(h => row[h]);
                
                await client.query(`INSERT INTO community_data (${keys}) VALUES (${placeholders})`, values);
            }
            
            totalInserted += batch.length;
            console.log(`Progress: ${totalInserted}/${mappedData.length} rows inserted...`);
        }
        
        const countResult = await client.query('SELECT COUNT(*) FROM community_data');
        console.log(`\n🎉 Data import completed! Total: ${countResult.rows[0].count} rows`);
        
        await client.end();
        console.log('✅ Connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await client.end();
    }
}

createTableAndImport();
