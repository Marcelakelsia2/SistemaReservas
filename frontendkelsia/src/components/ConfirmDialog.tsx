// Diálogo genérico de confirmação. Substitui window.confirm em toda a aplicação.
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Props {
  aberto: boolean;
  titulo: string;
  descricao?: React.ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: "padrao" | "destrutiva";
  carregando?: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}

export function ConfirmDialog({
  aberto,
  titulo,
  descricao,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  variante = "padrao",
  carregando,
  aoCancelar,
  aoConfirmar,
}: Props) {
  return (
    <AlertDialog open={aberto} onOpenChange={(o) => !o && aoCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          {descricao && <AlertDialogDescription>{descricao}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={carregando}>{textoCancelar}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variante === "destrutiva" ? "destructive" : "default"}
              disabled={carregando}
              onClick={aoConfirmar}
            >
              {carregando ? "A processar..." : textoConfirmar}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
