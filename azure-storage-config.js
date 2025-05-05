module.exports = {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || "coloque sua string de conexão aqui",
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || "qr-codes", // Nome padrão do container
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || "seuaccountname"
};