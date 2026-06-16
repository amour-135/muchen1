module.exports = {
    excelPath: process.env.EXCEL_PATH || "C:\\Users\\Lenovo\\Desktop\\测试\\影刀社区数据.xlsx",
    mysql: {
        host: process.env.MYSQL_HOST || "localhost",
        port: parseInt(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "!@#123QWEasd",
        database: process.env.MYSQL_DATABASE || "yingdao_community"
    },
    server: {
        port: parseInt(process.env.PORT) || 3000
    }
};