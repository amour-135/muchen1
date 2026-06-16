const xlsx = require('xlsx');

function readExcelFile(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    const expectedHeaders = ['帖子标题', '帖子链接', '帖子id', '作者', '作者个人页链接', '帖子内容', '发布时间', '浏览量', '用户情绪', '内容分类'];
    
    const jsonData = data.slice(1).map(row => {
        const obj = {};
        row.forEach((cell, index) => {
            obj[expectedHeaders[index]] = cell;
        });
        return obj;
    }).filter(row => Object.keys(row).some(key => row[key] !== undefined && row[key] !== null && row[key] !== ''));
    
    return { headers: expectedHeaders, data: jsonData, originalHeaders: data[0] };
}

module.exports = { readExcelFile };