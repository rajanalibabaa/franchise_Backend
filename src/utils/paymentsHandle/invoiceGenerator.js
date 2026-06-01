// utils/invoiceGenerator.js
import PDFDocument from 'pdfkit';
import { uploadToS3 } from './s3Upload.js'; // Your S3 uploader

export async function generateInvoice(payment) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);
        
        // Upload to S3 or save locally
        const invoiceUrl = await uploadToS3(
          pdfBuffer,
          `invoices/${payment.invoice.invoiceNumber}.pdf`
        );

        resolve(invoiceUrl);
      });

      // Header
      doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
      doc.moveDown();

      // Company Details
      doc.fontSize(10).text('Your Company Name');
      doc.text('Address Line 1, City, State - PIN');
      doc.text('GSTIN: 27XXXXX1234X1Z5');
      doc.moveDown();

      // Invoice Details
      doc.text(`Invoice No: ${payment.invoice.invoiceNumber}`);
      doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString('en-IN')}`);
      doc.text(`Order ID: ${payment.orderId}`);
      doc.moveDown();

      // Customer Details
      doc.text('Bill To:');
      doc.text(payment.customer.name);
      doc.text(payment.customer.email);
      if (payment.compliance.gstNumber) {
        doc.text(`GSTIN: ${payment.compliance.gstNumber}`);
      }
      doc.moveDown();

      // Table Header
      const tableTop = doc.y;
      doc.text('Description', 50, tableTop);
      doc.text('Amount', 400, tableTop, { align: 'right' });
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Items
      doc.text(payment.packageName, 50);
      doc.text(`₹${payment.breakdown.baseAmount}`, 400, doc.y - 12, { align: 'right' });
      doc.moveDown();

      // GST Breakdown
      if (payment.breakdown.cgst > 0) {
        doc.text('CGST (9%)', 50);
        doc.text(`₹${payment.breakdown.cgst}`, 400, doc.y - 12, { align: 'right' });
        doc.moveDown();

        doc.text('SGST (9%)', 50);
        doc.text(`₹${payment.breakdown.sgst}`, 400, doc.y - 12, { align: 'right' });
        doc.moveDown();
      }

      if (payment.breakdown.igst > 0) {
        doc.text('IGST (18%)', 50);
        doc.text(`₹${payment.breakdown.igst}`, 400, doc.y - 12, { align: 'right' });
        doc.moveDown();
      }

      if (payment.breakdown.processingFee > 0) {
        doc.text('Processing Fee', 50);
        doc.text(`₹${payment.breakdown.processingFee}`, 400, doc.y - 12, { align: 'right' });
        doc.moveDown();
      }

      // Total
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.fontSize(12).text('Total Amount:', 50);
      doc.text(`₹${payment.amount}`, 400, doc.y - 15, { align: 'right' });

      // Footer
      doc.fontSize(8).text(
        'This is a computer-generated invoice and does not require a signature.',
        50,
        700,
        { align: 'center' }
      );

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}