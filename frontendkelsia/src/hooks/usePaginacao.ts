// Paginação puramente do lado do cliente para listas em memória.
import { useEffect, useMemo, useState } from "react";

export function usePaginacao<T>(itens: T[], porPagina = 10) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(itens.length / porPagina));

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(1);
  }, [itens, totalPaginas, pagina]);

  const visiveis = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return itens.slice(inicio, inicio + porPagina);
  }, [itens, pagina, porPagina]);

  return { pagina, setPagina, totalPaginas, total: itens.length, visiveis };
}
