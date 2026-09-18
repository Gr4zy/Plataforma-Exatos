// Envio de e-mails transacionais via API do Brevo (antigo Sendinblue).
// Usa fetch nativo do Node (18+) - sem dependência extra.
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function enviarEmail({ destinatarioEmail, destinatarioNome, assunto, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY não está configurada no .env.');
  }

  const remetenteEmail = process.env.BREVO_SENDER_EMAIL || 'pibidplataforma@gmail.com';
  const remetenteNome = process.env.BREVO_SENDER_NAME || 'Plataforma Exatos';

  const resposta = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: remetenteNome, email: remetenteEmail },
      to: [{ email: destinatarioEmail, name: destinatarioNome || destinatarioEmail }],
      subject: assunto,
      htmlContent,
    }),
  });

  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => '');
    throw new Error(`Falha ao enviar e-mail pelo Brevo (HTTP ${resposta.status}): ${corpo}`);
  }

  return resposta.json();
}

// RF01 - recuperação de senha: envia o link de redefinição para o e-mail
// cadastrado do usuário.
async function enviarEmailRecuperacaoSenha({ email, nome, link }) {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; color:#333;">
      <h2 style="color:#0a4670;">Redefinição de senha</h2>
      <p>Olá${nome ? `, ${nome}` : ''}!</p>
      <p>Recebemos um pedido para redefinir a senha da sua conta na <strong>Plataforma Exatos</strong>.</p>
      <p style="margin: 24px 0;">
        <a href="${link}"
           style="background:#0b7cc7;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;">
          Redefinir minha senha
        </a>
      </p>
      <p>Esse link é válido por 1 hora. Se você não pediu essa alteração, apenas ignore este e-mail: sua senha atual continuará funcionando normalmente.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="font-size:12px;color:#888;">Plataforma Exatos - PIBID</p>
    </div>
  `;

  return enviarEmail({
    destinatarioEmail: email,
    destinatarioNome: nome,
    assunto: 'Redefinição de senha - Plataforma Exatos',
    htmlContent,
  });
}

module.exports = { enviarEmail, enviarEmailRecuperacaoSenha };
