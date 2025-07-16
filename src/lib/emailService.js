import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVersionUpdateNotification({
    documentName,
    originalName,
    versionNumber,
    uploadedBy,
    recipientEmail,
    recipientName,
    documentUrl,
    changeType = "version_upload",
  }) {
    try {
      const displayName = originalName || documentName;
      const subject = `Document Update: ${displayName} - Version ${versionNumber}`;

      let emailContent = "";

      if (changeType === "version_upload") {
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">📄 Document Version Updated</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">DMS-360 Notification</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
              
              <p style="color: #555; line-height: 1.6;">
                A new version of the document <strong>"${displayName}"</strong> has been uploaded to the system.
              </p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px 0; color: #333;">📋 Document Details</h3>
                <p style="margin: 5px 0; color: #555;"><strong>Document:</strong> ${displayName}</p>
                <p style="margin: 5px 0; color: #555;"><strong>New Version:</strong> ${versionNumber}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Uploaded by:</strong> ${
                  uploadedBy.name
                } (${uploadedBy.email})</p>
                <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${documentUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  🔗 View Document
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This is an automated notification from DMS-360. Please do not reply to this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© 2024 DMS-360. All rights reserved.</p>
            </div>
          </div>
        `;
      } else if (changeType === "version_restore") {
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🔄 Document Version Restored</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">DMS-360 Notification</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
              
              <p style="color: #555; line-height: 1.6;">
                A previous version of the document <strong>"${displayName}"</strong> has been restored as a new version.
              </p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="margin: 0 0 10px 0; color: #333;">📋 Document Details</h3>
                <p style="margin: 5px 0; color: #555;"><strong>Document:</strong> ${displayName}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Restored Version:</strong> ${versionNumber}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Restored by:</strong> ${
                  uploadedBy.name
                } (${uploadedBy.email})</p>
                <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${documentUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  🔗 View Document
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This is an automated notification from DMS-360. Please do not reply to this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© 2024 DMS-360. All rights reserved.</p>
            </div>
          </div>
        `;
      }

      const mailOptions = {
        from: `"DMS-360" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: emailContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  async sendDocumentCreatedNotification({
    documentName,
    uploadedBy,
    recipientEmail,
    recipientName,
    documentUrl,
  }) {
    try {
      const subject = `New Document Created: ${documentName}`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📄 New Document Created</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">DMS-360 Notification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              A new document <strong>"${documentName}"</strong> has been created and uploaded to the system.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📋 Document Details</h3>
              <p style="margin: 5px 0; color: #555;"><strong>Document:</strong> ${documentName}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Created by:</strong> ${
                uploadedBy.name
              } (${uploadedBy.email})</p>
              <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${documentUrl}" style="background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                🔗 View Document
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This is an automated notification from DMS-360. Please do not reply to this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 DMS-360. All rights reserved.</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"DMS-360" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: emailContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
