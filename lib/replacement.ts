import type { ReplacementStatus } from "./types";
import { SITE } from "./site";

/**
 * How each replacement status is described to the customer.
 * The raw database words ("open", "rejected") are for us, not for them.
 */
export const REPLACEMENT_STATUS: Record<
  ReplacementStatus,
  { label: string; detail: string; tone: "pending" | "good" | "bad" }
> = {
  open: {
    label: "Under review",
    detail: `Our team is checking your request and will call you on ${SITE.phone} within 24 working hours.`,
    tone: "pending",
  },
  approved: {
    label: "Approved",
    detail:
      "Your replacement has been approved. We are arranging a free pickup — keep the product in its original packaging.",
    tone: "good",
  },
  rejected: {
    label: "Not approved",
    detail: `This request could not be approved. If you think this is a mistake, call us at ${SITE.phone}.`,
    tone: "bad",
  },
  completed: {
    label: "Replacement sent",
    detail: "Your replacement has been dispatched. It should reach you within 5–7 working days.",
    tone: "good",
  },
};

export const REPLACEMENT_STEPS: ReplacementStatus[] = ["open", "approved", "completed"];
