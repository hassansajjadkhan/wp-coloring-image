import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateColoringPagePdf(
  imageUrl: string,
  title: string
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Download image from URL
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add title
      doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown();

      // Add image (A4 is 210x297mm, with margins)
      const maxWidth = 550;
      const maxHeight = 700;

      doc.image(imageResponse.data as any, {
        fit: [maxWidth, maxHeight],
        align: 'center',
        valign: 'top',
      } as any);

      doc.moveDown();

      // Add footer
      doc.fontSize(10).fillColor('gray').text('© Kleurplaten Paradijs', {
        align: 'center',
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateBatchPdf(
  pages: Array<{ title: string; imageUrl: string }>
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        if (i > 0) doc.addPage();

        doc.fontSize(18).font('Helvetica-Bold').text(page.title, {
          align: 'center',
        });
        doc.moveDown();

        try {
          const imageResponse = await axios.get(page.imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
          });

          doc.image(imageResponse.data as any, {
            fit: [550, 600],
            align: 'center',
            valign: 'top',
          } as any);
        } catch (error) {
          doc.text('Image loading failed', { align: 'center' });
        }

        doc.moveDown();
        doc.fontSize(9).fillColor('gray').text('© Kleurplaten Paradijs', {
          align: 'center',
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
