// Helper function to dynamically resolve Supabase storage public URLs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cpuodlbsbemerububvjk.supabase.co";

export const supabasePublicAsset = (path: string) => {
  return `${supabaseUrl}/storage/v1/object/public/assets/${path}`;
};

// Centralized site assets object for the Nextgen Billing Software
export const siteAssets = {
  // Brand Logos
  logo: supabasePublicAsset("logo/logo.png"), // Main Nextgen Billing Logo

  // Future Categories (Add your images here as you build out the app)
  avatars: {
    defaultAdmin: "/images/avatars/admin-placeholder.png",
    defaultUser: "/images/avatars/user-placeholder.png",
  },

  emptyStates: {
    noData: "/images/empty/no-data.svg",
    noInvoices: "/images/empty/no-invoices.svg",
  },

  marketing: {
    heroBanner: supabasePublicAsset("marketing/hero-banner.png"),
    featureShowcase: supabasePublicAsset("marketing/features.png"),
  }
};
