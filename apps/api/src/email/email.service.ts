import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly ses: SESClient;
  private readonly fromEmail: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.ses = new SESClient({
      region: this.config.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.fromEmail = this.config.getOrThrow<string>('SES_FROM_EMAIL');
  }

  async sendOtp(email: string, code: string): Promise<void> {
    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: `Tu código de acceso a Mary: ${code}` },
        Body: {
          Html: {
            Data: `
              <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px; text-align: center;">
                <h1 style="color: #800020; font-size: 28px; margin-bottom: 8px;">Mary</h1>
                <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Tu guía turística personal</p>
                <p style="color: #333; font-size: 16px; margin-bottom: 24px;">Tu código de verificación es:</p>
                <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #800020;">${code}</span>
                </div>
                <p style="color: #999; font-size: 13px;">Este código expira en 10 minutos.</p>
                <p style="color: #999; font-size: 13px;">Si no solicitaste este código, ignora este correo.</p>
              </div>
            `,
          },
          Text: {
            Data: `Tu código de acceso a Mary es: ${code}. Expira en 10 minutos.`,
          },
        },
      },
    });

    try {
      await this.ses.send(command);
      this.logger.log(`OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}`, error);
      throw error;
    }
  }
}
