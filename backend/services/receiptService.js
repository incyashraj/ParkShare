const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

class ReceiptService {
  constructor() {
    // Email configuration (for production, use environment variables)
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Replace with actual email
        pass: 'your-app-password' // Replace with actual app password
      }
    });
  }

  generateReceiptPDF(booking, spot, user) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 25,
          info: {
            Title: `ParkShare Receipt - ${booking.id}`,
            Author: 'ParkShare',
            Subject: 'Parking Booking Receipt',
            Keywords: 'parking, receipt, booking',
            Creator: 'ParkShare App'
          }
        });

        const fileName = `receipt_${booking.id}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../receipts', fileName);
        
        // Ensure receipts directory exists
        const receiptsDir = path.dirname(filePath);
        if (!fs.existsSync(receiptsDir)) {
          fs.mkdirSync(receiptsDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Helper function to draw a subtle line
        const drawLine = (y) => {
          doc.moveTo(25, y).lineTo(570, y).stroke('#E5E7EB');
        };

        // Helper function to add compact section
        const addCompactSection = (title, y) => {
          doc.fontSize(10)
           .font('Helvetica-Bold')
             .fillColor('#374151')
             .text(title, 25, y);
          return y + 15;
        };

        // Helper function to add compact label-value pair
        const addCompactLabelValue = (label, value, y) => {
          doc.fontSize(8)
             .font('Helvetica')
             .fillColor('#6B7280')
             .text(label, 25, y, { width: 120 });

          doc.fontSize(8)
           .font('Helvetica')
             .fillColor('#111827')
             .text(value || 'N/A', 150, y, { width: 400 });
          
          return y + 12;
        };

        // Header - Clean and minimal like Airbnb
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#111827')
           .text('ParkShare', 25, 30);

        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#6B7280')
           .text('Parking Booking Receipt', 25, 50);

        // Receipt number and date on the right
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text(`Receipt #${booking.id}`, 400, 30);

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#6B7280')
           .text(new Date().toLocaleDateString('en-US', { 
             year: 'numeric', 
             month: 'short', 
             day: 'numeric' 
           }), 400, 45);

        let currentY = 80;
        drawLine(currentY);
        currentY += 20;

        // Booking Details Section
        currentY = addCompactSection('BOOKING DETAILS', currentY);
        
        // Format dates safely
        const formatDate = (dateStr) => {
          if (!dateStr) return 'N/A';
          const date = new Date(dateStr);
          return isNaN(date) ? 'N/A' : date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        };

        currentY = addCompactLabelValue('Parking Spot:', spot?.title || spot?.location || 'N/A', currentY);
        currentY = addCompactLabelValue('Location:', spot?.address || spot?.location || 'N/A', currentY);
        currentY = addCompactLabelValue('Start Time:', formatDate(booking.startTime), currentY);
        currentY = addCompactLabelValue('End Time:', formatDate(booking.endTime), currentY);
        
        // Calculate duration
        const calculateDuration = () => {
          if (!booking.startTime || !booking.endTime) return 'N/A';
          const start = new Date(booking.startTime);
          const end = new Date(booking.endTime);
          if (isNaN(start) || isNaN(end)) return 'N/A';
          
          const diffMs = end - start;
          const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
          return `${diffHours} hours`;
        };
        
        currentY = addCompactLabelValue('Duration:', calculateDuration(), currentY);

        currentY += 15;
        drawLine(currentY);
        currentY += 20;

        // Customer Information Section
        currentY = addCompactSection('CUSTOMER INFORMATION', currentY);
        currentY = addCompactLabelValue('Name:', user?.displayName || user?.username || user?.email || 'N/A', currentY);
        currentY = addCompactLabelValue('Email:', user?.email || 'N/A', currentY);
        currentY = addCompactLabelValue('Customer ID:', user?.uid || user?.id || 'N/A', currentY);

        currentY += 15;
        drawLine(currentY);
        currentY += 20;

        // Payment Information Section
        currentY = addCompactSection('PAYMENT INFORMATION', currentY);
        currentY = addCompactLabelValue('Payment Status:', (booking.paymentStatus || booking.status || 'Paid').toUpperCase(), currentY);
        currentY = addCompactLabelValue('Payment Method:', booking.paymentMethod || 'Credit Card', currentY);
        currentY = addCompactLabelValue('Transaction ID:', booking.transactionId || booking.paymentId || booking.id, currentY);
        if (booking.paidAt) {
          currentY = addCompactLabelValue('Payment Date:', formatDate(booking.paidAt), currentY);
        }

        currentY += 15;
        drawLine(currentY);
        currentY += 20;

        // Price Breakdown Section - Compact table like Airbnb
        currentY = addCompactSection('PRICE BREAKDOWN', currentY);

        const hourlyRate = spot?.price || parseFloat(spot?.hourlyRate?.replace(/[^0-9.]/g, '')) || booking.hourlyRate || 0;
        const totalHours = booking.hours || 0;
        const subtotal = hourlyRate * totalHours;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        // Compact table headers
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text('Description', 25, currentY)
           .text('Amount', 500, currentY);
        
        currentY += 15;
        drawLine(currentY);
        currentY += 10;

        // Table rows
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#111827')
           .text(`Hourly Rate ($${hourlyRate.toFixed(2)})`, 25, currentY)
           .text(`$${hourlyRate.toFixed(2)}`, 500, currentY);
        
        currentY += 12;
        
        doc.text(`Duration (${totalHours} hours)`, 25, currentY)
           .text(`$${subtotal.toFixed(2)}`, 500, currentY);
        
        currentY += 12;

        doc.text('Tax (10%)', 25, currentY)
           .text(`$${tax.toFixed(2)}`, 500, currentY);
        
        currentY += 15;
        drawLine(currentY);
        currentY += 10;

        // Total
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#111827')
           .text('TOTAL', 25, currentY)
           .text(`$${total.toFixed(2)}`, 500, currentY);

        currentY += 25;
        drawLine(currentY);
        currentY += 20;

        // Terms and Conditions - Compact
        currentY = addCompactSection('TERMS AND CONDITIONS', currentY);
        
        const terms = [
          '• This receipt serves as proof of payment for your parking booking.',
          '• Cancellations must be made at least 2 hours before the booking time.',
          '• ParkShare is not responsible for any damage to vehicles.',
          '• Please follow all parking rules and regulations.',
          '• Contact support for any issues or questions.'
        ];

        doc.fontSize(7)
           .font('Helvetica')
           .fillColor('#6B7280')
           .text(terms.join('\n'), 25, currentY, { width: 540 });

        currentY += 80;

        // Footer - Clean and minimal
        drawLine(currentY);
        currentY += 15;

        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#6B7280')
           .text('Thank you for choosing ParkShare!', { align: 'center' })
           .text('support@parkshare.com | www.parkshare.com', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({ filePath, fileName });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  async sendReceiptEmail(userEmail, booking, spot, user, pdfPath) {
    try {
      const mailOptions = {
        from: 'your-email@gmail.com', // Replace with actual email
        to: userEmail,
        subject: `ParkShare Booking Receipt - ${booking.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E3A8A;">ParkShare Booking Receipt</h2>
            
            <p>Dear ${user?.displayName || 'Valued Customer'},</p>
            
            <p>Thank you for your booking with ParkShare! Please find your receipt attached.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1E3A8A; margin-top: 0;">Booking Summary</h3>
              <p><strong>Receipt Number:</strong> ${booking.id}</p>
              <p><strong>Parking Spot:</strong> ${spot?.title || spot?.location}</p>
              <p><strong>Location:</strong> ${spot?.address || spot?.location}</p>
              <p><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}</p>
              <p><strong>Duration:</strong> ${booking.hours} hours</p>
              <p><strong>Total Amount:</strong> $${(booking.totalPrice || 0).toFixed(2)}</p>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The ParkShare Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
              This is an automated email. Please do not reply to this message.<br>
              For support, contact: support@parkshare.com
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `receipt_${booking.id}.pdf`,
            path: pdfPath
          }
        ]
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('Error sending receipt email:', error);
      throw error;
    }
  }

  async generateAndSendReceipt(booking, spot, user) {
    try {
      // Generate PDF
      const { filePath, fileName } = await this.generateReceiptPDF(booking, spot, user);
      
      // Send email (only if email is configured)
      if (user?.email && this.emailTransporter.options.auth.user !== 'your-email@gmail.com') {
        await this.sendReceiptEmail(user.email, booking, spot, user, filePath);
      }
      
      return { filePath, fileName };
    } catch (error) {
      console.error('Error generating and sending receipt:', error);
      throw error;
    }
  }
}

module.exports = new ReceiptService(); 