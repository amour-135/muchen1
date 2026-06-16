const fs = require('fs');
const iconv = require('iconv-lite');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const excelPath = "C:\\Users\\Lenovo\\Desktop\\内训\\影刀社区数据.xlsx";
const supabaseUrl = "https://nufczinldozwykzgfxia.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo";

console.log('Reading Excel with encoding detection...');

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    schema: 'public'
});

async function importData() {
    try {
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawData = xlsx.utils.sheet_to_json(worksheet);
        console.log(`Total rows: ${rawData.length}`);
        
        const sampleRow = rawData[0];
        const rawKeys = Object.keys(sampleRow);
        console.log('\nRaw keys (may be garbled):', rawKeys);
        
        const keyMapping = {
            '鐢ㄦ埛鎯呮劅': 'sentiment',
            '鍐呭鍒嗙被': 'category',
            '浣滆€?': 'author',
            '甯栧瓙鏍囬': 'post_title',
            '甯栧瓙閾炬帴': 'post_url',
            '甯栧瓙ID': 'post_id',
            '浣滆€呬釜浜洪〉閾炬帴': 'author_url',
            '甯栧瓙鍐呭(鏂囨湰)': 'post_content',
            '鍙戝竷鏃堕棿': 'publish_time',
            '娴忚閲?': 'view_count'
        };
        
        const sentimentMapping = {
            '涓€?': '中性',
            '鍏堢粨': '积极',
            '鐚?': '消极',
            '绌哄€?': '空值'
        };
        
        const categoryMapping = {
            '杞欢/娴忚鍣ㄥ吋瀹规€?': '软件/浏览器兼容性',
            '缃戦〉鏁版嵁鎶撳彇': '网页数据抓取',
            '鍏冪礌鎹曡幏涓庡畾浣?': '元素捕获与定位',
            'AI涓庨瓟娉曟寚浠?': 'AI与魔法指令',
            'Excel/琛ㄦ牸鎿嶄綔': 'Excel/表格操作',
            '鍏朵粬': '其他'
        };
        
        console.log('\nConverting data...');
        
        const mappedData = rawData.map(row => {
