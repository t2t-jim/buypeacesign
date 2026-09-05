/**
 * BuyPeaceSign — approved UI copy (UX v1.1 market-test).
 * Keyed by route / component. Do not invent “Buy now” or price strings.
 */

export const copy = {
  brand: {
    wordmark: "BuyPeaceSign",
    navSignIn: "Sign in",
  },

  landing: {
    h1: "Light that says peace.",
    sub: "Custom outdoor peace-sign lights in 36\" and 48\". Early access is open — claim your place before they ship.",
    preorderCard: {
      title: "Pre-order yours today",
      helper:
        "Join the early-access list. No charge today — we’ll email you when it’s time to order.",
      cta: "Pre-order yours today",
      legalMicro:
        "Pre-order interest only. No payment now. Unsubscribe anytime.",
      success:
        "You’re on the list. We’ll be in touch when BuyPeaceSign opens.",
    },
    secondaryCta: "Design yours — pick size & color",
    trustChips: [
      "36\" & 48\"",
      "Custom hex color",
      "AC powered (solar coming)",
      "Early access",
    ],
    /** Honest early-access framing — never invent subscriber counts. */
    socialProof: {
      label: "Early access is open",
      detail: "Be among the first to light up your porch.",
    },
    footerMicro: "Made for porches, patios, and quiet nights outside.",
  },

  configure: {
    size: {
      h1: "Pick your size",
      helper: "Outdoor decorative peace-sign light. AC powered for v1.",
      options: [
        {
          id: "36",
          label: "36\"",
          blurb: "Porch & patio favorite — bold without overwhelming.",
        },
        {
          id: "48",
          label: "48\"",
          blurb: "Statement size for larger walls and yards.",
        },
      ],
      continueCta: "Continue to color",
    },
    color: {
      h1: "Choose your glow",
      helper: "Pick a swatch or enter any hex. Preview updates live.",
      hexLabel: "Custom hex",
      hexPlaceholder: "#FFFFFF",
      swatchesLabel: "Suggested colors",
      continueCta: "Review design",
      backCta: "Back to size",
    },
    review: {
      h1: "Looking good",
      summaryLabels: {
        size: "Size",
        color: "Color",
        power: "Power",
      },
      powerValue: "AC",
      primaryCta: "Pre-order this design",
      secondaryCta: "Edit design",
      micro: "Pre-order interest only — no payment today.",
      // Price intentionally omitted — do not add.
    },
  },

  preorderForm: {
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    firstNameLabel: "First name",
    firstNamePlaceholder: "Optional",
    firstNameOptionalHint: "Optional",
    sizeInterestLabel: "Size interest",
    sizeOptions: [
      { id: "36", label: "36\"" },
      { id: "48", label: "48\"" },
      { id: "unsure", label: "Not sure yet" },
    ],
    colorSummaryLabel: "Your color",
    ctaLanding: "Pre-order yours today",
    ctaConfigure: "Pre-order this design",
    successLanding:
      "You’re on the list. We’ll be in touch when BuyPeaceSign opens.",
    successConfigure:
      "You’re on the list. We saved your preferences and will email you when ordering opens.",
    legalMicro:
      "Pre-order interest only. No payment now. Unsubscribe anytime.",
    errorGeneric: "Something went wrong. Please try again.",
    errorEmail: "Enter a valid email.",
  },

  account: {
    h1: "Your account",
    stubBadge: "Stub",
    stubBody:
      "Sign in and saved designs are coming soon. Auth provider not locked yet — this page is a placeholder for market-test.",
    signInCta: "Sign in (coming soon)",
    createCta: "Create account (coming soon)",
    savedDesignsEmpty: "No saved designs yet.",
    backHome: "Back to home",
  },

  install: {
    h1: "Install BuyPeaceSign",
    body: "Add BuyPeaceSign to your home screen for quick access while we open pre-orders.",
    howToIos: "On iPhone: Share → Add to Home Screen.",
    howToAndroid: "On Android: browser menu → Install app / Add to Home screen.",
    dismiss: "Maybe later",
    softPromptTitle: "Install the app?",
    softPromptBody: "Keep early access one tap away.",
    softPromptCta: "How to install",
  },
} as const;

export type Copy = typeof copy;

export default copy;
