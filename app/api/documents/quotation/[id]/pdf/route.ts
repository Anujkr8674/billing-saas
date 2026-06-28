import { NextRequest, NextResponse } from "next/server";
import { getQuotationById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { generateQuotationPDF } from "@/lib/pdf-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getUserProfile();
    const quotation = await getQuotationById(id);

    if (!quotation) {
      return new NextResponse("Quotation not found", { status: 404 });
    }

    const base64Pdf = await generateQuotationPDF(quotation, profile);
    const pdfBuffer = Buffer.from(base64Pdf.split(",")[1], "base64");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Quotation_${quotation.docNumber || id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return new NextResponse(`Internal Server Error: ${error.message || error}`, { status: 500 });
  }
}
