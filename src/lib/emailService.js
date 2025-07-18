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
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Email transporter verification failed:", error);
      }
    });
  }

  /**
   * Enhanced version update notification with comprehensive details
   */
  async sendVersionUpdateNotification({
    documentName,
    originalName,
    versionNumber,
    previousVersion,
    uploadedBy,
    recipientEmail,
    recipientName,
    documentUrl,
    changeType = "version_upload",
    description = "",
    fileSize = null,
    mimeType = "",
    tags = [],
    department = "",
    restoredFromVersion = null,
    versionChanges = null,
  }) {
    try {
      const displayName = originalName || documentName;
      let subject = "";
      let emailContent = "";

      // Generate subject based on change type
      switch (changeType) {
        case "version_upload":
          subject = `📄 New Version Available: ${displayName} v${versionNumber}`;
          break;
        case "version_restore":
          subject = `🔄 Document Restored: ${displayName} v${versionNumber}`;
          break;
        default:
          subject = `📋 Document Updated: ${displayName} v${versionNumber}`;
      }

      if (changeType === "version_upload") {
        emailContent = this.generateVersionUploadTemplate({
          displayName,
          versionNumber,
          previousVersion,
          uploadedBy,
          recipientName,
          documentUrl,
          description,
          fileSize,
          mimeType,
          tags,
          department,
          versionChanges,
        });
      } else if (changeType === "version_restore") {
        emailContent = this.generateVersionRestoreTemplate({
          displayName,
          versionNumber,
          uploadedBy,
          recipientName,
          documentUrl,
          restoredFromVersion,
          description,
          fileSize,
          mimeType,
          tags,
          department,
        });
      }

      const mailOptions = {
        from: `"DMS-360 Document Management" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: emailContent,
        headers: {
          "X-Priority": "3",
          "X-MSMail-Priority": "Normal",
          "X-Mailer": "DMS-360",
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        recipient: recipientEmail,
      };
    } catch (error) {
      console.error(
        `Failed to send version notification to ${recipientEmail}:`,
        error
      );
      return {
        success: false,
        error: error.message,
        recipient: recipientEmail,
      };
    }
  }

  /**
   * Send batch version notifications to multiple recipients
   */
  async sendBatchVersionNotifications(recipients, notificationData) {
    const results = [];
    const batchSize = 10; // Send in batches to avoid overwhelming the SMTP server

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(async (recipient) => {
        if (!recipient.email || !recipient.name) {
          return {
            success: false,
            error: "Invalid recipient data",
            recipient: recipient.email,
          };
        }

        return await this.sendVersionUpdateNotification({
          ...notificationData,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
        });
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(
        ...batchResults.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : { success: false, error: result.reason }
        )
      );

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      total: recipients.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Generate email template for version upload
   */
  generateVersionUploadTemplate({
    displayName,
    versionNumber,
    previousVersion,
    uploadedBy,
    recipientName,
    documentUrl,
    description,
    fileSize,
    mimeType,
    tags,
    department,
    versionChanges,
  }) {
    const formatFileSize = (bytes) => {
      if (!bytes) return "Unknown";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileTypeIcon = (mimeType) => {
      if (mimeType.includes("pdf")) return "📄";
      if (mimeType.includes("word")) return "📝";
      if (mimeType.includes("excel")) return "📊";
      if (mimeType.includes("powerpoint")) return "📈";
      if (mimeType.includes("image")) return "🖼️";
      if (mimeType.includes("video")) return "🎥";
      return "📄";
    };

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 15px; text-align: center; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
          <div style="font-size: 48px; margin-bottom: 10px;">${getFileTypeIcon(
            mimeType
          )}</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Document Version Updated</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">DMS-360 Document Management System</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 15px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2d3748; margin-top: 0; font-size: 24px;">Hello ${recipientName},</h2>
          
          <p style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            A new version of the document <strong style="color: #2d3748;">"${displayName}"</strong> has been uploaded to the system.
            ${
              description
                ? `<br><br><em style="color: #6b7280;">"${description}"</em>`
                : ""
            }
          </p>
          
          <!-- Document Details Card -->
          <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #667eea;">
            <h3 style="margin: 0 0 20px 0; color: #2d3748; font-size: 20px; display: flex; align-items: center;">
              <span style="margin-right: 10px;">📋</span> Document Details
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
              <div>
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Document:</strong> ${displayName}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">New Version:</strong> <span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600;">v${versionNumber}</span></p>
                ${
                  previousVersion
                    ? `<p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Previous Version:</strong> v${previousVersion}</p>`
                    : ""
                }
                ${
                  department
                    ? `<p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Department:</strong> ${department}</p>`
                    : ""
                }
              </div>
              <div>
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Uploaded by:</strong> ${
                  uploadedBy.name
                }</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Email:</strong> ${
                  uploadedBy.email
                }</p>
                ${
                  fileSize
                    ? `<p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">File Size:</strong> ${formatFileSize(
                        fileSize
                      )}</p>`
                    : ""
                }
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Upload Date:</strong> ${new Date().toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}</p>
              </div>
            </div>
            
            ${
              tags && tags.length > 0
                ? `
              <div style="margin-top: 20px;">
                <p style="margin: 0 0 10px 0; color: #2d3748; font-weight: 600;">Tags:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${tags
                    .map(
                      (tag) =>
                        `<span style="background: #e2e8f0; color: #2d3748; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">#${tag}</span>`
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
            
            ${
              versionChanges
                ? `
              <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px 0; color: #2d3748; font-weight: 600;">Version Changes:</p>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
                  ${versionChanges
                    .map(
                      (change) => `<li style="margin: 5px 0;">${change}</li>`
                    )
                    .join("")}
                </ul>
              </div>
            `
                : ""
            }
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${documentUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: transform 0.2s;">
              🔗 View Document
            </a>
          </div>
          
          <!-- Quick Actions -->
          <div style="background: #f7fafc; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h4 style="margin: 0 0 15px 0; color: #2d3748; font-size: 16px;">Quick Actions:</h4>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
              <a href="${documentUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; display: flex; align-items: center;">
                <span style="margin-right: 5px;">👁️</span> View Document
              </a>
              <a href="${documentUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; display: flex; align-items: center;">
                <span style="margin-right: 5px;">📋</span> Version History
              </a>
              <a href="${documentUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; display: flex; align-items: center;">
                <span style="margin-right: 5px;">⬇️</span> Download
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #718096; font-size: 13px; line-height: 1.6; margin: 0;">
              <strong>💡 Tip:</strong> You can access all document versions through the version history feature. 
              Previous versions remain available and can be restored if needed.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #a0aec0; font-size: 12px; margin: 10px 0;">
            This is an automated notification from DMS-360. Please do not reply to this email.
          </p>
          <p style="color: #a0aec0; font-size: 12px; margin: 5px 0;">
            © 2024 DMS-360 Document Management System. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate email template for version restore
   */
  generateVersionRestoreTemplate({
    displayName,
    versionNumber,
    uploadedBy,
    recipientName,
    documentUrl,
    restoredFromVersion,
    description,
    fileSize,
    mimeType,
    tags,
    department,
  }) {
    const formatFileSize = (bytes) => {
      if (!bytes) return "Unknown";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; border-radius: 15px; text-align: center; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
          <div style="font-size: 48px; margin-bottom: 10px;">🔄</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Document Version Restored</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">DMS-360 Document Management System</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 15px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2d3748; margin-top: 0; font-size: 24px;">Hello ${recipientName},</h2>
          
          <p style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            A previous version of the document <strong style="color: #2d3748;">"${displayName}"</strong> has been restored as a new version.
            ${
              restoredFromVersion
                ? `The content from version ${restoredFromVersion} is now available as version ${versionNumber}.`
                : ""
            }
          </p>
          
          <!-- Document Details Card -->
          <div style="background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #28a745;">
            <h3 style="margin: 0 0 20px 0; color: #2d3748; font-size: 20px; display: flex; align-items: center;">
              <span style="margin-right: 10px;">📋</span> Restoration Details
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
              <div>
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Document:</strong> ${displayName}</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">New Version:</strong> <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600;">v${versionNumber}</span></p>
                ${
                  restoredFromVersion
                    ? `<p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Restored From:</strong> v${restoredFromVersion}</p>`
                    : ""
                }
                ${
                  department
                    ? `<p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Department:</strong> ${department}</p>`
                    : ""
                }
              </div>
              <div>
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Restored by:</strong> ${
                  uploadedBy.name
                }</p>
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Email:</strong> ${
                  uploadedBy.email
                }</p>
                ${
                  fileSize
                    ? `<p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">File Size:</strong> ${formatFileSize(
                        fileSize
                      )}</p>`
                    : ""
                }
                <p style="margin: 8px 0; color: #4a5568;"><strong style="color: #2d3748;">Restore Date:</strong> ${new Date().toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}</p>
              </div>
            </div>
            
            ${
              tags && tags.length > 0
                ? `
              <div style="margin-top: 20px;">
                <p style="margin: 0 0 10px 0; color: #2d3748; font-weight: 600;">Tags:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${tags
                    .map(
                      (tag) =>
                        `<span style="background: #e2e8f0; color: #2d3748; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">#${tag}</span>`
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
            
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #c6f6d5;">
              <p style="margin: 0; color: #2d3748; font-size: 14px;">
                <strong>📝 Note:</strong> This restoration created a new version while preserving all previous versions. 
                You can still access the complete version history for this document.
              </p>
            </div>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${documentUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
              🔗 View Restored Document
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #a0aec0; font-size: 12px; margin: 10px 0;">
            This is an automated notification from DMS-360. Please do not reply to this email.
          </p>
          <p style="color: #a0aec0; font-size: 12px; margin: 5px 0;">
            © 2024 DMS-360 Document Management System. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Send document deletion notification
   */
  async sendDocumentDeletedNotification({
    documentName,
    deletedBy,
    recipientEmail,
    recipientName,
    deletionReason = "",
  }) {
    try {
      const subject = `🗑️ Document Deleted: ${documentName}`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🗑️ Document Deleted</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">DMS-360 Notification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              The document <strong>"${documentName}"</strong> has been deleted from the system.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📋 Deletion Details</h3>
              <p style="margin: 5px 0; color: #555;"><strong>Document:</strong> ${documentName}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Deleted by:</strong> ${
                deletedBy.name
              } (${deletedBy.email})</p>
              <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              ${
                deletionReason
                  ? `<p style="margin: 5px 0; color: #555;"><strong>Reason:</strong> ${deletionReason}</p>`
                  : ""
              }
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
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Deletion email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send document shared notification
   */
  async sendDocumentSharedNotification({
    documentName,
    sharedBy,
    recipientEmail,
    recipientName,
    documentUrl,
    permissions = "view",
    message = "",
  }) {
    try {
      const subject = `📤 Document Shared: ${documentName}`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6f42c1 0%, #007bff 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📤 Document Shared</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">DMS-360 Notification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              ${
                sharedBy.name
              } has shared the document <strong>"${documentName}"</strong> with you.
            </p>
            
            ${
              message
                ? `
              <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
                <p style="margin: 0; color: #555; font-style: italic;">"${message}"</p>
              </div>
            `
                : ""
            }
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📋 Share Details</h3>
              <p style="margin: 5px 0; color: #555;"><strong>Document:</strong> ${documentName}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Shared by:</strong> ${
                sharedBy.name
              } (${sharedBy.email})</p>
              <p style="margin: 5px 0; color: #555;"><strong>Permissions:</strong> ${permissions}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${documentUrl}" style="background: linear-gradient(135deg, #6f42c1 0%, #007bff 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
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
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Share email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enhanced document creation notification
   */
  async sendDocumentCreatedNotification({
    documentName,
    uploadedBy,
    recipientEmail,
    recipientName,
    documentUrl,
    fileSize = null,
    mimeType = "",
    tags = [],
    department = "",
    description = "",
  }) {
    try {
      const subject = `📄 New Document Created: ${documentName}`;

      const formatFileSize = (bytes) => {
        if (!bytes) return "Unknown";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      };

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
              ${description ? `<br><br><em>"${description}"</em>` : ""}
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📋 Document Details</h3>
              <p style="margin: 5px 0; color: #555;"><strong>Document:</strong> ${documentName}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Created by:</strong> ${
                uploadedBy.name
              } (${uploadedBy.email})</p>
              ${
                fileSize
                  ? `<p style="margin: 5px 0; color: #555;"><strong>File Size:</strong> ${formatFileSize(
                      fileSize
                    )}</p>`
                  : ""
              }
              ${
                department
                  ? `<p style="margin: 5px 0; color: #555;"><strong>Department:</strong> ${department}</p>`
                  : ""
              }
              <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              
              ${
                tags && tags.length > 0
                  ? `
                <div style="margin-top: 15px;">
                  <strong style="color: #333;">Tags:</strong><br>
                  ${tags
                    .map(
                      (tag) =>
                        `<span style="background: #e2e8f0; color: #2d3748; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin: 2px;">#${tag}</span>`
                    )
                    .join(" ")}
                </div>
              `
                  : ""
              }
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
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Document creation email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test email connection
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: "Email service is working properly" };
    } catch (error) {
      console.error("❌ Email service connection test failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(recipientEmail) {
    try {
      const result = await this.sendVersionUpdateNotification({
        documentName: "Test Document",
        originalName: "Test Document.pdf",
        versionNumber: 2,
        previousVersion: 1,
        uploadedBy: {
          name: "DMS-360 System",
          email: process.env.SMTP_USER,
        },
        recipientEmail: recipientEmail,
        recipientName: "Test User",
        documentUrl: "https://example.com/test-document",
        changeType: "version_upload",
        description:
          "This is a test email to verify the email service functionality.",
        fileSize: 1024 * 1024, // 1MB
        mimeType: "application/pdf",
        tags: ["test", "demo"],
        department: "IT Department",
      });

      return result;
    } catch (error) {
      console.error("Test email sending failed:", error);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
