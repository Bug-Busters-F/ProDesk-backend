# Como Contribuir - Seu Passaporte de Entrada

Estamos felizes em receber você aqui e saber que está interessado em contribuir para o nosso projeto. Como um projeto de código aberto, cada contribuição é valorizada e ajuda a impulsionar o crescimento e a qualidade do nosso trabalho. Este guia foi criado para orientá-lo sobre como você pode participar e fazer parte da nossa comunidade de desenvolvimento. Estamos ansiosos para ver suas contribuições e trabalhar juntos para tornar nosso projeto ainda melhor!

## Código de Conduta

Para garantir um ambiente respeitável e inclusivo, leia e siga nosso [Código de Conduta](./CODE_OF_CONDUCT.md).

## Começando a Contribuir

Contribuir para o nosso projeto é fácil e estamos ansiosos para receber suas contribuições! Antes de entrarmos nos passos para instalação da aplicação, você precisará configurar algumas ferramentas e preparar seu ambiente de desenvolvimento.

Aqui está o que você precisa:

-   Uma conta no [GitHub](https://github.com/).
-   O *version control system* [Git](https://git-scm.com/) instalado.
-   Um IDE para o desenvolvimento. Recomendamos o [Visual Studio Code](https://code.visualstudio.com).
-   O [Node.js v22.11.0](https://nodejs.org/en) ou superior.
-   [MongoDB Community Server](https://www.mongodb.com/try/download/community).

## Instalação

### 1. Clonar o Repositório

O primeiro passo é clonar o repositório do projeto para o seu ambiente local.

1.  Abra um terminal.

2.  Execute o seguinte comando para clonar o repositório:
    ```bash
    git clone https://github.com/Bug-Busters-F/ProDesk-backend
    ```

3.  Navegue até o diretório do projeto:
    ```bash
    cd ProDesk-backend\\backend
    ```

### 2. Instalar Dependências e Variáveis de Ambiente

Com o ambiente configurado, basta instalar as dependências do Node.js e iniciar o servidor de desenvolvimento.

1.  Instale as dependências do projeto:
    ```sh
    npm install
    ```

2. Configure as variáveis de ambiente

    ```sh
    cp .env.example .env
    ```

3. Abra o arquivo `.env` e edite a conexão com o banco de dados.

    ```sh
    # DATABASE
    MONGO_URI=mongodb://localhost:27017/prodesk

    # APP
    PORT=3000
    NODE_ENV=development
    ``` 

### 3. Rodar o Projeto

Execute a aplicação em modo de desenvolvimento:

```sh
npm run start:dev
```