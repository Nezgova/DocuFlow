import { BookOpen, FileText, CheckCircle2, Bookmark, Hash, Layers, Building2, Bell, BarChart3, Clock3, PenLine, ShieldCheck } from 'lucide-react'

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div>
        <p className="font-mono text-xs uppercase tracking-[.14em] text-moss">Documentation & Help</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">DocuFlow User Guide</h1>
        <p className="mt-2 text-sm text-ink/60">Learn how to navigate workflows, manage documents, use analytics, and leverage advanced features.</p>
      </div>

      <div className="grid gap-6">
        {/* Section 1 */}
        <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-moss">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">1. Dashboard & Analytics</h2>
              <p className="text-xs text-ink/50">Operations overview and real-time metrics</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-ink/75 space-y-2 leading-relaxed">
            <p>The <strong>Overview</strong> page is your central command center. It provides live metric cards showing:</p>
            <ul className="list-disc pl-5 space-y-1 text-ink/70">
              <li><strong>Pending review:</strong> Documents awaiting reviewer decisions.</li>
              <li><strong>In workflow / Total:</strong> Documents accessible within your permissions.</li>
              <li><strong>Ready to sign:</strong> Documents where all reviews are complete and awaiting final signature.</li>
              <li><strong>Signed / Completed:</strong> Successfully finalized and archived documents.</li>
              <li><strong>Approval Rate & Avg Approval Time:</strong> Performance statistics for your workflows.</li>
              <li><strong>Category & Department Breakdown:</strong> Visual distribution of documents across your organization.</li>
            </ul>
          </div>
        </article>

        {/* Section 2 */}
        <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-moss">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">2. Document Workflows & Approvals</h2>
              <p className="text-xs text-ink/50">Upload, review, approve, and sign</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-ink/75 space-y-2 leading-relaxed">
            <p><strong>Uploading:</strong> Click "Upload document" (or "Upload PDF"), select a PDF file, fill in the title, description, priority (Low, Normal, High, Urgent), due date, category, tags, and assign reviewers.</p>
            <p><strong>Review Decisions:</strong> Assigned reviewers can approve or reject documents. Once all reviewers approve, the document moves to <em>Ready for Signature</em> status.</p>
            <p><strong>Signing & Archiving:</strong> Authorized users can sign documents with cryptographic/simulated signature verification, finalizing them into the system archive.</p>
            <p><strong>Rejected Resubmission:</strong> If a document is rejected, owners can upload a new version or restart the workflow with change notes.</p>
          </div>
        </article>

        {/* Section 3 */}
        <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-moss">
              <Bookmark size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">3. Saved Filters</h2>
              <p className="text-xs text-ink/50">Save and quick-load favorite searches</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-ink/75 space-y-2 leading-relaxed">
            <p>When searching for documents on the <strong>Documents</strong> page using search terms, categories, tags, departments, or priorities:</p>
            <ul className="list-disc pl-5 space-y-1 text-ink/70">
              <li>Click <strong>"Save current filter"</strong> at the top right of the documents list.</li>
              <li>Give your filter a descriptive name (e.g., <em>"Urgent Finance Contracts"</em>).</li>
              <li>Your saved filter appears as a quick-load pill below the header. Click it anytime to instantly restore that exact search and filter state.</li>
            </ul>
          </div>
        </article>

        {/* Section 4 */}
        <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-moss">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">4. Categories, Tags & Departments</h2>
              <p className="text-xs text-ink/50">Organization and metadata management</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-ink/75 space-y-2 leading-relaxed">
            <ul className="list-disc pl-5 space-y-1 text-ink/70">
              <li><strong>Categories:</strong> Classify documents (Contracts, Invoices, Policies, Reports, etc.).</li>
              <li><strong>Tags:</strong> Add custom hashtags (e.g., <code className="bg-sand px-1.5 py-0.5 rounded text-xs">#urgent</code>, <code className="bg-sand px-1.5 py-0.5 rounded text-xs">#confidential</code>) for fast filtering.</li>
              <li><strong>Departments:</strong> Scope documents and users by company department (HR, Finance, Legal, IT, etc.).</li>
            </ul>
          </div>
        </article>

        {/* Section 5 */}
        <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-moss">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">5. Notifications & Version History</h2>
              <p className="text-xs text-ink/50">Stay updated and track revisions</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-ink/75 space-y-2 leading-relaxed">
            <p><strong>Notifications:</strong> The notification bell in the header alerts you in real time when you are assigned a review, when decisions are made, when comments are added, or when documents are signed.</p>
            <p><strong>Version History:</strong> Each document maintains a version timeline (<code className="bg-sand px-1.5 py-0.5 rounded text-xs">v1</code>, <code className="bg-sand px-1.5 py-0.5 rounded text-xs">v2</code>). You can upload new versions with change notes and preview historical PDFs directly in the document detail view.</p>
          </div>
        </article>
      </div>
    </div>
  )
}
