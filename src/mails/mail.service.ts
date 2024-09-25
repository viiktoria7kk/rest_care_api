import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail({
    to,
    subject,
    template,
    context,
  }: SendEmailOptions): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      template: `./src/mails/templates/${template}`,
      context,
    });
  }
}
