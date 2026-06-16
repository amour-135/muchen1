const XLSX = require('xlsx');

const excelPath = "C:\\Users\\Lenovo\\Desktop\\内训\\影刀社区数据.xlsx";

console.log('Reading Excel file...');

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\nTotal rows: ${data.length}`);

const headers = Object.keys(data[0] || {});
console.log('\nHeaders:', headers);

console.log('\nSample data (first 5 rows):');
data.slice(0, 5).forEach((row, i) => {
    console.log(`\nRow ${i + 1}:`);
    Object.keys(row).forEach(key => {
        const value = row[key];
        console.log(`  ${key}: "${value}" (type: ${typeof value})`);
    });
});

const sentimentCounts = {};
data.forEach(row => {
    const sentiment = row['用户情绪'] || row['sentiment'] || row['Sentiment'] || '空值';
    sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
});

console.log('\nSentiment distribution in Excel:');
Object.entries(sentimentCounts).forEach(([key, value]) => {
    console.log(`  "${key}": ${value}`);
});
