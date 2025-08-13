import nodemailer from "nodemailer";

// Create transporter (you can use Gmail, SendGrid, or any SMTP service)
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send email verification
export const sendVerificationEmail = async (user, verificationToken) => {
    const transporter = createTransporter();

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Welcome to ${process.env.APP_NAME}!</h2>
                <p>Hi ${user.fullName},</p>
                <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    This link will expire in 10 minutes for security reasons.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If you didn't create an account, you can safely ignore this email.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (user) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: `Welcome to ${process.env.APP_NAME}!`,
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #28a745;">Email Verified Successfully! 🎉</h2>
                <p>Hi ${user.fullName},</p>
                <p>Congratulations! Your email has been verified and your account is now active.</p>
                <p>You can now:</p>
                <ul>
                    <li>Browse our products</li>
                    <li>Add items to your cart</li>
                    <li>Place orders</li>
                    <li>Manage your profile and addresses</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}" 
                       style="background-color: #28a745; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Start Shopping
                    </a>
                </div>
                <p>Thank you for choosing ${process.env.APP_NAME}!</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully');
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw error for welcome email as it's not critical
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
    const transporter = createTransporter();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hi ${user.fullName},</p>
                <p>You have requested to reset your password. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #dc3545; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    This link will expire in 15 minutes for security reasons.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If you didn't request a password reset, you can safely ignore this email.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};
