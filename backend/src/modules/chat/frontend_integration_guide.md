# Módulo de Chat — Guia de Integração Frontend / Mobile

O módulo de Chat opera em **tempo real** utilizando a biblioteca **Socket.IO** através de WebSockets. Não há rotas REST (GET/POST) para tráfego local das mensagens, toda a comunicação é baseada em eventos via Socket.

## 1. Conexão e Autenticação

Para se conectar, o cliente deve inicializar uma instância do Socket.IO.
O backend **exige** que um token JWT válido seja enviado no momento do "handshake" da conexão. Se o token for inválido, expirado ou não for enviado, o servidor derrubará a conexão (`disconnect`) instantaneamente.

**Exemplo de conexão no Frontend:**
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "SEU_TOKEN_JWT_AQUI" // Obrigatório!
  }
});

socket.on("connect", () => {
    console.log("Conectado ao Chat!");
});

socket.on("disconnect", () => {
    console.log("Desconectado.");
});
```

*(Nota: O backend descobre automaticamente quem é o usuário e qual é o cargo (Client, Support, Admin) lendo o JWT de forma segura. Nenhuma falsificação de ID pelo frontend funcionará).*

---

## 2. Eventos Emitidos pelo Frontend (O que o Front envia)

O Frontend deve usar `socket.emit('nomeDoEvento', dados)` para interagir com o chat.

### `entrarChat`
Deve ser emitido assim que o usuário abrir a tela do chamado para se juntar à "sala" daquele chat.
- **Payload:** `{ chatId: string }`
- **Validação:** O servidor verificará no banco se o usuário do JWT logado é um participante nativo daquele `chatId`. Se não for (e não for ADMIN), o acesso será negado.

### `enviarMensagem`
Envia uma nova mensagem para o participante do outro lado.
- **Payload:** `{ chatId: string, content: string }`
- **Nota:** Não é necessário enviar `senderId` ou identificar quem está mandando a mensagem, o servidor já extrai isso do JWT por segurança.

### `buscarHistorico`
Solicita as mensagens antigas daquele chamado para popular a tela no primeiro load.
- **Payload:** `{ chatId: string }`

### `sairChat`
Emitido idealmente quando a tela do chat é desmontada (fechada/destruída).
- **Payload:** `{ chatId: string }`

---

## 3. Eventos Ouvidos pelo Frontend (O que o Front recebe)

O Frontend deve usar `socket.on('nomeDoEvento', callback)` para reagir ao que o servidor manda de volta.

### `novaMensagem`
Recebido sempre que o usuário atual (ou o outro participante da mesma sala) envia uma mensagem. Usa-se para renderizar a bolha de mensagem na tela.
- **Retorno:** Objeto da mensagem formatado (contendo `id`, `chatId`, `senderId`, `content`, `createdAt`, etc).

### `historicoChat`
Recebido como resposta direta logo após o Frontend emitir um `buscarHistorico`.
- **Retorno:** `{ chatId: string, mensagens: Array<Mensagem> }`

### `entrou`
Confirmação de que o usuário ingressou com sucesso na "sala" daquele chat para começar a ouvir novas conversas.
- **Retorno:** `{ chatId: string }`

### `erro` / `erroMensagem`
Recebidos se alguma validação falhar no backend (Ex: usuário tentou entrar num chat em que não é participante).
- **Retorno:** `{ mensagem: string }` ou `{ erro: string }`
