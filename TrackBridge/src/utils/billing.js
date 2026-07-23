const DAY_MS = 24 * 60 * 60 * 1000;


export function getBillingState(user) {
  if (!user || user.role !== "company") {
    return { status: "none", daysLeft: 0, isGated: false };
  }

  const status = user.planStatus || "trial";

  if (status === "active") {
    return { status: "active", daysLeft: 0, isGated: false };
  }

  const trialEndsAt = user.trialEndsAt || Date.now();
  const daysLeft = Math.max(0, Math.ceil((trialEndsAt - Date.now()) / DAY_MS));
  const expired = status === "expired" || daysLeft <= 0;

  return {
    status: expired ? "expired" : "trial",
    daysLeft,
   
    isGated: expired,
  };
}

export function formatTrialEnd(trialEndsAt) {
  if (!trialEndsAt) return "";
  return new Date(trialEndsAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
