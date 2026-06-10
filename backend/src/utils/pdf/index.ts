import type PDFKit from 'pdfkit'

export function drawHr(doc: PDFKit.PDFDocument, margins: { left: number, right: number, top: number, bottom: number }, size: [number, number]) {
  const y = doc.y + margins.top
  doc
    .strokeColor('#D9D9D9')
    .lineWidth(1)
    .moveTo(margins.left, y)
    .lineTo(size[0] - margins.right, y)
    .stroke()
  doc.y = y + margins.bottom
}
