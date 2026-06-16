const { readExcelFile } = require('../utils/excelReader');
const { createTable, insertData } = require('../utils/database');
const config = require('../config');

async function importData() {
    try {
        console.log('Reading Excel file...');
        const { headers, data, originalHeaders } = await readExcelFile(config.excelPath);
        
        console.log('Excel Headers:', originalHeaders);
        console.log('Normalized Headers:', headers);
        console.log('Total rows:', data.length);
        
        if (data.length > 0) {
            console.log('Sample data:', JSON.stringify(data[0], null, 2));
        }
        
        const tableName = 'community_data';
        
        console.log('Creating table...');
        await createTable(tableName, headers);
        
        console.log('Inserting data...');
        await insertData(tableName, headers, data);
        
        console.log('Data import completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
}

importData();