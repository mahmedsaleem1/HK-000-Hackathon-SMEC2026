const nodemailer = require('nodemailer');

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendEmail(to, subject, htmlContent) {
        try {
            const mailOptions = {
                from: `"${process.env.FROM_NAME || 'Campus Hub'}" <${process.env.FROM_EMAIL || 'noreply@campushub.edu'}>`,
                to,
                subject,
                html: htmlContent
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email sending failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    generateBookingConfirmation(reservation, facility, member) {
        return `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
                <div style="background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                        Booking Request Received
                    </h2>
                    <p style="color: #34495e; font-size: 16px;">Hello ${member.fullName},</p>
                    <p style="color: #7f8c8d; font-size: 14px; line-height: 1.6;">
                        Your booking request has been submitted and is awaiting approval.
                    </p>
                    <div style="background: #ecf0f1; border-radius: 6px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 8px 0; color: #2c3e50;"><strong>Facility:</strong> ${facility.name}</p>
                        <p style="margin: 8px 0; color: #2c3e50;"><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p style="margin: 8px 0; color: #2c3e50;"><strong>Time:</strong> ${reservation.startTime} - ${reservation.endTime}</p>
                        <p style="margin: 8px 0; color: #2c3e50;"><strong>Purpose:</strong> ${reservation.title}</p>
                    </div>
                    <p style="color: #7f8c8d; font-size: 13px;">
                        You will receive another notification once your request has been reviewed.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 25px 0;">
                    <p style="color: #bdc3c7; font-size: 12px; text-align: center;">
                        Campus Hub - Resource Management System
                    </p>
                </div>
            </div>
        `;
    }

    generateStatusUpdate(reservation, facility, member, status, remarks = '') {
        const statusColors = {
            approved: '#27ae60',
            declined: '#e74c3c',
            cancelled: '#f39c12'
        };
        
        const statusMessages = {
            approved: 'Great news! Your booking has been approved.',
            declined: 'Unfortunately, your booking request has been declined.',
            cancelled: 'Your booking has been cancelled.'
        };

        return `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
                <div style="background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid ${statusColors[status] || '#3498db'}; padding-bottom: 10px;">
                        Booking ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </h2>
                    <p style="color: #34495e; font-size: 16px;">Hello ${member.fullName},</p>
                    <p style="color: #7f8c8d; font-size: 14px; line-height: 1.6;">
                        ${statusMessages[status] || 'Your booking status has been updated.'}
                    </p>
                    <div style="background: #ecf0f1; border-radius: 6px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 8px 0; color: #2c3e50;"><strong>Facility:</strong> ${facility.name}</p>
                        <p style="margin: 8px 0; color: #2c3e50;"><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p style="margin: 8px 0; color: #2c3e50;"><strong>Time:</strong> ${reservation.startTime} - ${reservation.endTime}</p>
                        ${remarks ? `<p style="margin: 8px 0; color: #2c3e50;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
                    </div>
                    <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 25px 0;">
                    <p style="color: #bdc3c7; font-size: 12px; text-align: center;">
                        Campus Hub - Resource Management System
                    </p>
                </div>
            </div>
        `;
    }

    async notifyBookingCreated(reservation, facility, member) {
        const html = this.generateBookingConfirmation(reservation, facility, member);
        return this.sendEmail(member.email, `Booking Request: ${facility.name}`, html);
    }

    async notifyStatusUpdate(reservation, facility, member, remarks = '') {
        const html = this.generateStatusUpdate(reservation, facility, member, reservation.status, remarks);
        const subject = `Booking ${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}: ${facility.name}`;
        return this.sendEmail(member.email, subject, html);
    }
}

module.exports = new NotificationService();
