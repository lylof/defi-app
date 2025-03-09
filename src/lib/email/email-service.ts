/**
 * Service d'envoi d'emails
 * Note: Dans un environnement de production, vous devriez utiliser un service d'email comme SendGrid, Mailgun, etc.
 * Pour ce projet, nous simulerons l'envoi d'emails en les loggant dans la console.
 */
export class EmailService {
  /**
   * Envoie un email de réinitialisation de mot de passe
   * @param to Adresse email du destinataire
   * @param resetToken Token de réinitialisation
   * @param resetUrl URL de base pour la réinitialisation
   */
  static async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    resetUrl: string
  ): Promise<void> {
    const fullResetUrl = `${resetUrl}?token=${resetToken}`;
    
    // En production, remplacez ce code par l'appel à votre service d'email
    console.log(`
      ========== EMAIL DE RÉINITIALISATION DE MOT DE PASSE ==========
      À: ${to}
      Sujet: Réinitialisation de votre mot de passe
      
      Bonjour,
      
      Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe:
      
      ${fullResetUrl}
      
      Ce lien expirera dans 24 heures.
      
      Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
      
      Cordialement,
      L'équipe LPT Défis
      ============================================================
    `);
    
    // Pour un environnement de production, vous pourriez utiliser un code comme celui-ci:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe:</p>
        <p><a href="${fullResetUrl}">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe LPT Défis</p>
      `,
    });
    */
  }

  /**
   * Envoie un email de vérification d'email
   * @param to Adresse email du destinataire
   * @param verificationToken Token de vérification
   * @param verificationUrl URL de base pour la vérification
   */
  static async sendEmailVerificationEmail(
    to: string,
    verificationToken: string,
    verificationUrl: string
  ): Promise<void> {
    const fullVerificationUrl = `${verificationUrl}?token=${verificationToken}`;
    
    // En production, remplacez ce code par l'appel à votre service d'email
    console.log(`
      ========== EMAIL DE VÉRIFICATION D'EMAIL ==========
      À: ${to}
      Sujet: Vérification de votre adresse email
      
      Bonjour,
      
      Merci de vous être inscrit sur LPT Défis. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email:
      
      ${fullVerificationUrl}
      
      Ce lien expirera dans 24 heures.
      
      Si vous n'avez pas créé de compte sur notre plateforme, veuillez ignorer cet email.
      
      Cordialement,
      L'équipe LPT Défis
      ============================================================
    `);
    
    // Pour un environnement de production, vous pourriez utiliser un code comme celui-ci:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Vérification de votre adresse email',
      html: `
        <h1>Vérification d'email</h1>
        <p>Bonjour,</p>
        <p>Merci de vous être inscrit sur LPT Défis. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email:</p>
        <p><a href="${fullVerificationUrl}">Vérifier mon adresse email</a></p>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Si vous n'avez pas créé de compte sur notre plateforme, veuillez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe LPT Défis</p>
      `,
    });
    */
  }
} 