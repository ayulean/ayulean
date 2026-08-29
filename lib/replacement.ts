import { SITE } from "./site";
import type { ReplacementStatus } from "./types";

/**
 * How each replacement status reads to the customer.
 * The raw database words are for us; these are for them.
 */
export const REPLACEMENT_STATUS: Record<
  ReplacementStatus,
  { label: string; detail: string; tone: "pending" | "good" | "bad"; adminNext: string }
> = {
  open: {
    label: "Under review",
    detail: `Our team is checking your request and will call you on ${SITE.phone} within 24 working hours.`,
    tone: "pending",
    adminNext: "Review and approve or reject",
  },
  approved: {
    label: "Approved",
    detail:
      "Your replacement is approved. We are arranging a free pickup of the old product — please keep it in its original packaging.",
    tone: "good",
    adminNext: "Arrange the reverse pickup",
  },
  picked_up: {
    label: "Old product picked up",
    detail: "We have collected the old product. Your replacement is being packed and will ship shortly.",
    tone: "good",
    adminNext: "Pack and dispatch the replacement",
  },
  shipped: {
    label: "Replacement on the way",
    detail: "Your replacement has been dispatched and should reach you within 5–7 working days.",
    tone: "good",
    adminNext: "Waiting with the courier",
  },
  delivered: {
    label: "Replacement delivered",
    detail: "Your replacement has been delivered. We hope everything is right this time.",
    tone: "good",
    adminNext: "Done",
  },
  rejected: {
    label: "Not approved",
    detail: `This request could not be approved. If you think this is a mistake, call us at ${SITE.phone}.`,
    tone: "bad",
    adminNext: "Closed",
  },
};

/** The happy path, in order. `rejected` sits outside it. */
export const REPLACEMENT_STEPS: ReplacementStatus[] = [
  "open",
  "approved",
  "picked_up",
  "shipped",
  "delivered",
];

export const ALL_REPLACEMENT_STATUSES: ReplacementStatus[] = [...REPLACEMENT_STEPS, "rejected"];

/** Requests still needing something from the store owner. */
export const NEEDS_ACTION: ReplacementStatus[] = ["open", "approved", "picked_up"];

export function needsAction(status: ReplacementStatus): boolean {
  return NEEDS_ACTION.includes(status);
}

export function isFinished(status: ReplacementStatus): boolean {
  return status === "delivered" || status === "rejected";
}
