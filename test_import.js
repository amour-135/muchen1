const { readExcelFile } = require('./utils/excelReader');
const { getClient, insertData } = require('./utils/supabase');

const excelPath = "C:\\Users\\Lenovo\\Desktop\\内训\\影刀社区数据.xlsx";

async function testImport() {
    try {
        console.log('=== Testing Import Logic ===\n');
        
        console.log('Step 1: Reading Excel file...');
        const { headers, data } = readExcelFile(excelPath);
        console.log('Headers:', headers);
        console.log('Total rows:', data.length);
        
        console.log('\nStep 2: Sample row structure:');
        console.log('Row keys:', Object.keys(data[0] || {}));
        console.log('Sample values:', JSON.stringify(data[0] || {}, null, 2));
        
        console.log('\nStep 3: Testing sentiment and category fields...');
        let sentimentCount = 0;
        let categoryCount = 0;
        data.slice(0, 10).forEach((row, i) => {
            Object.keys(row).forEach(key => {
                if (key.includes('情绪') || key.includes('sentiment')) {
                    console.log(`Row ${i+1} sentiment (${key}): "${row[key]}"`);
                    if (row[key]) sentimentCount++;
                }
                if (key.includes('分类') || key.includes('category')) {
                    console.log(`Row ${i+1} category (${key}): "${row[key]}"`);
                    if (row[key]) categoryCount++;
                }
            });
        });
        console.log(`\nSentiment filled in sample: ${sentimentCount}/10`);
        console.log(`Category filled in sample: ${categoryCount}/10`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testImport();
