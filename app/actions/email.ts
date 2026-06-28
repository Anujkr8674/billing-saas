"use server";

import nodemailer from "nodemailer";
import { generateQuotationPDF } from "@/lib/pdf-generator";
import { generateSurveyPDF } from "@/lib/survey-pdf-generator";
import { generateVehicleConditionPDF } from "@/lib/vehiclecondition-pdf-generator";

export async function sendQuotationEmail(quotation: any, userProfile: any, email: string) {
  if (!email) {
    throw new Error("No recipient email provided");
  }

  // In a real application, you would configure SMTP settings
  // from the database or environment variables.
  // We'll use a placeholder/standard env for now.
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "Company";
  const quotationNumber = quotation.docNumber || "QT";

  const d = quotation.details || {};
  const clientName = quotation.clientName || d.partyName || "Customer";
  const moveFromCity = d.moveFrom?.city || "N/A";
  const moveToCity = d.moveTo?.city || "N/A";
  const amount = Number(d.calculations?.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const companyPhone = pData.mobileNumber || userProfile?.mobile || "N/A";

  // Generate the PDF securely on the server!
  const pdfBase64 = await generateQuotationPDF(quotation, userProfile);
  const base64Data = pdfBase64.split("base64,")[1];

  const mailOptions = {
    from: `"${companyName}" <${process.env.SMTP_USER || "no-reply@example.com"}>`,
    to: email,
    subject: `📋 Your Quotation (${quotationNumber}) — ${companyName}`,
    text: `Dear ${clientName},\n\nYour Quotation has been prepared and approved by ${companyName}. Please find the details below.\n\nDocument No: ${quotationNumber}\nMoving From: ${moveFromCity}\nMoving To: ${moveToCity}\nAmount: Rs. ${amount}\n\nThank you,\n${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Your Quotation is Ready!</h1>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${quotationNumber}</strong></p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
          <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${clientName}</strong>,</p>
          <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
            Your <strong style="color: #5b21b6;">Quotation</strong> has been prepared and approved by <strong>${companyName}</strong>. Please find the attached PDF document for complete details.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Document Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Document No.</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${quotationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Type</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">Quotation</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Moving From</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${moveFromCity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Moving To</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${moveToCity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount</td>
                <td style="padding: 8px 0; font-weight: bold; color: #5b21b6;">₹${amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Contact</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${companyPhone}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
            For any queries, call us at <strong style="color: #5b21b6;">${companyPhone}</strong> — available 24 × 7.
          </p>
        </div>

        <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Quotation_${quotationNumber}.pdf`,
        content: base64Data,
        encoding: "base64",
      },
    ],
  };

  try {
    // If SMTP_USER is not set, we'll just log it to avoid crashing if user hasn't configured emails yet.
    if (!process.env.SMTP_USER) {
      console.log("Email Simulation: SMTP not configured. Would send Email to:", email);
      return { success: true, simulated: true };
    }
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}

export async function sendSurveyEmail(survey: any, userProfile: any, email: string) {
  if (!email) {
    throw new Error("No recipient email provided");
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "Company";
  const docNumber = survey.docNumber || "SRV";

  const d = survey.details || {};
  const clientName = survey.clientName || d.customerName || "Customer";
  const fromCity = d.fromAddress || "N/A";
  const toCity = d.toAddress || "N/A";
  const companyPhone = pData.mobileNumber || userProfile?.mobile || "N/A";

  const pdfBase64 = await generateSurveyPDF(survey, userProfile);
  const base64Data = pdfBase64.split("base64,")[1];

  const mailOptions = {
    from: `"${companyName}" <${process.env.SMTP_USER || "no-reply@example.com"}>`,
    to: email,
    subject: `📋 Your Survey Document (${docNumber}) — ${companyName}`,
    text: `Dear ${clientName},\n\nYour Survey Document has been prepared by ${companyName}. Please find the details attached.\n\nDocument No: ${docNumber}\nMoving From: ${fromCity}\nMoving To: ${toCity}\n\nThank you,\n${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Your Survey Document is Ready!</h1>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${docNumber}</strong></p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
          <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${clientName}</strong>,</p>
          <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
            Your <strong style="color: #5b21b6;">Survey Document</strong> has been prepared by <strong>${companyName}</strong>. Please find the attached PDF document for complete details regarding your requested move.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Document Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Document No.</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Type</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">Survey Document</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Moving From</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${fromCity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Moving To</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${toCity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Contact</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${companyPhone}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
            For any queries, call us at <strong style="color: #5b21b6;">${companyPhone}</strong> — available 24 × 7.
          </p>
        </div>

        <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Survey_${docNumber}.pdf`,
        content: base64Data,
        encoding: "base64",
      },
    ],
  };

  try {
    if (!process.env.SMTP_USER) {
      console.log("Email Simulation: SMTP not configured. Would send Email to:", email);
      return { success: true, simulated: true };
    }
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}

export async function sendInvoiceEmail(invoice: any, userProfile: any, email: string) {
  if (!email) {
    throw new Error("No recipient email provided");
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const transporter = (await import("nodemailer")).default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const { generateInvoicePDF } = await import("@/lib/invoice-pdf-generator");

  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "Company";
  const docNumber = invoice.docNumber || "INV";

  const d = invoice.details || {};
  const clientName = invoice.clientName || d.customerName || "Customer";
  const fromCity = d.fromCity || "N/A";
  const toCity = d.toCity || "N/A";
  const companyPhone = pData.mobileNumber || userProfile?.mobile || "N/A";
  const amount = Number(d.calculations?.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pdfBase64 = await generateInvoicePDF(invoice, userProfile);
  const base64Data = pdfBase64.split("base64,")[1];

  const mailOptions = {
    from: `"${companyName}" <${process.env.SMTP_USER || "no-reply@example.com"}>`,
    to: email,
    subject: `📋 Your GST Invoice (${docNumber}) — ${companyName}`,
    text: `Dear ${clientName},\n\nYour GST Invoice has been prepared by ${companyName}. Please find the details attached.\n\nDocument No: ${docNumber}\nMoving From: ${fromCity}\nMoving To: ${toCity}\nAmount: Rs. ${amount}\n\nThank you,\n${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Your Invoice is Ready!</h1>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${docNumber}</strong></p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
          <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${clientName}</strong>,</p>
          <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
            Your <strong style="color: #5b21b6;">GST Invoice</strong> has been prepared by <strong>${companyName}</strong>. Please find the attached PDF document for complete details.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Document Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Document No.</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Type</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">GST Invoice</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount</td>
                <td style="padding: 8px 0; font-weight: bold; color: #5b21b6;">₹${amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Contact</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${companyPhone}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
            For any queries, call us at <strong style="color: #5b21b6;">${companyPhone}</strong> — available 24 × 7.
          </p>
        </div>

        <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Invoice_${docNumber}.pdf`,
        content: base64Data,
        encoding: "base64",
      },
    ],
  };

  try {
    if (!process.env.SMTP_USER) {
      console.log("Email Simulation: SMTP not configured. Would send Email to:", email);
      return { success: true, simulated: true };
    }
    
    const nodemailerTransporter = (await import("nodemailer")).default.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await nodemailerTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}

export async function sendLoadingSlipEmail(loadingSlip: any, userProfile: any, email: string) {
  if (!email) {
    throw new Error("No recipient email provided");
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const transporter = (await import("nodemailer")).default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const { generateLoadingSlipPDF } = await import("@/lib/loadingslip-pdf-generator");

  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "Company";
  const docNumber = loadingSlip.docNumber || "LS";

  const d = loadingSlip.details || {};
  const ownerName = d.ownerName || "Customer";
  const fromCity = d.fromCity || "N/A";
  const toCity = d.toCity || "N/A";
  const companyPhone = pData.mobileNumber || userProfile?.mobile || "N/A";

  const pdfBase64 = await generateLoadingSlipPDF(loadingSlip, userProfile);
  const base64Data = pdfBase64.split("base64,")[1];

  const mailOptions = {
    from: `"${companyName}" <${process.env.SMTP_USER || "no-reply@example.com"}>`,
    to: email,
    subject: `📋 Your Loading Slip (${docNumber}) — ${companyName}`,
    text: `Dear ${ownerName},\n\nYour Loading Slip has been generated by ${companyName}. Please find the details attached.\n\nDocument No: ${docNumber}\nMoving From: ${fromCity}\nMoving To: ${toCity}\n\nThank you,\n${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Your Loading Slip is Ready!</h1>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${docNumber}</strong></p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
          <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${ownerName}</strong>,</p>
          <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
            Your <strong style="color: #5b21b6;">Loading Slip</strong> has been prepared by <strong>${companyName}</strong>. Please find the attached PDF document for complete details.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Document Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Document No.</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Type</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">Loading Slip</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Moving From</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${fromCity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Moving To</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${toCity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Contact</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${companyPhone}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
            For any queries, call us at <strong style="color: #5b21b6;">${companyPhone}</strong> — available 24 × 7.
          </p>
        </div>

        <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `LoadingSlip_${docNumber}.pdf`,
        content: base64Data,
        encoding: "base64",
      },
    ],
  };

  try {
    if (!process.env.SMTP_USER) {
      console.log("Email Simulation: SMTP not configured. Would send Email to:", email);
      return { success: true, simulated: true };
    }
    
    const nodemailerTransporter = (await import("nodemailer")).default.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await nodemailerTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}

export async function sendLorryReceiptEmail(lorryReceipt: any, userProfile: any, email: string) {
  const d = lorryReceipt.details || {};
  const ownerName = d.consignorName || lorryReceipt.consignor || "Valued Customer";
  const docNumber = lorryReceipt.docNumber;
  const companyName = userProfile?.profile?.companyName || "Your Company";
  const companyPhone = userProfile?.profile?.mobileNumber || "your phone number";
  const fromCity = d.fromCity || "Origin";
  const toCity = d.toCity || "Destination";

  try {
    const { generateLorryReceiptPDF } = await import("@/lib/lorryreceipt-pdf-generator");
    const pdfBlob = await generateLorryReceiptPDF(lorryReceipt, userProfile);
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const mailOptions = {
      from: `"${companyName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `Lorry Receipt - ${docNumber} from ${companyName}`,
      text: `Dear ${ownerName},\n\nYour Lorry Receipt has been generated by ${companyName}. Please find the details attached.\n\nDocument No: ${docNumber}\nMoving From: ${fromCity}\nMoving To: ${toCity}\n\nThank you,\n${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Your Lorry Receipt is Ready!</h1>
            <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${docNumber}</strong></p>
          </div>
          
          <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
            <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${ownerName}</strong>,</p>
            <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
              Your <strong style="color: #5b21b6;">Lorry Receipt</strong> has been prepared by <strong>${companyName}</strong>. Please find the attached PDF document for complete details.
            </p>

            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Document Details</h3>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Document Date:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${new Date(lorryReceipt.date).toLocaleDateString("en-IN")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">From:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${fromCity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">To:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${toCity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Total Charges:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${Number(d.totalCharges || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                </tr>
              </table>
            </div>

            <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
              For any queries, call us at <strong style="color: #5b21b6;">${companyPhone}</strong> — available 24 × 7.
            </p>
          </div>

          <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
            © ${new Date().getFullYear()} ${companyName}. All rights reserved.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `LR_${docNumber}.pdf`,
          content: base64Data,
          encoding: "base64",
        },
      ],
    };

    if (!process.env.SMTP_USER) {
      console.log("Email Simulation: SMTP not configured. Would send LR Email to:", email);
      return { success: true, simulated: true };
    }
    
    const nodemailerTransporter = (await import("nodemailer")).default.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await nodemailerTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send LR email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}

export async function sendPackingListEmail(packingList: any, userProfile: any, email: string) {
  const d = packingList.details || {};
  const customerName = d.customerName || packingList.clientName || "Valued Customer";
  const docNumber = packingList.docNumber;
  const companyName = userProfile?.profile?.companyName || "Your Company";
  const companyPhone = userProfile?.profile?.mobileNumber || "your phone number";
  const fromCity = d.fromCity || "Origin";
  const toCity = d.toCity || "Destination";

  try {
    const { generatePackingListPDF } = await import("@/lib/packinglist-pdf-generator");
    const pdfBlob = await generatePackingListPDF(packingList, userProfile);
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const mailOptions = {
      from: `"${companyName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `Packing List - ${docNumber} from ${companyName}`,
      text: `Dear ${customerName},\n\nYour Packing List has been generated by ${companyName}. Please find the details attached.\n\nDocument No: ${docNumber}\nMoving From: ${fromCity}\nMoving To: ${toCity}\n\nThank you,\n${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Your Packing List is Ready!</h1>
            <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${docNumber}</strong></p>
          </div>
          
          <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
            <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
            <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
              Your <strong style="color: #5b21b6;">Packing List</strong> has been prepared by <strong>${companyName}</strong>. Please find the attached PDF document for complete details.
            </p>

            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Document Details</h3>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Document Date:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${new Date(packingList.date).toLocaleDateString("en-IN")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">From:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${fromCity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">To:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${toCity}</td>
                </tr>
              </table>
            </div>

            <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
              For any queries, call us at <strong style="color: #5b21b6;">${companyPhone}</strong> — available 24 × 7.
            </p>
          </div>

          <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
            © ${new Date().getFullYear()} ${companyName}. All rights reserved.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `PackingList_${docNumber}.pdf`,
          content: base64Data,
          encoding: "base64",
        },
      ],
    };

    if (!process.env.SMTP_USER) {
      console.log("Email Simulation: SMTP not configured. Would send Packing List Email to:", email);
      return { success: true, simulated: true };
    }
    
    const nodemailerTransporter = (await import("nodemailer")).default.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await nodemailerTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send Packing List email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}



export async function sendPaymentVoucherEmail(voucher: any, userProfile: any, email: string) {
  if (!email) {
    throw new Error("No recipient email provided");
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const transporter = (await import("nodemailer")).default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const { generatePaymentVoucherPDF } = await import("@/lib/paymentvoucher-pdf-generator");

  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "Company";
  const companyPhone = pData.mobileNumber || "";

  const d = voucher.details || {};
  const paidTo = voucher.paidTo || "Vendor";
  const docNumber = voucher.docNumber || "";
  const amount = voucher.amount || 0;
  const paymentMode = d.paymentMode || "Cash";

  const pdfBlob = await generatePaymentVoucherPDF(voucher, userProfile);
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  const mailOptions = {
    from: `"${companyName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `💸 Payment Voucher (${docNumber}) — ${companyName}`,
    text: `Dear ${paidTo},\n\nA payment voucher has been generated by ${companyName} for the amount of ₹${amount}. Please find the details attached.\n\nDocument No: ${docNumber}\nPayment Mode: ${paymentMode}\n\nThank you,\n${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Payment Voucher Generated</h1>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${docNumber}</strong></p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
          <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${paidTo}</strong>,</p>
          <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
            A <strong style="color: #5b21b6;">Payment Voucher</strong> has been generated by <strong>${companyName}</strong>. Please find the attached PDF document for complete details.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Transaction Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Document No.</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Mode</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${paymentMode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Contact</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${companyPhone}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
            For any queries, call us at <strong style="color: #5b21b6;">${companyPhone}</strong> — available 24 × 7.
          </p>
        </div>

        <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `PaymentVoucher_${docNumber}.pdf`,
        content: base64Data,
        encoding: "base64",
      },
    ],
  };

  try {
    if (!process.env.SMTP_USER) {
      console.log("Email Simulation: SMTP not configured. Would send Email to:", email);
      return { success: true, simulated: true };
    }
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}


export async function sendMoneyReceiptEmail(receipt: any, userProfile: any, email: string) {
  try {
    const { generateMoneyReceiptPDF } = await import("@/lib/moneyreceipt-pdf-generator");
    const pdfBlob = await generateMoneyReceiptPDF(receipt, userProfile);
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!process.env.SMTP_USER) {
      console.log("Email Simulation: SMTP not configured. Would send Email to:", email);
      return { success: true, simulated: true };
    }

    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const companyName = userProfile?.profile?.companyName || "Our Company";

    const mailOptions = {
      from: `"${companyName}" <${process.env.SMTP_USER || "no-reply@example.com"}>`,
      to: email,
      subject: `💸 Money Receipt (${receipt.docNumber}) — ${companyName}`,
      text: `Dear ${receipt.receivedFrom || 'Customer'},\n\nA money receipt has been generated by ${companyName} for the amount of ₹${receipt.amount || 0}. Please find the details attached.\n\nDocument No: ${receipt.docNumber}\nPayment Mode: ${receipt.details?.paymentMode || 'Cash'}\n\nThank you,\n${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Money Receipt Generated</h1>
            <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${receipt.docNumber}</strong></p>
          </div>
          
          <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
            <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${receipt.receivedFrom || 'Customer'}</strong>,</p>
            <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
              A <strong style="color: #5b21b6;">Money Receipt</strong> has been generated by <strong>${companyName}</strong>. Please find the attached PDF document for complete details.
            </p>

            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Transaction Details</h3>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 40%;">Document No.</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #111827;">${receipt.docNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Amount</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #111827;">₹${(receipt.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Payment Mode</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #111827;">${receipt.details?.paymentMode || 'Cash'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Contact</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #111827;">${userProfile?.profile?.mobileNumber || ''}</td>
                </tr>
              </table>
            </div>

            <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
              For any queries, call us at <strong style="color: #5b21b6;">${userProfile?.profile?.mobileNumber || ''}</strong> — available 24 × 7.
            </p>
          </div>

          <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
            © ${new Date().getFullYear()} ${companyName}. All rights reserved.
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `MoneyReceipt_${receipt.docNumber}.pdf`,
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

export async function sendNOCEmail(noc: any, userProfile: any, email: string) {
  if (!email) {
    throw new Error("No recipient email provided");
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const transporter = (await import("nodemailer")).default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const { generateNOCFormPDF } = await import("@/lib/noc-pdf-generator");

  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "Company";
  const companyPhone = pData.mobileNumber || "";

  const d = noc.details || {};
  const clientName = noc.clientName || "Client";
  const docNumber = noc.docNumber || "";
  const nocType = d.nocType || "NOC";

  const pdfBlob = await generateNOCFormPDF(noc, userProfile);
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  const mailOptions = {
    from: `"${companyName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `📄 NO OBJECTION CERTIFICATE (${docNumber}) — ${companyName}`,
    text: `Dear ${clientName},\n\nA No Objection Certificate has been generated by ${companyName}. Please find the details attached.\n\nDocument No: ${docNumber}\nNOC Type: ${nocType}\n\nThank you,\n${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">NOC Generated</h1>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${docNumber}</strong></p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
          <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${clientName}</strong>,</p>
          <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
            A <strong style="color: #0f172a;">No Objection Certificate (${nocType})</strong> has been generated by <strong>${companyName}</strong>. Please find the attached PDF document for complete details.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 15px; font-size: 12px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">Document Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 40%;">Document No.</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">NOC Type</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${nocType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Contact</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${companyPhone}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 25px 0 0; font-size: 12px; color: #64748b; text-align: center;">
            For any queries, call us at <strong style="color: #0f172a;">${companyPhone}</strong> — available 24 × 7.
          </p>
        </div>

        <div style="background-color: #0f172a; padding: 15px; text-align: center; color: white; font-size: 12px;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `NOC_${docNumber}.pdf`,
        content: base64Data,
        encoding: 'base64'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send NOC email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}

export async function sendVehicleConditionEmail(doc: any, userProfile: any, email: string) {
  if (!email) {
    throw new Error("No recipient email provided");
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const pData = userProfile?.profile || {};
  const companyName = pData.companyName || "Company";
  const docNumber = doc.docNumber || "VC-Auto Generated";

  const d = doc.details || {};
  const partyName = d.partyName || "Customer";
  const companyPhone = pData.mobileNumber || userProfile?.mobile || "N/A";
  const vehicleNo = d.vehicleRegNo || "N/A";

  const pdfBase64 = await generateVehicleConditionPDF(doc, userProfile);
  const base64Data = pdfBase64.split("base64,")[1];

  const mailOptions = {
    from: `"${companyName}" <${process.env.SMTP_USER || "no-reply@example.com"}>`,
    to: email,
    subject: `📋 Vehicle Condition Report (${docNumber}) — ${companyName}`,
    text: `Dear ${partyName},\n\nYour Vehicle Condition Report has been prepared by ${companyName}. Please find the details below.\n\nDocument No: ${docNumber}\nVehicle No: ${vehicleNo}\n\nThank you,\n${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #5b21b6; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Vehicle Condition Report</h1>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Document No: <strong>${docNumber}</strong></p>
        </div>
        
        <div style="padding: 30px 20px; background-color: #ffffff; color: #333333;">
          <p style="margin: 0 0 15px; font-size: 16px;">Dear <strong>${partyName}</strong>,</p>
          <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.5; color: #555555;">
            Your <strong style="color: #5b21b6;">Vehicle Condition Report</strong> has been prepared by <strong>${companyName}</strong>. Please find the attached PDF document for complete details regarding the vehicle's condition and accessories.
          </p>

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 15px; font-size: 12px; color: #5b21b6; text-transform: uppercase; letter-spacing: 1px;">Document Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Document No.</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Vehicle No.</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${vehicleNo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${new Date(doc.date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Contact</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${companyPhone}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 25px 0 0; font-size: 12px; color: #6b7280; text-align: center;">
            For any queries, call us at <strong style="color: #5b21b6;">${companyPhone}</strong> — available 24 × 7.
          </p>
        </div>

        <div style="background-color: #5b21b6; padding: 15px; text-align: center; color: white; font-size: 12px;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `VehicleCondition_${docNumber}.pdf`,
        content: base64Data,
        encoding: 'base64'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send Vehicle Condition email:", error);
    throw new Error(`Email sending failed: ${(error as Error).message}`);
  }
}

