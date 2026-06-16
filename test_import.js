const xlsx = require('xlsx');
const fs = require('fs');

const excelPath = "C:\\Users\\Lenovo\\Desktop\\内训\\影刀社区数据.xlsx";

console.log('Loading Excel file...');

const workbook = xlsx.readFile(excelPath, { cellText: true });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });

const headers = data[0].map(h => {
    if (h === null || h === undefined) return 'unknown';
    return String(h).trim();
});

console.log('Excel headers count:', headers.length);

const jsonData = data.slice(1).map(row => {
    const obj = {};
    row.forEach((cell, index) => {
        obj[headers[index]] = cell;
    });
    return obj;
}).filter(row => Object.keys(row).some(key => row[key] !== undefined && row[key] !== null && row[key] !== ''));

console.log(`Excel loaded: ${jsonData.length} rows`);

const createTableSql = `
DROP TABLE IF EXISTS community_data;

CREATE TABLE community_data (
    id SERIAL PRIMARY KEY,
    "帖子标题" text,
    "帖子链接" text,
    "帖子ID" text,
    "作者" text,
    "作者个人页链接" text,
    "帖子内容(文本)" text,
    "发布时间" text,
    "浏览量" text,
    "用户情绪" text,
    "内容分类" text
);

ALTER TABLE community_data ENABLE ROW LEVEL SECURITY;
`;

console.log('\n===============================================');
console.log('SQL for creating table:');
console.log('===============================================');
console.log(createTableSql);

const jsonFilePath = "C:\\Users\\Lenovo\\Documents\\trae_projects\\muchen\\data_export.json";
fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
console.log(`\nData exported to: ${jsonFilePath}`);

console.log('\nFirst 3 rows sample:');
jsonData.slice(0, 3).forEach((row, i) => {
    console.log(`Row ${i + 1}:`, JSON.stringify(row).substring(0, 300));
});
