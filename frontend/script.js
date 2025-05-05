document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text');
    const generateBtn = document.getElementById('generateBtn');
    const qrcodeImage = document.getElementById('qrcodeImage');

    generateBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();

        if (!text) {
            alert('Por favor, digite algum texto ou URL.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/generate-qrcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Erro na requisição: ${response.status} - ${error}`);
            }

            const data = await response.json();
            qrcodeImage.src = data.qrCode;
        } catch (error) {
            console.error('Erro ao gerar o QR Code:', error);
            alert('Ocorreu um erro ao gerar o QR Code.');
        }
    });
});

