import { prisma } from "@/lib/prisma";

// A free plan (price === 0) can only ever be claimed once per employer
// account (ownerId) and once per GST number, so the same person or company
// can't re-claim it by creating a second company/account.
export async function getClaimedFreePlanIds(
  ownerId: string,
  gstNumber: string | null,
  freePlanIds: string[],
): Promise<Set<string>> {
  if (freePlanIds.length === 0) return new Set();
  const rows = await prisma.creditTransaction.findMany({
    where: {
      plan: { in: freePlanIds },
      company: {
        OR: [
          { ownerId },
          ...(gstNumber ? [{ gstNumber }] : []),
        ],
      },
    },
    select: { plan: true },
  });
  return new Set(rows.map(r => r.plan));
}
