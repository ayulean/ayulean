"use client";

export function PrintButton() {
  return (
    <div className="no-print mb-6 flex gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Print / Save as PDF
      </button>
      <button
        type="button"
        onClick={() => history.back()}
        className="rounded-full border border-brand-300 px-6 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        Back
      </button>
    </div>
  );
}

export default PrintButton;
