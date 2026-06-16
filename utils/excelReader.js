const xlsx = require('xlsx');

function readExcelFile(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length === 0) {
        throw new Error('Excel 文件为空');
    }
    
    const originalHeaders = data[0].map(header => {
        if (header === null || header === undefined) {
            return 'unknown';
        }
        return String(header).trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_]/g, '_');
    });
    
    const jsonData = data.slice(1).map(row => {
        const obj = {};
        row.forEach((cell, index) => {
            const header = originalHeaders[index];
            obj[header] = cell;
        });
        return obj;
    }).filter(row => Object.keys(row).some(key => row[key] !== undefined && row[key] !== null && row[key] !== ''));
    
    return { headers: originalHeaders, data: jsonData, originalHeaders: data[0] };
}

module.exports = { readExcelFile };