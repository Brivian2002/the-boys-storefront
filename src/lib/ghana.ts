/**
 * Ghana-specific configuration: store contact, delivery regions, currency
 * formatting, and Paystack minor-unit helpers.
 *
 * NOTE: The public-facing delivery copy / region table is owner-editable
 * from the admin Store settings page (persisted to the SiteSetting table
 * and surfaced through getSiteSettings()). The constants here are the
 * immutable fallback values used to seed defaults and to format prices.
 */

export interface DeliveryRegion {
  id: string;
  name: string;
  /** fee in GHS major units */
  fee: number;
  /** estimated delivery window in days */
  etaDays: [number, number];
  /** whether pickup is available in this region */
  pickupAvailable: boolean;
  notes?: string;
}

export const STORE_CONTACT = {
  name: "Afrocentric Jewelry by LaGlitz",
  address: "Ashaley Botwe, Madina, Ghana",
  phone: "+233 55 454 5900",
  whatsapp: "+233 55 454 5900",
  email: "laglitz@gmail.com",
  hours: "Mon–Fri, 9:00 AM – 5:00 PM · Sat & Sun closed",
} as const;

export const SUPPORT_WHATSAPP_URL = "https://wa.me/233554545900";

/**
 * Eleven delivery regions including an "international" option.
 * Fees/ETAs are editable defaults; the owner can override them via
 * /admin/settings (Store settings tab) and the changes are persisted
 * to the SiteSetting table.
 */
export const GHANA_REGIONS: DeliveryRegion[] = [
  {
    id: "greater-accra",
    name: "Greater Accra",
    fee: 35,
    etaDays: [1, 3],
    pickupAvailable: true,
    notes: "Same-day pickup available at our Cantonments office.",
  },
  {
    id: "ashanti",
    name: "Ashanti (Kumasi)",
    fee: 55,
    etaDays: [2, 4],
    pickupAvailable: false,
  },
  {
    id: "western",
    name: "Western (Takoradi)",
    fee: 60,
    etaDays: [2, 5],
    pickupAvailable: false,
  },
  {
    id: "central",
    name: "Central (Cape Coast)",
    fee: 55,
    etaDays: [2, 4],
    pickupAvailable: false,
  },
  {
    id: "eastern",
    name: "Eastern (Koforidua)",
    fee: 50,
    etaDays: [2, 4],
    pickupAvailable: false,
  },
  {
    id: "volta",
    name: "Volta (Ho)",
    fee: 65,
    etaDays: [3, 5],
    pickupAvailable: false,
  },
  {
    id: "northern",
    name: "Northern (Tamale)",
    fee: 90,
    etaDays: [4, 7],
    pickupAvailable: false,
  },
  {
    id: "upper-east",
    name: "Upper East (Bolgatanga)",
    fee: 100,
    etaDays: [4, 7],
    pickupAvailable: false,
  },
  {
    id: "upper-west",
    name: "Upper West (Wa)",
    fee: 100,
    etaDays: [5, 8],
    pickupAvailable: false,
  },
  {
    id: "bono",
    name: "Bono (Sunyani)",
    fee: 75,
    etaDays: [3, 6],
    pickupAvailable: false,
  },
  {
    id: "international",
    name: "International (Worldwide)",
    fee: 0,
    etaDays: [7, 21],
    pickupAvailable: false,
    notes: "Calculated per destination. We ship worldwide via DHL/FedEx.",
  },
];

/**
 * Format a major-unit amount as a Ghana cedi string.
 * Paystack expects minor units (pesewa) - see `toMinorUnits`.
 */
export function formatGHS(
  amount: number,
  currency: "GHS" | "USD" = "GHS"
): string {
  const symbol = currency === "GHS" ? "GH₵" : "$";
  return `${symbol}${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert major-currency units to Paystack minor units.
 * GHS 1250.00 -> 125000 (pesewa)
 * USD 1250.00 -> 125000 (cents)
 */
export function toMinorUnits(amount: number, currency: "GHS" | "USD"): number {
  return Math.round(amount * 100);
}

/**
 * Convert Paystack minor units back to major units.
 */
export function fromMinorUnits(minor: number): number {
  return minor / 100;
}
