// Cliente HTTP central. Toda a comunicação com o backend passa por aqui.
import type { Utilizador } from "@/lib/tipos";

export const URL_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:13000/api";

const CHAVE_TOKEN = "rs_token";
const CHAVE_REFRESH = "rs_refresh";
const CHAVE_USER = "rs_user";

export const armazenamento = {
  obterToken: () => (typeof window !== "undefined" ? localStorage.getItem(CHAVE_TOKEN) : null),
  obterRefresh: () =>
    typeof window !== "undefined" ? localStorage.getItem(CHAVE_REFRESH) : null,
  obterUtilizador: (): Utilizador | null => {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem(CHAVE_USER);
    return u ? (JSON.parse(u) as Utilizador) : null;
  },
  guardarSessao: (token: string, refresh: string, utilizador: Utilizador) => {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_REFRESH, refresh);
    localStorage.setItem(CHAVE_USER, JSON.stringify(utilizador));
  },
  guardarTokens: (token: string, refresh: string) => {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_REFRESH, refresh);
  },
  guardarUtilizador: (utilizador: Utilizador) => {
    localStorage.setItem(CHAVE_USER, JSON.stringify(utilizador));
  },
  atualizarToken: (token: string) => localStorage.setItem(CHAVE_TOKEN, token),
  limpar: () => {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_REFRESH);
    localStorage.removeItem(CHAVE_USER);
  },
};

export class ErroApi extends Error {
  constructor(public status: number, mensagem: string, public detalhes?: unknown) {
    super(mensagem);
  }
}

/** Mensagem amigável a mostrar ao utilizador, juntando detalhes de validação se existirem. */
export function mensagemErro(erro: unknown): string {
  if (erro instanceof ErroApi) {
    if (Array.isArray(erro.detalhes) && erro.detalhes.length) {
      const det = erro.detalhes
        .map((d: any) => d?.mensagem ?? d?.message ?? String(d))
        .filter(Boolean)
        .join("\n");
      return det ? `${erro.message}: ${det}` : erro.message;
    }
    if (erro.detalhes && typeof erro.detalhes === "object") {
      const valores = Object.values(erro.detalhes as Record<string, unknown>)
        .map((v) => (typeof v === "string" ? v : (v as any)?.mensagem))
        .filter(Boolean) as string[];
      if (valores.length) return `${erro.message}: ${valores.join("\n")}`;
    }
    return erro.message;
  }
  if (erro instanceof Error) return erro.message;
  return "Ocorreu um erro inesperado.";
}

async function tentarRefresh(): Promise<string | null> {
  const refreshToken = armazenamento.obterRefresh();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${URL_BASE}/autenticacao/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const dados = await res.json();
    if (dados?.token) {
      armazenamento.atualizarToken(dados.token);
      return dados.token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function pedido<T>(
  caminho: string,
  opcoes: RequestInit & { autenticado?: boolean } = {},
  jaTentouRefresh = false
): Promise<T> {
  const { autenticado = true, headers, ...resto } = opcoes;
  const cabecalhos: Record<string, string> = {
    "Content-Type": "application/json",
    ...((headers as Record<string, string>) ?? {}),
  };
  if (autenticado) {
    const token = armazenamento.obterToken();
    if (token) cabecalhos.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${URL_BASE}${caminho}`, { ...resto, headers: cabecalhos });

  if (res.status === 401 && autenticado && !jaTentouRefresh) {
    const novoToken = await tentarRefresh();
    if (novoToken) return pedido<T>(caminho, opcoes, true);
    armazenamento.limpar();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  const texto = await res.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!res.ok) {
    const msg =
      dados?.mensagem ||
      dados?.message ||
      dados?.erro ||
      `Erro ${res.status}`;
    throw new ErroApi(res.status, String(msg), dados?.detalhes);
  }
  return dados as T;
}

export const http = {
  get: <T>(p: string, autenticado = true) =>
    pedido<T>(p, { method: "GET", autenticado }),
  post: <T>(p: string, body?: unknown, autenticado = true) =>
    pedido<T>(p, { method: "POST", body: JSON.stringify(body ?? {}), autenticado }),
  patch: <T>(p: string, body?: unknown) =>
    pedido<T>(p, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: <T>(p: string, body?: unknown) =>
    pedido<T>(p, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  delete: <T>(p: string) => pedido<T>(p, { method: "DELETE" }),
  /** Faz GET autenticado e devolve a resposta como Blob (ex.: PDF). */
  getBlob: async (p: string, accept = "application/pdf"): Promise<Blob> => {
    const fazer = async (): Promise<Response> => {
      const token = armazenamento.obterToken();
      return fetch(`${URL_BASE}${p}`, {
        method: "GET",
        headers: {
          Accept: accept,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    };
    let res = await fazer();
    if (res.status === 401) {
      const novo = await tentarRefresh();
      if (novo) res = await fazer();
    }
    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const txt = await res.text();
        if (txt) {
          try {
            const j = JSON.parse(txt);
            msg = j?.mensagem || j?.message || j?.erro || msg;
          } catch {
            msg = txt;
          }
        }
      } catch {
        /* noop */
      }
      throw new ErroApi(res.status, String(msg));
    }
    return res.blob();
  },
};

/** Faz download de um Blob no browser. */
export function baixarBlob(blob: Blob, nomeFicheiro: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeFicheiro;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Desempacota respostas que vêm no formato `{ erro, dados }` ou `{ dados, meta }`. */
export const desempacotar = <T>(r: any): T =>
  (r?.dados !== undefined ? r.dados : r) as T;

/** Constrói uma querystring ignorando valores vazios/undefined. */
export function queryString(obj: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
