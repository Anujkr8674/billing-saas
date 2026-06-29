import prisma from "@/lib/prisma";
import ReadMoreText from "@/components/ReadMoreText";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card py-3 px-4 sm:py-4 sm:px-6 rounded-xl shadow-sm border border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Contact Messages</h1>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No contact messages yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name & Contact</th>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Message</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{msg.firstName} {msg.lastName}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                      </div>
                      {msg.contactNo && (
                        <div className="text-sm text-muted-foreground mt-1">{msg.contactNo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {msg.subject || "General Inquiry"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ReadMoreText text={msg.message} maxLength={60} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString("en-US", { 
                        month: "short", 
                        day: "numeric", 
                        year: "numeric", 
                        hour: "numeric", 
                        minute: "2-digit" 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
