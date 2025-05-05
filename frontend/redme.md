**Explicação do código frontend:**

* Adicionamos um listener de evento para o botão "Gerar QR Code".
* Quando o botão é clicado:
    * Obtemos o valor do campo de texto.
    * Verificamos se o campo de texto não está vazio.
    * Fazemos uma requisição `POST` para a rota `/generate-qrcode` do nosso backend (rodando em `http://localhost:3000`).
    * Enviamos o texto digitado no corpo da requisição como JSON.
    * Definimos o cabeçalho `Content-Type` como `application/json`.
    * Tratamos a resposta do backend:
        * Se a resposta não for bem-sucedida (`response.ok` é falso), lançamos um erro.
        * Se a resposta for bem-sucedida, convertemos a resposta para JSON.
        * Atualizamos o atributo `src` da tag `<img>` com a URL de dados do QR Code recebida do backend.
    * Tratamos possíveis erros durante a requisição.


    