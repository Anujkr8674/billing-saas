import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User as UserIcon, Building, CreditCard, FileText, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUserProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      subscription: {
        include: {
          plan: true
        }
      },
      _count: {
        select: {
          surveys: true,
          quotations: true,
          invoices: true,
          loadingSlips: true,
          lorryReceipts: true,
          packingLists: true,
          paymentVouchers: true,
          moneyReceipts: true,
          vehicleConditions: true,
          nocForms: true,
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const planName = user.subscription?.plan?.name || "No Plan";
  const isActive = user.subscription?.isActive;
  
  const totalDocs = Object.values(user._count).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard/users" className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Details</h1>
          <p className="text-muted-foreground mt-1 text-sm">Detailed profile and activity for {user.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <UserIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile Number</p>
              <p className="font-medium text-foreground">{user.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verification Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                {user.isVerified ? (
                  <><CheckCircle className="w-4 h-4 text-success" /> <span className="text-sm font-medium text-success">Verified</span></>
                ) : (
                  <><XCircle className="w-4 h-4 text-warning" /> <span className="text-sm font-medium text-warning">Unverified</span></>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined Date</p>
              <p className="font-medium text-foreground">{user.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Subscription</h2>
          </div>
          <div className="space-y-4">
             <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <div className="mt-1">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                    {planName}
                  </span>
                </div>
             </div>
             <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
             </div>
             {user.subscription && (
               <>
                 <div>
                   <p className="text-sm text-muted-foreground">Start Date</p>
                   <p className="font-medium text-foreground text-sm">{user.subscription.startDate.toLocaleDateString()}</p>
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">End Date</p>
                   <p className="font-medium text-foreground text-sm">{user.subscription.endDate.toLocaleDateString()}</p>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Company / Profile Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Business Profile</h2>
          </div>
          {user.profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium text-foreground">{user.profile.companyName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company Code</p>
                <p className="font-medium text-foreground">{user.profile.companyCode || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Owner Name</p>
                <p className="font-medium text-foreground">{user.profile.ownerName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Email</p>
                <p className="font-medium text-foreground">{user.profile.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Mobile</p>
                <p className="font-medium text-foreground">{user.profile.mobileNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GST Number</p>
                <p className="font-medium text-foreground uppercase">{user.profile.gstNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PAN Card Number</p>
                <p className="font-medium text-foreground uppercase">{user.profile.panCardNumber || "N/A"}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3 mt-2 border-t pt-4">
                <p className="text-sm text-muted-foreground mb-1">Business Address</p>
                <p className="font-medium text-foreground">
                  {user.profile.addressLine1 ? (
                    <>
                      {user.profile.addressLine1}
                      {user.profile.addressLine2 && <>, {user.profile.addressLine2}</>}
                      <br/>
                      {user.profile.city}, {user.profile.state} - {user.profile.pincode}
                      <br/>
                      {user.profile.country}
                    </>
                  ) : user.profile.address ? (
                    user.profile.address
                  ) : "N/A"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No business profile setup yet.</p>
          )}
        </div>

        {/* Document Stats */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Usage Stats</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="font-bold text-foreground">{totalDocs}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Invoices</p>
              <p className="font-medium text-foreground">{user._count.invoices}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Quotations</p>
              <p className="font-medium text-foreground">{user._count.quotations}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Lorry Receipts</p>
              <p className="font-medium text-foreground">{user._count.lorryReceipts}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Loading Slips</p>
              <p className="font-medium text-foreground">{user._count.loadingSlips}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">Other documents available in user data.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
