const { readExcelFile } = require('./utils/excelReader');
const { getClient, insertData } = require('./utils/supabase');

const excelPath = "C:\\Users\\Lenovo\\Desktop\\内训\\影刀社区数据.xlsx";

async function reimport() {
    try {
        const sb = getClient();
        
        console.log('=== Step 1: Clear existing data ===');
        const { error: deleteError } = await sb.from('community_data').delete().neq('id', 0);
        if (deleteError) {
            console.error('Delete error:', deleteError);
            return;
        }
        console.log('✓ Data cleared');
        
        console.log('\n=== Step 2: Read Excel file ===');
        const { headers, data } = readExcelFile(excelPath);
        console.log(`✓ Read ${data.length} rows`);
        console.log('Headers:', headers);
        
        console.log('\n=== Step 3: Insert data to Supabase ===');
        await insertData('community_data', headers, data);
        console.log('✓ Data imported successfully');
        
        console.log('\n=== Step 4: Verify data ===');
        const { data: verifyData, error: verifyError } = await sb.from('community_data').select('category, sentiment, author').limit(5);
        if (verifyError) {
            console.error('Verify error:', verifyError);
            return;
        }
        
        console.log('Sample data after import:');
        verifyData.forEach((row, i) => {
            console.log(`Row ${i+1}: category="${row.category}", sentiment="${row.sentiment}", author="${row.author}"`);
        });
        
        const { count } = await sb.from('community_data').select('*', { count: 'exact', head: true });
        console.log(`\nTotal rows in DB: ${count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

reimport();
