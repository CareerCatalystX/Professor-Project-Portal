import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

export async function sendOTP(email: string, otp: string) {
  // Read the logo image and convert to base64 (optional approach)
  const logoPath = path.join(process.cwd(), 'public', '/logo-master.png'); // Adjust filename as needed
  let logoBase64 = '';

  try {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = logoBuffer.toString('base64');
  } catch (error) {
    console.log('Logo not found, proceeding without image');
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Career CatalystX - OTP Verification</title>
    </head>
    <body style="margin: 0; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style=" margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with Gradient -->
            <tr>
                <td style="background: #667eea; background: -webkit-linear-gradient(135deg, #667eea 0%, #764ba2 100%); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: white;">
                    ${logoBase64 ? `<img src="cid:logo@catalystx" alt="Career CatalystX Logo" style="max-width: 150px;" />` : ''}
                    <h1 style="font-size: 28px; font-weight: bold; margin: 10px 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">Career CatalystX</h1>
                    <p style="font-size: 14px; margin: 5px 0 0 0; opacity: 0.9;">Accelerating Your Career Journey</p>
                </td>
            </tr>
            
            <!-- Gradient Divider -->
            <tr>
                <td style="height: 4px; background: #667eea; background: -webkit-linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c); background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);"></td>
            </tr>
            
            <!-- Main Content -->
            <tr>
                <td style="padding: 40px 30px; text-align: center;">
                    <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
                        Hello there! 👋
                    </div>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                        We received a request to verify your email address. Please use the OTP code below to complete your signup/signin process.
                    </p>
                    
                    <!-- OTP Section with Gradient -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                            <td style="background: #f093fb; background: -webkit-linear-gradient(135deg, #f093fb 0%, #f5576c 100%); background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; padding: 30px; text-align: center;">
                                <div style="color: white; font-size: 16px; margin-bottom: 15px; font-weight: 600;">Your Verification Code</div>
                                <div style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; margin: 10px 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">${otp}</div>
                                <div style="color: white; font-size: 14px; opacity: 0.9;">⏰ Valid for 10 minutes</div>
                            </td>
                        </tr>
                    </table>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                        Enter this code in the verification field to continue with your Career CatalystX experience.
                    </p>
                    
                    <!-- Security Note -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                        <tr>
                            <td style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; color: #856404;">
                                🔐 <strong>Security Note:</strong> Never share this OTP with anyone. Career CatalystX will never ask for your OTP via phone or email.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <!-- Gradient Divider -->
            <tr>
                <td style="height: 4px; background: #667eea; background: -webkit-linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c); background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);"></td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td style="background-color: #2d3436; color: white; padding: 20px; text-align: center; font-size: 14px;">
                    <p style="margin: 5px 0;">© 2024 Career CatalystX. All rights reserved.</p>
                    <p style="margin: 5px 0;">
                        Need help? Contact us at 
                        <a href="mailto:support@careercatalystx.com" style="color: #74b9ff; text-decoration: none;">support@careercatalystx.com</a>
                    </p>
                    <p style="font-size: 12px; opacity: 0.8; margin: 15px 0 5px 0;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `Career CatalystX <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Career CatalystX Verification Code',
    text: `Hello from Career CatalystX!\n\nYour OTP verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nNever share this OTP with anyone for security reasons.\n\nBest regards,\nCareer CatalystX Team`,
    html: htmlContent,
    attachments: [
      {
        filename: 'logo-master.png',
        path: path.join(process.cwd(), 'public', '/logo-master.png'),
        cid: 'logo@catalystx'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}

export async function sendEmail(email: string, title: string, message: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: title,
    text: message,
  };

  await transporter.sendMail(mailOptions);
}


export async function sendApplicationStatusEmail(
  studentEmail: string,
  studentName: string,
  opportunityName: string,
  companyName: string,
  status: 'ACCEPTED' | 'NOT_SELECTED'
) {
  // Load logo
  const logoPath = path.join(process.cwd(), 'public', '/logo-master.png');
  let logoBase64 = '';
  
  try {
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = logoBuffer.toString('base64');
    }
  } catch (error) {
    console.log('Logo not found, using fallback');
  }

  const isAccepted = status === 'ACCEPTED';
  const statusColor = isAccepted ? '#059669' : '#4f46e5';
  const statusBgColor = isAccepted ? '#f0fdf4' : '#f8fafc';
  const statusTitle = isAccepted ? 'Application Accepted' : 'Application Update';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Career CatalystX - Application Status Update</title>
    </head>
    <body style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 1.6; color: #374151;">
        <div style="margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            
            <!-- Header -->
            <div style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
                ${logoBase64 ? `
                <div style="margin-bottom: 20px;">
                    <img src="cid:logo@catalystx" alt="Career CatalystX Logo" style="max-width: 150px;" />
                </div>` : ``}
                <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: white;">Career CatalystX</h1>
                <p style="font-size: 16px; margin: 8px 0 0 0; color: #d1d5db;">Career Opportunity Platform</p>
            </div>
            
            <!-- Status indicator -->
            <div style="height: 4px; background-color: ${statusColor};"></div>
            
            <!-- Main Content -->
            <div style="padding: 40px;">
                
                <!-- Status Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="font-size: 28px; font-weight: 600; margin: 0 0 12px 0; color: #111827;">${statusTitle}</h2>
                    <div style="width: 60px; height: 3px; background-color: ${statusColor}; margin: 0 auto; border-radius: 2px;"></div>
                </div>
                
                <!-- Personal Greeting -->
                <div style="margin-bottom: 32px;">
                    <p style="font-size: 18px; margin-bottom: 24px; color: #111827;">Dear ${studentName},</p>
                    
                    <!-- Status Message -->
                    <div style="background-color: ${statusBgColor}; border-left: 4px solid ${statusColor}; border-radius: 6px; padding: 24px; margin-bottom: 24px;">
                        <p style="font-size: 17px; margin: 0; line-height: 1.6; color: #374151;">
                            ${isAccepted 
                              ? 'We are pleased to inform you that your application for this opportunity has been accepted. Your qualifications and enthusiasm made you an excellent candidate.' 
                              : 'Thank you for your interest in this opportunity. After careful consideration of all applications, we have decided to proceed with candidates whose backgrounds more closely align with the specific requirements of this position.'}
                        </p>
                    </div>
                </div>
                
                <!-- Project Details -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 28px; margin-bottom: 32px;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Application Details</h3>
                    
                    <div style="display: grid; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: #6b7280; font-weight: 500;">Opportunity:</span>
                            <span style="color: #111827; font-weight: 600; text-align: right; max-width: 60%;">${opportunityName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: #6b7280; font-weight: 500;">Company:</span>
                            <span style="color: #111827; font-weight: 600;">${companyName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: #6b7280; font-weight: 500;">Decision Date:</span>
                            <span style="color: #111827; font-weight: 600;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: #6b7280; font-weight: 500;">Status:</span>
                            <span style="color: ${statusColor}; font-weight: 600;">${status === 'ACCEPTED' ? 'Accepted' : 'Not Selected'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Next Steps -->
                <div style="margin-bottom: 32px;">
                    ${isAccepted ? `
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 24px;">
                        <h3 style="font-size: 18px; font-weight: 600; color: #065f46; margin-bottom: 16px;">Next Steps</h3>
                        <div style="color: #047857; line-height: 1.6;">
                            <p style="margin-bottom: 12px;">${companyName} will be in contact with you within the next 3-5 business days to discuss:</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 8px;">Position timeline and expectations</li>
                                <li style="margin-bottom: 8px;">Onboarding procedures and required documentation</li>
                                <li style="margin-bottom: 0;">Initial meeting schedule and orientation</li>
                            </ul>
                            <p style="margin: 16px 0 0 0; font-style: italic;">Please ensure your contact information is up to date and monitor your email regularly.</p>
                        </div>
                    </div>
                    ` : `
                    <div style="background-color: #fefbff; border: 1px solid #e0e7ff; border-radius: 6px; padding: 24px;">
                        <h3 style="font-size: 18px; font-weight: 600; color: #3730a3; margin-bottom: 16px;">Continuing Your Career Journey</h3>
                        <div style="color: #4338ca; line-height: 1.6;">
                            <p style="margin-bottom: 16px;">While this particular opportunity wasn't the right fit, we encourage you to continue pursuing career experiences that align with your professional goals.</p>
                            
                            <p style="margin-bottom: 12px; font-weight: 500;">We recommend:</p>
                            <ul style="margin: 0 0 16px 0; padding-left: 20px;">
                                <li style="margin-bottom: 8px;">Exploring additional opportunities on Career CatalystX</li>
                                <li style="margin-bottom: 8px;">Connecting with companies in your areas of interest</li>
                                <li style="margin-bottom: 8px;">Gaining relevant experience through coursework or personal projects</li>
                                <li style="margin-bottom: 0;">Attending industry events and networking opportunities</li>
                            </ul>
                            
                            <p style="margin: 0; font-style: italic;">Your professional development is important, and we're confident you'll find the right opportunity to grow your career.</p>
                        </div>
                    </div>
                    `}
                </div>
                
                <!-- Contact Section -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-bottom: 24px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px;">Questions or Concerns</h3>
                    <p style="color: #6b7280; margin-bottom: 16px; line-height: 1.6;">
                        If you have questions regarding this decision or would like guidance on future applications, please feel free to reach out.
                    </p>
                    <div style="background-color: #f9fafb; border-radius: 4px; padding: 16px;">
                        <p style="margin: 0; color: #374151; line-height: 1.5;">
                            <strong>Professor:</strong> ${companyName}<br>
                            <strong>Platform Support:</strong> <a href="mailto:support@careercatalystx.com" style="color: #4f46e5; text-decoration: none;">support@careercatalystx.com</a>
                        </p>
                    </div>
                </div>
                
                <!-- Closing -->
                <div style="text-align: center; padding-top: 16px;">
                    <p style="color: #6b7280; margin-bottom: 16px; line-height: 1.6;">
                        ${isAccepted 
                          ? 'We look forward to working with you in this role.' 
                          : 'We appreciate your interest and wish you success in your career pursuits.'}
                    </p>
                    <div style="color: #374151; line-height: 1.5;">
                        <p style="margin: 0 0 4px 0;">Best regards,</p>
                        <p style="font-weight: 600; margin: 0 0 4px 0;">${companyName} Team</p>
                        <p style="font-size: 14px; color: #6b7280; margin: 0;">Career CatalystX Platform</p>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center;">
                <div style="margin-bottom: 16px;">
                    <a href="https://careercatalystx.com" style="color: #4f46e5; text-decoration: none; font-weight: 500; margin: 0 12px;">Platform</a>
                    <span style="color: #d1d5db;">|</span>
                    <a href="mailto:support@careercatalystx.com" style="color: #4f46e5; text-decoration: none; font-weight: 500; margin: 0 12px;">Support</a>
                    <span style="color: #d1d5db;">|</span>
                    <a href="#" style="color: #4f46e5; text-decoration: none; font-weight: 500; margin: 0 12px;">Privacy Policy</a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    © ${new Date().getFullYear()} Career CatalystX. All rights reserved.
                </p>
            </div>
        </div>
        
        <!-- Email client view link -->
        <div style="max-width: 650px; margin: 16px auto; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                <a href="#" style="color: #6b7280; text-decoration: none;">View in browser</a>
            </p>
        </div>
    </body>
    </html>
  `;

  const textContent = `
Dear ${studentName},

${isAccepted 
  ? 'We are pleased to inform you that your application for this opportunity has been accepted. Your qualifications and enthusiasm made you an excellent candidate.' 
  : 'Thank you for your interest in this opportunity. After careful consideration of all applications, we have decided to proceed with candidates whose backgrounds more closely align with the specific requirements of this position.'
}

APPLICATION DETAILS:
Opportunity: ${opportunityName}
Company: ${companyName}
Decision Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Status: ${status === 'ACCEPTED' ? 'Accepted' : 'Not Selected'}

${isAccepted ? `
NEXT STEPS:
${companyName} will be in contact with you within the next 3-5 business days to discuss position timeline, onboarding procedures, and initial meeting schedule. Please ensure your contact information is up to date and monitor your email regularly.

We look forward to working with you in this role.
` : `
CONTINUING YOUR CAREER JOURNEY:
While this particular opportunity wasn't the right fit, we encourage you to continue pursuing career experiences that align with your professional goals.

We recommend:
• Exploring additional opportunities on Career CatalystX
• Connecting with companies in your areas of interest
• Gaining relevant experience through coursework or personal projects
• Attending industry events and networking opportunities

Your professional development is important, and we're confident you'll find the right opportunity to grow your career.

We appreciate your interest and wish you success in your career pursuits.
`}

If you have questions regarding this decision or would like guidance on future applications, please feel free to reach out.

Company Contact: ${companyName}
Platform Support: support@careercatalystx.com

Best regards,
${companyName} Team
Career CatalystX Platform

---
© ${new Date().getFullYear()} Career CatalystX. All rights reserved.
Platform: https://careercatalystx.com | Support: support@careercatalystx.com
  `;

  const mailOptions = {
    from: `Career CatalystX Platform <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `Application Status Update - ${opportunityName} Position`,
    text: textContent,
    html: htmlContent,
    attachments: logoBase64 ? [
      {
        filename: 'logo-master.png',
        path: path.join(process.cwd(), 'public', '/logo-master.png'),
        cid: 'logo@catalystx'
      }
    ] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Application status email sent successfully to ${studentEmail}`);
  } catch (error) {
    console.error('Error sending application status email:', error);
    throw error;
  }
}