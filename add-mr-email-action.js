const fs = require('fs');
const file = 'd:/Nextgen/billing-software/app/actions/email.ts';

let content = fs.readFileSync(file, 'utf8');

const newCode = `

export async function sendMoneyReceiptEmail(receipt: any, userProfile: any, email: string) {
  try {
    const { generateMoneyReceiptPDF } = await import("@/lib/moneyreceipt-pdf-generator");
    const pdfBlob = await generateMoneyReceiptPDF(receipt, userProfile);
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const companyName = userProfile?.profile?.companyName || "Our Company";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: \`Money Receipt from \${companyName}\`,
      text: \`Dear \${receipt.receivedFrom || 'Customer'},\n\nPlease find attached your Money Receipt (\${receipt.docNumber}).\n\nThank you for your business.\n\nRegards,\n\${companyName}\`,
      attachments: [
        {
          filename: \`MoneyReceipt_\${receipt.docNumber}.pdf\`,
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending money receipt email:", error);
    throw new Error("Failed to send email");
  }
}
`;

if (!content.includes('sendMoneyReceiptEmail')) {
  fs.appendFileSync(file, newCode);
  console.log('sendMoneyReceiptEmail added');
} else {
  console.log('sendMoneyReceiptEmail already exists');
}
