# Como Contribuir - Seu Passaporte de Entrada

Estamos felizes em receber você aqui e saber que está interessado em contribuir para o nosso projeto. Como um projeto de código aberto, cada contribuição é valorizada e ajuda a impulsionar o crescimento e a qualidade do nosso trabalho. Este guia foi criado para orientá-lo sobre como você pode participar e fazer parte da nossa comunidade de desenvolvimento.

---

## Código de Conduta

Para garantir um ambiente respeitável e inclusivo, leia e siga nosso [Código de Conduta](./CODE_OF_CONDUCT.md).

---

## Começando a Contribuir

Antes de iniciar, você precisará configurar seu ambiente de desenvolvimento.

### Requisitos

- Uma conta no GitHub
- Git instalado
- IDE (recomendado: VS Code)
- Node.js v22.11.0 ou superior
- MongoDB Community Server

---

## Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/Bug-Busters-F/ProDesk-backend
cd ProDesk-backend/backend
```

---

### 2. Instalar Dependências e Variáveis de Ambiente

```bash
npm install
```

Copie o arquivo de variáveis:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
# DATABASE
MONGO_URI=mongodb://localhost:27017/prodesk

# APP
PORT=3000
NODE_ENV=development

# EMAIL (Gmail)
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=sua_senha_de_app
```

---

## Como configurar EMAIL_USER e EMAIL_PASS

Para que o envio de emails funcione (ex: recuperação de senha), é necessário configurar uma conta do Gmail com senha de aplicativo.

### Importante

- Não utilize sua senha normal do Gmail  
- É obrigatório ter a verificação em duas etapas ativada  

---

### Passo a passo

1. Acesse:  
https://myaccount.google.com/apppasswords  

2. Faça login na sua conta Google  

3. Ative a verificação em duas etapas  

4. Em Selecionar app, escolha: Mail  

5. Em Selecionar dispositivo, escolha: Outro (Personalizado)  

6. Informe um nome, por exemplo: NestJS  

7. Clique em Gerar  

---

### Resultado

O Google irá gerar um código semelhante a:

```
abcd efgh ijkl mnop
```

Copie esse código e utilize no `.env` sem espaços:

```env
EMAIL_PASS=abcdefghijklmnop
```

---

## 3. Rodar o Projeto

```bash
npm run start:dev
```

---

## Resultado esperado

- Aplicação rodando em http://localhost:3000  
- Swagger disponível em http://localhost:3000/api  
- Envio de email funcionando corretamente

## Primeiro acesso (usuário admin padrão)

Ao iniciar a aplicação pela primeira vez, um usuário administrador é criado automaticamente com as seguintes credenciais:

```json
{
  "email": "admin@pro4tech.com",
  "password": "Pro4Tech"
}