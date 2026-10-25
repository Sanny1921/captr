// CAPTR site config. Form posts straight to FormSubmit's AJAX endpoint from the
// browser (Vercel IPs are 403-blocked by FormSubmit; browser posts are their
// supported path). Deliveries start after the one-time Activate click in the
// agency inbox. /api/apply stays as dormant fallback code only.
const CAPTR_CONFIG = {
  email: "captrmarketingagency@gmail.com",
  instagram: "https://www.instagram.com/captr.marketing/",
  maxFileMB: 4,
  formEndpoint: "https://formsubmit.co/ajax/captrmarketingagency@gmail.com"
};
