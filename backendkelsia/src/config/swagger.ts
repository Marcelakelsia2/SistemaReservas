import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistema de Reservas",
      version: "1.0.0",
      description: `
## Sistema de Reservas — API

Utiliza **Bearer Token (JWT)** para autenticação nas rotas protegidas.
      `,
    },
    servers: [
      {
        url: "http://localhost:8081",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insere o token JWT obtido no login. Exemplo: `eyJhbGci...`",
        },
      },
      schemas: {
        // ─── ERROS ───────────────────────────────────────────────
        Erro: {
          type: "object",
          properties: {
            erro: { type: "boolean", example: true },
            mensagem: { type: "string", example: "Mensagem de erro." },
          },
        },
        ErroValidacao: {
          type: "object",
          properties: {
            erro: { type: "boolean", example: true },
            mensagem: { type: "string", example: "Erro de validação" },
            detalhes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campo: { type: "string", example: "email" },
                  mensagem: { type: "string", example: "Email inválido." },
                },
              },
            },
          },
        },

        // ─── AUTENTICAÇÃO ─────────────────────────────────────────
        RegistarInput: {
          type: "object",
          required: ["nome", "email", "telefone", "senha"],
          properties: {
            nome: { type: "string", example: "João Silva" },
            email: { type: "string", format: "email", example: "joao@email.com" },
            telefone: { type: "string", example: "+244912345678" },
            senha: { type: "string", format: "password", example: "Senha@123" },
          },
        },
        RegistarResponse: {
          type: "object",
          properties: {
            mensagem: { type: "string", example: "Conta criada com sucesso." },
            usuario: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                nome: { type: "string", example: "João Silva" },
                email: { type: "string", example: "joao@email.com" },
                telefone: { type: "string", example: "+244912345678" },
                role: { type: "string", example: "USER" },
                emailVerificado: { type: "boolean", example: false },
              },
            },
          },
        },
        VerificarEmailInput: {
          type: "object",
          required: ["email", "codigo"],
          properties: {
            email: { type: "string", format: "email", example: "joao@email.com" },
            codigo: { type: "string", example: "483921" },
          },
        },
        ReenviarCodigoInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "joao@email.com" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: { type: "string", format: "email", example: "joao@email.com" },
            senha: { type: "string", format: "password", example: "Senha@123" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "Access token JWT (válido 15 minutos)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "Refresh token JWT (válido 7 dias)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            usuario: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                nome: { type: "string", example: "João Silva" },
                email: { type: "string", example: "joao@email.com" },
                role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
              },
            },
          },
        },
        RecuperarSenhaInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "joao@email.com" },
          },
        },
        RedefinirSenhaInput: {
          type: "object",
          required: ["email", "codigo", "novaSenha"],
          properties: {
            email: { type: "string", format: "email", example: "joao@email.com" },
            codigo: { type: "string", example: "839201" },
            novaSenha: { type: "string", format: "password", example: "NovaSenha@456" },
          },
        },
        RefreshTokenInput: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        RefreshTokenResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "Novo access token JWT (válido 15 minutos)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "Novo refresh token JWT (válido 7 dias)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        MensagemResponse: {
          type: "object",
          properties: {
            mensagem: { type: "string", example: "Operação realizada com sucesso." },
          },
        },
      },
    },
    tags: [
      { name: "Autenticação", description: "Registo, login, verificação de email e recuperação de senha" },
      { name: "Utilizadores", description: "Gestão de utilizadores (requer autenticação)" },
      { name: "Tipos de Sala", description: "CRUD de tipos de sala" },
      { name: "Salas", description: "Gestão das salas" },
      { name: "Tipos de Equipamento", description: "CRUD de tipos de equipamento" },
      { name: "Equipamentos", description: "Gestão dos equipamentos" },
      { name: "Reservas", description: "Gestão de reservas" },
      { name: "ReservasEquipamento", description: "Gestão de reservas de equipamentos" },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
});