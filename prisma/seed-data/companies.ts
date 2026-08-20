import { CompanyCategory as C, CompanyTargetStatus as S } from "@prisma/client";

type CompanySeed = {
  name: string; slug: string; aliases: string[]; targetStatus: S;
  categories: C[]; knownLocations: string[]; careerUrl?: string;
};

const india = ["Pune", "Hyderabad", "Bengaluru", "Mumbai", "Gurugram"];
const tech = [C.PRODUCT_TECH];
const payments = [C.FINTECH_PAYMENTS];
const banking = [C.BANKING_TECH];
const engineering = [C.ENGINEERING_SERVICES];
const consulting = [C.CONSULTING, C.ENTERPRISE_PLATFORM];
const company = (name: string, slug: string, categories: C[], aliases: string[] = [], knownLocations = india): CompanySeed => ({ name, slug, categories, aliases, knownLocations, targetStatus: S.TARGET });

export const companies: CompanySeed[] = [
  company("Mastercard", "mastercard", payments, ["Master Card", "Mastercard India"]),
  company("Visa", "visa", payments, ["Visa Inc", "Visa India"]),
  company("American Express", "american-express", payments, ["Amex", "American Express India"]),
  company("PayPal", "paypal", payments, ["Pay Pal", "PayPal India"]),
  company("Stripe", "stripe", payments),
  company("Razorpay", "razorpay", payments),
  company("PhonePe", "phonepe", payments, ["Phone Pe"]),
  company("Paytm", "paytm", payments, ["One97 Communications"]),
  company("Fiserv", "fiserv", payments),
  company("FIS", "fis", payments, ["Fidelity National Information Services"]),
  company("JPMorgan Chase", "jpmorgan-chase", banking, ["JPMorgan", "JP Morgan", "J.P. Morgan", "JP Morgan Chase"]),
  company("Goldman Sachs", "goldman-sachs", banking, ["Goldman Sachs India"]),
  company("Morgan Stanley", "morgan-stanley", banking),
  company("Citi", "citi", banking, ["Citibank", "Citigroup"]),
  company("Deutsche Bank", "deutsche-bank", banking),
  company("HSBC", "hsbc", banking, ["Hongkong and Shanghai Banking Corporation"]),
  company("Wells Fargo", "wells-fargo", banking),
  company("UBS", "ubs", banking),
  company("BNY", "bny", banking, ["Bank of New York Mellon", "BNY Mellon"]),
  company("Northern Trust", "northern-trust", banking),
  company("Fidelity Investments", "fidelity-investments", banking, ["Fidelity"]),
  company("Microsoft", "microsoft", tech, ["Microsoft India"]),
  company("Google", "google", tech, ["Google India", "Alphabet"]),
  company("Amazon", "amazon", tech, ["Amazon India", "Amazon Web Services", "AWS"]),
  company("Adobe", "adobe", tech, ["Adobe India"]),
  company("Salesforce", "salesforce", [C.PRODUCT_TECH, C.ENTERPRISE_PLATFORM]),
  company("ServiceNow", "servicenow", [C.PRODUCT_TECH, C.ENTERPRISE_PLATFORM], ["Service Now"]),
  company("Oracle", "oracle", [C.PRODUCT_TECH, C.ENTERPRISE_PLATFORM]),
  company("SAP", "sap", [C.PRODUCT_TECH, C.ENTERPRISE_PLATFORM], ["SAP Labs"]),
  company("Cisco", "cisco", tech, ["Cisco Systems"]),
  company("NVIDIA", "nvidia", tech, ["Nvidia"]),
  company("Red Hat", "red-hat", [C.PRODUCT_TECH, C.ENTERPRISE_PLATFORM], ["RedHat"]),
  company("Atlassian", "atlassian", tech),
  company("Intuit", "intuit", [C.PRODUCT_TECH, C.FINTECH_PAYMENTS]),
  company("Uber", "uber", tech, ["Uber India"]),
  company("Walmart Global Tech", "walmart-global-tech", tech, ["Walmart Labs", "Walmart Tech"]),
  company("Target", "target", tech, ["Target Corporation"]),
  company("Expedia Group", "expedia-group", tech, ["Expedia"]),
  company("Booking.com", "booking-com", tech, ["Booking Holdings"]),
  company("Agoda", "agoda", tech),
  company("Broadcom", "broadcom", tech, ["VMware by Broadcom", "VMware"]),
  company("Thoughtworks", "thoughtworks", engineering, ["ThoughtWorks"]),
  company("EPAM", "epam", engineering, ["EPAM Systems"]),
  company("Globant", "globant", engineering),
  company("Persistent Systems", "persistent-systems", engineering, ["Persistent"]),
  company("Zensar", "zensar", engineering, ["Zensar Technologies"]),
  company("Synechron", "synechron", engineering),
  company("Publicis Sapient", "publicis-sapient", engineering, ["Sapient", "Sapient Consulting"]),
  company("Nagarro", "nagarro", engineering),
  company("Accenture", "accenture", consulting),
  company("Capgemini", "capgemini", consulting, ["Cap Gemini"]),
  company("Cognizant", "cognizant", consulting, ["Cognizant Technology Solutions", "CTS"]),
  company("LTIMindtree", "ltimindtree", consulting, ["LTI Mindtree", "LTI", "Mindtree"]),
  company("HCLTech", "hcltech", consulting, ["HCL Technologies", "HCL"]),
  company("Tech Mahindra", "tech-mahindra", consulting),
  company("Infosys", "infosys", consulting),
  company("TCS", "tcs", consulting, ["Tata Consultancy Services"]),
  company("Deloitte", "deloitte", consulting, ["Deloitte India"]),
  company("PwC", "pwc", consulting, ["PricewaterhouseCoopers", "Price Waterhouse Coopers"]),
  company("EY", "ey", consulting, ["Ernst & Young", "Ernst and Young"]),
  company("KPMG", "kpmg", consulting),
  { ...company("Barclays", "barclays", banking, ["Barclays Bank", "Barclays India"]), targetStatus: S.EXCLUDED },
];
