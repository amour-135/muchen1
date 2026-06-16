const mysql = require('mysql2/promise');
const config = require('../config');

let connection = null;

async function connect() {
    if (connection) return connection;
    
    connection = await mysql.createConnection({
        host: config.mysql.host,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
        charset: 'utf8mb4'
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.mysql.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE ${config.mysql.database}`);
    
    return connection;
}

async function createTable(tableName, headers) {
    const conn = await connect();
    
    const columnDefinitions = headers.map(header => {
        return `${header} TEXT`;
    }).join(', ');
    
    const dropTableSql = `DROP TABLE IF EXISTS ${tableName}`;
    const createTableSql = `CREATE TABLE ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, ${columnDefinitions}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
    
    await conn.query(dropTableSql);
    await conn.query(createTableSql);
    
    console.log(`Table ${tableName} created successfully`);
}

async function insertData(tableName, headers, data) {
    const conn = await connect();
    
    const columns = headers.join(', ');
    const placeholders = headers.map(() => '?').join(', ');
    
    const insertSql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    
    for (const row of data) {
        const values = headers.map(header => row[header] !== undefined ? row[header] : null);
        await conn.query(insertSql, values);
    }
    
    console.log(`Inserted ${data.length} rows into ${tableName}`);
}

async function queryData(tableName, conditions = {}) {
    const conn = await connect();
    
    let sql = `SELECT * FROM ${tableName}`;
    const params = [];
    
    if (Object.keys(conditions).length > 0) {
        const whereClauses = Object.keys(conditions).map(key => `${key} LIKE ?`);
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
        Object.values(conditions).forEach(value => params.push(`%${value}%`));
    }
    
    const [rows] = await conn.query(sql, params);
    return rows;
}

async function queryStats(tableName) {
    const conn = await connect();
    
    const [totalRows] = await conn.query(`SELECT COUNT(*) as total FROM ${tableName}`);
    const [categoryStats] = await conn.query(`SELECT 内容分类, COUNT(*) as count FROM ${tableName} GROUP BY 内容分类`);
    const [sentimentStats] = await conn.query(`SELECT 用户情绪, COUNT(*) as count FROM ${tableName} GROUP BY 用户情绪`);
    const [authorStats] = await conn.query(`SELECT 作者, COUNT(*) as posts FROM ${tableName} GROUP BY 作者 ORDER BY posts DESC LIMIT 10`);
    
    return {
        totalPosts: totalRows[0].total,
        categoryStats: categoryStats,
        sentimentStats: sentimentStats,
        topAuthors: authorStats
    };
}

module.exports = {
    connect,
    createTable,
    insertData,
    queryData,
    queryStats
};