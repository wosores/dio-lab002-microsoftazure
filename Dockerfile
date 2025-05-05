# Use uma imagem base Node.js LTS (Long Term Support)
FROM node:18-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos package.json e package-lock.json (ou yarn.lock) para o diretório de trabalho
COPY package*.json ./

# Instale as dependências da aplicação
RUN npm install express dotenv multer @azure/storage-blob tedious cors mssql qrcode winston

# Copie a pasta frontend para dentro do container
COPY frontend ./frontend

# Copie o restante dos arquivos da sua aplicação para o diretório de trabalho (incluindo server.js)
COPY . .

# Exponha a porta em que sua aplicação Node.js escuta (padrão: 3000)
EXPOSE 80

# Comando para iniciar sua aplicação Node.js
CMD [ "node", "server.js" ]
