import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error("Conta Google sem email associado."),
            undefined
          );
        }

        let usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if (usuario) {
          // Utilizador já existe — verificar se está activo
          if (!usuario.ativo) {
            return done(new Error("Conta desativada."), undefined);
          }

          // Garante que o email fica marcado como verificado
          // (pode ter sido criado por registo normal sem verificar)
          if (!usuario.emailVerificado) {
            usuario = await prisma.usuario.update({
              where: { id: usuario.id },
              data: { emailVerificado: true },
            });
          }

          return done(null, usuario);
        }

        // Utilizador novo — criar conta automaticamente
        const nomeCompleto =
          profile.displayName ||
          `${profile.name?.givenName ?? ""} ${profile.name?.familyName ?? ""}`.trim() ||
          email.split("@")[0];

        // Nome precisa de pelo menos 2 palavras — completar se necessário
        const nomeFinal = nomeCompleto.includes(" ")
          ? nomeCompleto
          : `${nomeCompleto} OAuth`;

        // Telefone obrigatório no schema mas o Google não fornece —
        // gera um placeholder único para não violar o @unique
        const telefonePlaceholder = `oauth_${profile.id}`;

        const novoUsuario = await prisma.usuario.create({
          data: {
            nome: nomeFinal,
            email,
            telefone: telefonePlaceholder,
            senha: "", // sem senha — login só via OAuth
            emailVerificado: true,
            ativo: true,
          },
        });

        return done(null, novoUsuario);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

export default passport;