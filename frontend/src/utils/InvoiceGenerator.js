import jsPDF from 'jspdf';
import 'jspdf-autotable';

class InvoiceGenerator {
  constructor() {
    this.doc = new jsPDF();
    this.currentY = 20;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 20;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  generateInvoice(saleData, pharmacyData) {
    // Reset document
    this.doc = new jsPDF();
    this.currentY = 20;

    // Add header
    this.addHeader(pharmacyData);
    
    // Add invoice info
    this.addInvoiceInfo(saleData);
    
    // Add customer info if available
    this.addCustomerInfo(saleData.customer);
    
    // Add items table
    this.addItemsTable(saleData.items);
    
    // Add totals
    this.addTotals(saleData);
    
    // Add footer
    this.addFooter(pharmacyData);
    
    return this.doc;
  }

  addHeader(pharmacyData) {
    const centerX = this.pageWidth / 2;
    
    // Pharmacy logo/name (centered)
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(pharmacyData?.name || 'PHARMACIE MODERNE', centerX, this.currentY, { align: 'center' });
    this.currentY += 8;
    
    // Pharmacy subtitle
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Système de Gestion Pharmaceutique', centerX, this.currentY, { align: 'center' });
    this.currentY += 6;
    
    // Pharmacy address and contact
    if (pharmacyData?.address || pharmacyData?.phone) {
      this.doc.setFontSize(10);
      const addressLine = `${pharmacyData?.address || ''} ${pharmacyData?.phone ? '• Tél: ' + pharmacyData.phone : ''}`;
      this.doc.text(addressLine, centerX, this.currentY, { align: 'center' });
      this.currentY += 6;
    }
    
    // Separator line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
    
    // FACTURE title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FACTURE', centerX, this.currentY, { align: 'center' });
    this.currentY += 15;
  }

  addInvoiceInfo(saleData) {
    const leftX = this.margin;
    const rightX = this.pageWidth - this.margin;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Invoice number (left side)
    this.doc.text(`N° Facture: ${saleData.id || 'N/A'}`, leftX, this.currentY);
    
    // Date (right side)
    const saleDate = saleData.created_at ? new Date(saleData.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    this.doc.text(`Date: ${saleDate}`, rightX, this.currentY, { align: 'right' });
    
    this.currentY += 6;
    
    // Time (right side)
    const saleTime = saleData.created_at ? new Date(saleData.created_at).toLocaleTimeString('fr-FR') : new Date().toLocaleTimeString('fr-FR');
    this.doc.text(`Heure: ${saleTime}`, rightX, this.currentY, { align: 'right' });
    
    this.currentY += 10;
  }

  addCustomerInfo(customer) {
    if (!customer || customer === 'passage') {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Client: Client de passage', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INFORMATIONS CLIENT:', this.margin, this.currentY);
    this.currentY += 5;
    
    this.doc.setFont('helvetica', 'normal');
    if (customer.name) {
      this.doc.text(`Nom: ${customer.name}`, this.margin, this.currentY);
      this.currentY += 4;
    }
    if (customer.phone) {
      this.doc.text(`Téléphone: ${customer.phone}`, this.margin, this.currentY);
      this.currentY += 4;
    }
    if (customer.address) {
      this.doc.text(`Adresse: ${customer.address}`, this.margin, this.currentY);
      this.currentY += 4;
    }
    
    this.currentY += 6;
  }

  addItemsTable(items) {
    const tableColumns = [
      { header: 'Désignation', dataKey: 'name' },
      { header: 'Qté', dataKey: 'quantity' },
      { header: 'Prix Unit. (DH)', dataKey: 'unitPrice' },
      { header: 'Total (DH)', dataKey: 'total' }
    ];

    const tableRows = items.map(item => ({
      name: item.medicine?.name || item.name || 'Médicament',
      quantity: item.quantity?.toString() || '1',
      unitPrice: parseFloat(item.unit_price || item.unitPrice || 0).toFixed(2),
      total: parseFloat(item.total || (item.quantity * item.unit_price) || 0).toFixed(2)
    }));

    this.doc.autoTable({
      startY: this.currentY,
      columns: tableColumns,
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 80 }, // Désignation
        1: { cellWidth: 20, halign: 'center' }, // Quantité
        2: { cellWidth: 30, halign: 'right' }, // Prix unitaire
        3: { cellWidth: 30, halign: 'right' } // Total
      },
      margin: { left: this.margin, right: this.margin },
      didDrawPage: (data) => {
        this.currentY = data.cursor.y;
      }
    });
    
    this.currentY += 10;
  }

  addTotals(saleData) {
    const rightX = this.pageWidth - this.margin;
    const totalAmount = saleData.total_amount || 
                       saleData.items?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 0;
    
    // Add separator line for totals
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.pageWidth - 100, this.currentY, rightX, this.currentY);
    this.currentY += 5;
    
    // Subtotal (if needed for future tax calculations)
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Sous-total: ${parseFloat(totalAmount).toFixed(2)} DH`, rightX, this.currentY, { align: 'right' });
    this.currentY += 5;
    
    // TVA (if applicable - Morocco has VAT)
    // For now, assuming no VAT on medicines, but structure is ready
    // this.doc.text(`TVA (20%): ${(totalAmount * 0.2).toFixed(2)} DH`, rightX, this.currentY, { align: 'right' });
    // this.currentY += 5;
    
    // Total
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`TOTAL: ${parseFloat(totalAmount).toFixed(2)} DH`, rightX, this.currentY, { align: 'right' });
    this.currentY += 10;
  }

  addFooter(pharmacyData) {
    const centerX = this.pageWidth / 2;
    const footerY = this.pageHeight - 30;
    
    // Move to footer area
    this.currentY = Math.max(this.currentY, footerY - 20);
    
    // Thank you message
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('Merci pour votre confiance', centerX, this.currentY, { align: 'center' });
    this.currentY += 5;
    
    // Pharmacy info footer
    if (pharmacyData?.license_number) {
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Licence N°: ${pharmacyData.license_number}`, centerX, this.currentY, { align: 'center' });
      this.currentY += 4;
    }
    
    // Footer separator
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
    
    // Footer text
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Système de Gestion Pharmaceutique - Mophar', centerX, footerY + 5, { align: 'center' });
  }

  download(filename = 'facture.pdf') {
    this.doc.save(filename);
  }

  openInNewWindow() {
    const pdfDataUri = this.doc.output('datauristring');
    window.open(pdfDataUri);
  }
}

export default InvoiceGenerator;
