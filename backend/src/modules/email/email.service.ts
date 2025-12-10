import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(email: string, otp: string, name: string, expiresIn: number) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'MyVNU - Reset Password',
      template: 'otp-reset-password',
      context: {
        name,
        otp,
        expiresIn,
      },
    });
  }
}
