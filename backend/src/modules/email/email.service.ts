import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendResetPasswordEmail(email: string, token: string) {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    const resetLink = `${apiUrl}/ProDeskApi/auth/redirect-app?token=${token}`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Recuperação de senha',
      html: `
        <h2>Recuperação de senha</h2>
        <p>Clique no link abaixo:</p>
        <a href="${resetLink}">Redefinir senha</a>
        <p>Se não abrir, copie o link:</p>
        <p>${resetLink}</p>
      `,
    });
  }

  async sendCreatePasswordEmail(email: string, token: string) {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    const createLink = `${apiUrl}/ProDeskApi/auth/redirect-app?token=${token}`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Criação de senha',
      html: `
      <h2>Bem-vindo!</h2>
      <p>Sua conta foi aprovada.</p>
      <p>Clique no link abaixo para criar sua senha:</p>
      <a href="${createLink}">Criar senha</a>
      <p>Se não abrir, copie o link:</p>
      <p>${createLink}</p>
    `,
    });
  }
}