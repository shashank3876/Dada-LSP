import { Injectable, Logger } from '@nestjs/common';

export interface OtpDeliveryResult {
  success: boolean;
  channel: 'SMS' | 'EMAIL' | 'SMS_SIMULATED' | 'EMAIL_SIMULATED';
  messageId?: string;
  recipient: string;
  simulated: boolean;
  error?: string;
}

export interface DualOtpDeliveryResult {
  smsResult?: OtpDeliveryResult;
  emailResult: OtpDeliveryResult;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // MSG91 Configuration
  private readonly msg91AuthKey = process.env.MSG91_AUTH_KEY;
  private readonly msg91SenderId = process.env.MSG91_SENDER_ID || 'DADADV';
  private readonly msg91TemplateId = process.env.MSG91_TEMPLATE_ID || 'DLT_DADA_OTP';

  // Resend Configuration
  private readonly resendApiKey = process.env.RESEND_API_KEY;
  private readonly emailFrom = process.env.EMAIL_FROM || 'Dada Advisory <onboarding@resend.dev>';

  /**
   * Dispatches an SMS OTP via MSG91 (or simulated fallback)
   */
  async sendPhoneOtp(
    mobileNumber: string,
    otp: string,
    context?: { organizationName?: string; purpose?: string },
  ): Promise<OtpDeliveryResult> {
    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    const formattedMobile = cleanMobile.startsWith('91') && cleanMobile.length === 12
      ? cleanMobile
      : cleanMobile.length === 10
      ? `91${cleanMobile}`
      : cleanMobile;

    const orgName = context?.organizationName || 'Dada Advisory';
    const purpose = context?.purpose || 'verification';

    if (this.msg91AuthKey) {
      try {
        this.logger.log(`Dispatching live SMS OTP via MSG91 to +${formattedMobile}...`);
        
        // MSG91 SendOTP API v5
        const response = await fetch('https://api.msg91.com/api/v5/otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authkey: this.msg91AuthKey,
          },
          body: JSON.stringify({
            template_id: this.msg91TemplateId,
            mobile: formattedMobile,
            otp: otp,
            sender: this.msg91SenderId,
            company: orgName,
          }),
        });

        const data = (await response.json().catch(() => ({}))) as any;

        if (!response.ok || (data && data.type === 'error')) {
          const errMsg = data?.message || `HTTP ${response.status} from MSG91`;
          this.logger.error(`MSG91 dispatch failed: ${errMsg}`);
          return {
            success: false,
            channel: 'SMS',
            recipient: `+${formattedMobile}`,
            simulated: false,
            error: errMsg,
          };
        }

        this.logger.log(`Live SMS OTP delivered successfully via MSG91 to +${formattedMobile} (RequestId: ${data?.request_id})`);
        return {
          success: true,
          channel: 'SMS',
          messageId: data?.request_id,
          recipient: `+${formattedMobile}`,
          simulated: false,
        };
      } catch (err: any) {
        this.logger.error(`Error connecting to MSG91 API: ${err.message}`);
        return {
          success: false,
          channel: 'SMS',
          recipient: `+${formattedMobile}`,
          simulated: false,
          error: err.message,
        };
      }
    } else {
      // Plug-and-Play Simulation Mode (active until MSG91_AUTH_KEY is provided)
      this.logger.log(
        `📱 [MSG91 SIMULATION] OTP Dispatched to +${formattedMobile} | Code: [${otp}] | Purpose: ${purpose} (${orgName})`,
      );
      return {
        success: true,
        channel: 'SMS_SIMULATED',
        messageId: `msg91_sim_${Date.now()}`,
        recipient: `+${formattedMobile}`,
        simulated: true,
      };
    }
  }

  /**
   * Dispatches an Email OTP via Resend (or simulated fallback)
   */
  async sendEmailOtp(
    email: string,
    otp: string,
    context?: { recipientName?: string; organizationName?: string; purpose?: string },
  ): Promise<OtpDeliveryResult> {
    const orgName = context?.organizationName || 'TechCorp Solutions';
    const recipientName = context?.recipientName || 'Valued Employee';
    const purpose = context?.purpose || 'Portal Access Verification';

    if (this.resendApiKey) {
      try {
        this.logger.log(`Dispatching live Email OTP via Resend to ${email}...`);

        const htmlBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">Dada Advisory</h2>
              <p style="color: #64748b; font-size: 13px; margin: 0;">Lending Service Provider for ${orgName}</p>
            </div>
            <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
              <p style="color: #334155; font-size: 14px; margin-top: 0; line-height: 1.5;">Hello <strong>${recipientName}</strong>,</p>
              <p style="color: #334155; font-size: 14px; line-height: 1.5;">Use the following one-time verification code (OTP) to complete your <strong>${purpose}</strong>:</p>
              <div style="text-align: center; margin: 28px 0;">
                <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #059669; background-color: #ecfdf5; padding: 12px 28px; border-radius: 8px; border: 1px solid #a7f3d0; display: inline-block;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">This code will expire in <strong>10 minutes</strong>. Do not share this OTP with anyone, including Dada Advisory or TechCorp support staff.</p>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">© 2026 Dada Advisory LSP. Regulated RBI Digital Lending Compliant Platform.</p>
            </div>
          </div>
        `;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.resendApiKey}`,
          },
          body: JSON.stringify({
            from: this.emailFrom,
            to: [email],
            subject: `[${otp}] Your Dada Advisory Verification Code`,
            html: htmlBody,
          }),
        });

        const data = (await response.json().catch(() => ({}))) as any;

        if (!response.ok) {
          const errMsg = data?.message || `HTTP ${response.status} from Resend`;
          this.logger.error(`Resend dispatch failed: ${errMsg}`);
          return {
            success: false,
            channel: 'EMAIL',
            recipient: email,
            simulated: false,
            error: errMsg,
          };
        }

        this.logger.log(`Live Email OTP delivered successfully via Resend to ${email} (MessageId: ${data?.id})`);
        return {
          success: true,
          channel: 'EMAIL',
          messageId: data?.id,
          recipient: email,
          simulated: false,
        };
      } catch (err: any) {
        this.logger.error(`Error connecting to Resend API: ${err.message}`);
        return {
          success: false,
          channel: 'EMAIL',
          recipient: email,
          simulated: false,
          error: err.message,
        };
      }
    } else {
      // Plug-and-Play Simulation Mode (active until RESEND_API_KEY is provided)
      this.logger.log(
        `✉️ [RESEND SIMULATION] Email OTP Dispatched to ${email} | Code: [${otp}] | Recipient: ${recipientName} (${orgName})`,
      );
      return {
        success: true,
        channel: 'EMAIL_SIMULATED',
        messageId: `resend_sim_${Date.now()}`,
        recipient: email,
        simulated: true,
      };
    }
  }

  /**
   * Dispatches Dual OTP across Phone (SMS) and Email simultaneously
   */
  async sendDualOtp(params: {
    mobile?: string;
    email: string;
    otp: string;
    organizationName?: string;
    recipientName?: string;
    purpose?: string;
  }): Promise<DualOtpDeliveryResult> {
    const { mobile, email, otp, organizationName, recipientName, purpose } = params;

    const emailPromise = this.sendEmailOtp(email, otp, {
      recipientName,
      organizationName,
      purpose,
    });

    const smsPromise = mobile
      ? this.sendPhoneOtp(mobile, otp, { organizationName, purpose })
      : Promise.resolve(undefined);

    const [emailResult, smsResult] = await Promise.all([emailPromise, smsPromise]);

    return {
      emailResult,
      smsResult,
    };
  }
}
