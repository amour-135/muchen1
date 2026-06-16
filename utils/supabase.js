const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

let supabase = null;

function getClient() {
    if (supabase) return supabase;
    
    supabase = createClient(config.supabase.url, config.supabase.key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        schema: 'public'
    });
    return supabase;
}

async function createTable(tableName, headers) {
    const sb = getClient();
    
    console.log(`Checking if table ${tableName} exists...`);
    
    const { data, error } = await sb.from(tableName).select('id').limit(1);
    
    if (error) {
        throw new Error(`Table ${tableName} does not exist. Please create it manually in Supabase SQL Editor.`);
    }
    
    console.log(`Table ${tableName} already exists`);
}

async function insertData(tableName, headers, data) {
    const sb = getClient();
    
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
    
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const insertRows = batch.map(row => {
            const insertData = {};
            headers.forEach(header => {
                const englishHeader = chineseToEnglish[header] || header;
                insertData[englishHeader] = row[header] !== undefined ? row[header] : null;
            });
            return insertData;
        });
        
        const { error } = await sb.from(tableName).insert(insertRows);
        
        if (error) {
            console.error('Insert error:', error);
            throw error;
        }
        
        insertedCount += batch.length;
        console.log(`Inserted ${insertedCount}/${data.length} rows...`);
    }
    
    console.log(`Successfully inserted ${data.length} rows into ${tableName}`);
}

async function queryData(tableName, conditions = {}) {
    const sb = getClient();
    
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
    
    let query = sb.from(tableName).select('*');
    
    if (Object.keys(conditions).length > 0) {
        Object.keys(conditions).forEach(chineseKey => {
            const englishKey = chineseToEnglish[chineseKey] || chineseKey;
            query = query.ilike(englishKey, `%${conditions[chineseKey]}%`);
        });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const englishToChinese = {
        'post_title': '帖子标题',
        'post_url': '帖子链接',
        'post_id': '帖子ID',
        'author': '作者',
        'author_url': '作者个人页链接',
        'post_content': '帖子内容(文本)',
        'publish_time': '发布时间',
        'view_count': '浏览量',
        'sentiment': '用户情绪',
        'category': '内容分类'
    };
    
    return data.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
            const chineseKey = englishToChinese[key] || key;
            newRow[chineseKey] = row[key];
        });
        return newRow;
    });
}

async function queryStats(tableName) {
    const sb = getClient();
    
    const { data: allData, error: allError } = await sb.from(tableName).select('category, sentiment, author');
    if (allError) throw allError;
    
    const categoryMap = {};
    const sentimentMap = {};
    const authorMap = {};
    
    allData.forEach(row => {
        if (row.category) {
            categoryMap[row.category] = (categoryMap[row.category] || 0) + 1;
        }
        if (row.sentiment) {
            sentimentMap[row.sentiment] = (sentimentMap[row.sentiment] || 0) + 1;
        }
        if (row.author) {
            authorMap[row.author] = (authorMap[row.author] || 0) + 1;
        }
    });
    
    const categoryStats = Object.keys(categoryMap).map(key => ({ 内容分类: key, count: categoryMap[key] }));
    const sentimentStats = Object.keys(sentimentMap).map(key => ({ 用户情绪: key, count: sentimentMap[key] }));
    const topAuthors = Object.keys(authorMap)
        .map(key => ({ 作者: key, posts: authorMap[key] }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 10);
    
    return {
        totalPosts: allData.length,
        categoryStats,
        sentimentStats,
        topAuthors
    };
}

module.exports = {
    getClient,
    createTable,
    insertData,
    queryData,
    queryStats
};
