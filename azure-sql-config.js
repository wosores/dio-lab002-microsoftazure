module.exports = {
    server: process.env.AZURE_SQL_SERVER || "seu_servidor.database.windows.net",
    database: process.env.AZURE_SQL_DATABASE || "seu_banco_de_dados",
    user: process.env.AZURE_SQL_USER || "seu_usuario",
    password: process.env.AZURE_SQL_PASSWORD || "sua_senha",
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};