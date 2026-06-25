import PDFDocument from "pdfkit";
import { Response } from "express";


//SALAS
export function gerarComprovativoPDF(reserva: any, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=comprovativo-reserva-${reserva.id}.pdf`
  );

  doc.pipe(res);

  // Cabeçalho
  doc.fontSize(20).font("Helvetica-Bold").text("Comprovativo de Reserva", { align: "center" });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  // Dados
  const linha = (label: string, valor: string) => {
    doc.fontSize(12).font("Helvetica-Bold").text(`${label}: `, { continued: true });
    doc.font("Helvetica").text(valor);
  };

  linha("Numero de Reserva", `#${reserva.id}`);
  linha("Estado", reserva.status);
  linha("Sala", reserva.sala?.nome ?? "-");
  linha("Localizacao", reserva.sala?.localizacao ?? "-");
  linha("Data", new Date(reserva.data).toLocaleDateString("pt-AO"));
  linha("Hora de Inicio", new Date(reserva.horaInicio).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" }));
  linha("Hora de Fim", new Date(reserva.horaFim).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" }));

  if (reserva.observacao) {
    linha("Observacao", reserva.observacao);
  }

  linha("Reservado por", reserva.usuario?.nome ?? "-");
  linha("Email", reserva.usuario?.email ?? "-");
  linha("Data de Criacao", new Date(reserva.dataCriacao).toLocaleString("pt-AO"));

  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
  doc.fontSize(10).font("Helvetica").fillColor("gray")
    .text("Documento gerado automaticamente pelo Sistema de Reservas.", { align: "center" });

  doc.end();
}

//EQUIPAMNTOS
export function gerarComprovatiyoEquipamentoPDF(reserva: any, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=comprovativo-equipamento-${reserva.id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).font("Helvetica-Bold").text("Comprovativo de Reserva de Equipamento", { align: "center" });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  const linha = (label: string, valor: string) => {
    doc.fontSize(12).font("Helvetica-Bold").text(`${label}: `, { continued: true });
    doc.font("Helvetica").text(valor);
  };

  linha("Numero de Reserva", `#${reserva.id}`);
  linha("Estado", reserva.status);
  linha("Equipamento", reserva.equipamento?.nome ?? "-");
  linha("Tipo", reserva.equipamento?.tipoEquipamento?.nome ?? "-");
  linha("Quantidade", String(reserva.quantidade));
  linha("Data", new Date(reserva.data).toLocaleDateString("pt-AO"));
  linha("Hora de Inicio", new Date(reserva.horaInicio).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" }));
  linha("Hora de Fim", new Date(reserva.horaFim).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" }));

  if (reserva.observacao) {
    linha("Observacao", reserva.observacao);
  }

  linha("Reservado por", reserva.usuario?.nome ?? "-");
  linha("Email", reserva.usuario?.email ?? "-");
  linha("Data de Criacao", new Date(reserva.dataCriacao).toLocaleString("pt-AO"));

  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
  doc.fontSize(10).font("Helvetica").fillColor("gray")
    .text("Documento gerado automaticamente pelo Sistema de Reservas.", { align: "center" });

  doc.end();
}