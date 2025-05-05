const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const sql = require('mssql');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const winston = require('winston');

// Importar configurações
const azureStorageConfig = require('./azure-storage-config');
const azureSqlConfig = require('./azure-sql-config');

// Configure o logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: '/app/error.log', level: 'error' }),
        new winston.transports.File({ filename: '/app/combined.log' }),
    ],
});

const app = express();
const port = 80;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Função para executar a query SQL
async function executeQuery(sqlQuery) {
    try {
        const pool = await sql.connect(azureSqlConfig); // Usar a configuração importada
        const result = await pool.request().query(sqlQuery);
        return result.recordset;
    } catch (err) {
        logger.error('Erro ao executar query com mssql:', err);
        throw err;
    } finally {
        sql.close();
    }
}

// Serve arquivos estáticos da pasta 'frontend'
app.use(express.static(path.join(__dirname, 'frontend')));

// Rota opcional para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.post('/generate-qrcode', async (req, res) => {
    logger.info('Entrou na rota /generate-qrcode');
    logger.info('Corpo da requisição:', req.body);
    const { text } = req.body;

    if (!text) {
        return res.status(400).send('Por favor, forneça um texto para gerar o QR Code.');
    }

    let qrCodeDataURL;
    try {
        logger.info('Texto para gerar QR Code:', text);
        qrCodeDataURL = await QRCode.toDataURL(text, {});
        logger.info(`QR Code gerado com sucesso: ${qrCodeDataURL.substring(0, 50)}...`);
    } catch (qrCodeError) {
        logger.error('Erro ao gerar o QR Code com a biblioteca qrcode:', qrCodeError);
        return res.status(500).send('Erro ao gerar o QR Code.');
    }

    // Resposta simplificada para teste - Comentando a interação com o banco de dados
    res.json({ qrCode: qrCodeDataURL, message: 'QR Code gerado com sucesso (sem salvar no banco).' });
});

// Rota para buscar todos os QR Codes gerados (opcional)
app.get('/qrcodes', async (req, res) => {
    const query = `SELECT id, texto, data_url, data_criacao FROM dbo.QRCodes ORDER BY data_criacao DESC;`;

    try {
        const qrcodes = await executeQuery(query);
        res.status(200).json(qrcodes);
    } catch (error) {
        logger.error('Erro ao buscar QR Codes do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao buscar os QR Codes.' });
    }
});

app.post('/generate-qrcode-blob', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).send('Por favor, forneça um texto para gerar o QR Code.');
    }

    try {
        const qrCodeBuffer = await QRCode.toBuffer(text, { type: 'png' });
        const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConfig.connectionString); // Usar a configuração importada
        const containerClient = blobServiceClient.getContainerClient(azureStorageConfig.containerName); // Usar a configuração importada
        const blobName = `qrcode-${uuidv4()}.png`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.upload(qrCodeBuffer, qrCodeBuffer.length);
        const imageUrl = `https://${azureStorageConfig.accountName}.blob.core.windows.net/${azureStorageConfig.containerName}/${blobName}`; // Usar a configuração importada

        // Salvar informações no banco de dados (incluindo a URL do blob)
        const pool = await sql.connect(azureSqlConfig); // Usar a configuração importada
        const request = pool.request();
        request.input('texto', sql.NVarChar, text);
        request.input('blob_url', sql.NVarChar, imageUrl);

        const insertQuery = `
            INSERT INTO dbo.QRCodesBlob (texto, blob_url, data_criacao)
            VALUES (@texto, @blob_url, GETDATE());
        `;

        await request.query(insertQuery);

        res.json({ imageUrl: imageUrl, message: 'QR Code gerado e salvo no Blob Storage e informações no banco de dados.' });

    } catch (error) {
        logger.error('Erro ao gerar/salvar o QR Code no Blob Storage:', error);
        res.status(500).send('Erro ao gerar e/ou salvar o QR Code no armazenamento.');
    } finally {
        sql.close();
    }
});

app.get('/qrcodes-blob', async (req, res) => {
    const query = `SELECT id, texto, blob_url, data_criacao FROM dbo.QRCodesBlob ORDER BY data_criacao DESC;`;

    try {
        const qrcodes = await executeQuery(query);
        res.status(200).json(qrcodes);
    } catch (error) {
        logger.error('Erro ao buscar QR Codes do banco de dados (Blob):', error);
        res.status(500).json({ error: 'Erro ao buscar os QR Codes.' });
    }
});

app.listen(port, () => {
    logger.info(`Servidor rodando em http://localhost:${port}`);
});