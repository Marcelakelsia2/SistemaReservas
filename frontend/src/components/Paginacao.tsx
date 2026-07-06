// Controlo de paginação reutilizável.
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  pagina: number;
  totalPaginas: number;
  total?: number;
  aoMudar: (p: number) => void;
}

export function Paginacao({ pagina, totalPaginas, total, aoMudar }: Props) {
  if (totalPaginas <= 1) {
    return total !== undefined ? (
      <p className="text-xs text-muted-foreground text-right">{total} resultado(s)</p>
    ) : null;
  }
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        Página {pagina} de {totalPaginas}
        {total !== undefined ? ` · ${total} resultado(s)` : ""}
      </p>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={pagina <= 1}
          onClick={() => aoMudar(pagina - 1)}
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pagina >= totalPaginas}
          onClick={() => aoMudar(pagina + 1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
