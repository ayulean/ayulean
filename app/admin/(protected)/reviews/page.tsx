import type { Metadata } from "next";
import Stars from "@/components/Stars";
import { addReviewAsAdminAction, deleteReviewAction, setReviewApprovalAction } from "@/lib/actions";
import { getAllReviews, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reviews", robots: { index: false } };

const field =
  "mt-1 w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([getAllReviews(), getProducts({ includeInactive: true })]);
  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-900">Reviews &amp; Ratings</h1>
      <p className="mt-1 text-sm text-ink/55">
        New reviews appear on the website only after they are approved. {pending.length} awaiting approval.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-lg font-bold text-brand-800">Pending ({pending.length})</h2>
            <div className="mt-3 space-y-3">
              {pending.length === 0 && (
                <p className="rounded-xl border border-dashed border-brand-200 p-8 text-center text-sm text-ink/50">
                  No reviews pending. 👍
                </p>
              )}
              {pending.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-brand-800">Live ({approved.length})</h2>
            <div className="mt-3 space-y-3">
              {approved.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-brand-800">Add a review yourself</h2>
          <p className="mt-1 text-xs text-ink/50">Use this to publish feedback you received offline.</p>

          <form action={addReviewAsAdminAction} className="mt-4 space-y-4">
            <label className="block text-sm font-medium">
              Product
              <select name="product_id" required className={field}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Customer name
                <input name="name" required className={field} />
              </label>
              <label className="text-sm font-medium">
                Rating
                <select name="rating" defaultValue="5" className={field}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} ★</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium">
              Title
              <input name="title" className={field} />
            </label>

            <label className="block text-sm font-medium">
              Review
              <textarea name="body" rows={4} required className={field} />
            </label>

            <button type="submit" className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">
              Add review
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

function ReviewCard({
  review: r,
}: {
  review: { id: number; name: string; rating: number; title: string; body: string; created_at: string; approved: boolean; product_name: string };
}) {
  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brand-800">{r.name}</p>
          <p className="text-xs text-ink/45">
            {r.product_name} · {new Date(r.created_at).toLocaleDateString("en-IN")}
          </p>
        </div>
        <Stars value={r.rating} size={15} />
      </div>

      {r.title && <h3 className="mt-3 font-medium text-ink/85">{r.title}</h3>}
      <p className="mt-1 text-sm leading-relaxed text-ink/70">{r.body}</p>

      <div className="mt-4 flex items-center gap-3">
        <form action={setReviewApprovalAction}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="approved" value={r.approved ? "0" : "1"} />
          <button
            type="submit"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              r.approved ? "border border-brand-300 text-brand-700 hover:bg-brand-50" : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {r.approved ? "Hide" : "Approve"}
          </button>
        </form>
        <form action={deleteReviewAction}>
          <input type="hidden" name="id" value={r.id} />
          <button type="submit" className="text-xs text-red-600 hover:underline">Delete</button>
        </form>
      </div>
    </article>
  );
}
