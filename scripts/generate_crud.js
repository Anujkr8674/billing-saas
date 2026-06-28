const fs = require('fs');
const path = require('path');

const models = [
  { slug: 'surveys', singular: 'Survey', actionSuffix: 'Survey', fields: [{ name: 'clientName', label: 'Client Name', type: 'text' }] },
  { slug: 'quotations', singular: 'Quotation', actionSuffix: 'Quotation', fields: [{ name: 'clientName', label: 'Client Name', type: 'text' }, { name: 'totalAmount', label: 'Amount (₹)', type: 'number' }] },
  { slug: 'loading-slips', singular: 'Loading Slip', actionSuffix: 'LoadingSlip', fields: [{ name: 'vehicleNo', label: 'Vehicle No', type: 'text' }, { name: 'driverName', label: 'Driver Name', type: 'text' }] },
  { slug: 'lorry-receipts', singular: 'Lorry Receipt', actionSuffix: 'LorryReceipt', fields: [{ name: 'consignor', label: 'Consignor', type: 'text' }, { name: 'consignee', label: 'Consignee', type: 'text' }] },
  { slug: 'packing-lists', singular: 'Packing List', actionSuffix: 'PackingList', fields: [{ name: 'referenceNo', label: 'Reference No', type: 'text' }] },
  { slug: 'payment-vouchers', singular: 'Payment Voucher', actionSuffix: 'PaymentVoucher', fields: [{ name: 'paidTo', label: 'Paid To', type: 'text' }, { name: 'amount', label: 'Amount (₹)', type: 'number' }] },
  { slug: 'money-receipts', singular: 'Money Receipt', actionSuffix: 'MoneyReceipt', fields: [{ name: 'receivedFrom', label: 'Received From', type: 'text' }, { name: 'amount', label: 'Amount (₹)', type: 'number' }] },
  { slug: 'vehicle-conditions', singular: 'Vehicle Condition', actionSuffix: 'VehicleCondition', fields: [{ name: 'vehicleNo', label: 'Vehicle No', type: 'text' }] },
  { slug: 'noc-forms', singular: 'NOC Form', actionSuffix: 'NOCForm', fields: [{ name: 'clientName', label: 'Client Name', type: 'text' }] }
];

const basePath = path.join(__dirname, '../app/user');

models.forEach(model => {
  const newDir = path.join(basePath, model.slug, 'new');
  const idDir = path.join(basePath, model.slug, '[id]');
  
  fs.mkdirSync(newDir, { recursive: true });
  fs.mkdirSync(idDir, { recursive: true });

  // 1. Generate new/page.tsx
  const stateHooks = model.fields.map(f => `  const [${f.name}, set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}] = useState("");`).join('\n');
  const submitFields = model.fields.map(f => `      ${f.name},`).join('\n');
  const inputs = model.fields.map(f => `
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">${f.label}</label>
            <input required value={${f.name}} onChange={e=>set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}(e.target.value)} type="${f.type}" className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>`).join('');

  const newPage = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { create${model.actionSuffix} } from "@/app/actions/documents";

export default function New${model.actionSuffix}Page() {
  const router = useRouter();
${stateHooks}
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await create${model.actionSuffix}({
${submitFields}
      date: new Date(),
      details: []
    });
    router.push("/user/${model.slug}");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Create ${model.singular}</h1>
        <button onClick={() => router.push("/user/${model.slug}")} className="text-sm text-muted-foreground hover:text-foreground">Back to List</button>
      </div>
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
${inputs}
          <button disabled={loading} type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? "Saving..." : "Save Document"}
          </button>
        </form>
      </div>
    </div>
  );
}`;

  fs.writeFileSync(path.join(newDir, 'page.tsx'), newPage);

  // 2. Generate [id]/page.tsx
  const effectSets = model.fields.map(f => `        set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}(data.${f.name}${f.type === 'number' ? '.toString()' : ''});`).join('\n');
  
  const editPage = `"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { get${model.actionSuffix}ById, update${model.actionSuffix} } from "@/app/actions/documents";

export default function Edit${model.actionSuffix}Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
${stateHooks}
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get${model.actionSuffix}ById(id).then(data => {
      if (data) {
${effectSets}
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await update${model.actionSuffix}(id, {
${submitFields}
      date: new Date(),
      details: []
    });
    router.push("/user/${model.slug}");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Edit ${model.singular}</h1>
        <button onClick={() => router.push("/user/${model.slug}")} className="text-sm text-muted-foreground hover:text-foreground">Back to List</button>
      </div>
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
${inputs}
          <button disabled={saving} type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Update Document"}
          </button>
        </form>
      </div>
    </div>
  );
}`;

  fs.writeFileSync(path.join(idDir, 'page.tsx'), editPage);

  // 3. Update existing list page to use links instead of modals
  const listPagePath = path.join(basePath, model.slug, 'page.tsx');
  if (fs.existsSync(listPagePath)) {
    let content = fs.readFileSync(listPagePath, 'utf8');
    
    // Remove modal state and references
    content = content.replace(/const \[isModalOpen, setIsModalOpen\] = useState\(false\);\n/, '');
    content = content.replace(/setIsModalOpen\(false\);\n/g, '');
    
    if (!content.includes('import Link')) {
      content = content.replace('import { useState', 'import Link from "next/link";\nimport { useState');
    }
    
    if (content.includes('lucide-react')) {
       content = content.replace(/import \{ (.*?) \} from "lucide-react";/, (match, p1) => {
         const parts = p1.split(',').map(s=>s.trim()).filter(s => s !== 'Edit' && s !== 'X');
         parts.push('Edit');
         return `import { ${parts.join(', ')} } from "lucide-react";`;
       });
    }

    content = content.replace(
      /<button onClick=\{\(\) => setIsModalOpen\(true\)\}(.*?)>([\s\S]*?)<\/button>/,
      `<Link href="/user/${model.slug}/new"$1>$2</Link>`
    );

    // Use /s flag for multiline match
    content = content.replace(
      /(<button onClick=\{\(\) => handleDelete[^>]*>[\s\S]*?<\/button>)/s,
      `<Link href={\`/user/${model.slug}/\${item.id}\`} className="text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                      <Edit className="w-5 h-5" />
                    </Link>
                    $1`
    );

    // Remove the entire Modal section at the bottom (between {isModalOpen && ( and )} )
    content = content.replace(/\{isModalOpen && \([\s\S]*?\)\}\n/, '');

    fs.writeFileSync(listPagePath, content);
  }
});
