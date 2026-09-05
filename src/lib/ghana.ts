/**
 * Ghana-specific configuration: currency formatting, delivery regions,
 * support contacts. Owner-editable from /admin/settings/delivery.
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

export const GHANA_REGIONS: DeliveryRegion[] = [
  {
    id: "greater-accra",
    name: "Greater Accra",
    fee: 35,
    etaDays: [1, 3],
    pickupAvailable: true,
    notes: "Pickup available by arrangement at our Osu atelier.",
  },
  {
    id: "ashanti",
    name: "Ashanti (Kumasi)",
    fee: 55,
    etaDays: [2, 4],
    pickupAvailable: true,
    notes: "Pickup available at our Kumasi partner location.",
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
    id: "brong-ahafo",
    name: "Bono (Sunyani)",
    fee: 75,
    etaDays: [3, 6],
    pickupAvailable: false,
  },
];

export const STORE_CONTACT = {
  name: "LA GLITZ Atelier",
  address: "Oxford Street, Osu, Accra, Ghana",
  phone: "+233 24 000 0000",
  whatsapp: "+233 24 000 0000",
  email: "hello@la-glitz.com",
  hours: "Mon–Sat, 9:00–18:00 GMT",
};

export const SUPPORT_WHATSAPP_URL = "https://wa.me/233240000000";

/**
 * Format a major-unit amount as a Ghana cedi string.
 * Paystack expects minor units (pesewa) - see `toMinorUnits`.
 */
export function formatGHS(amount: number, currency: "GHS" | "USD" = "GHS"): string {
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

export const DELIVERY_COPY = "We deliver across Ghana, bringing you beautiful jewelry from the LA GLITZ atelier, carefully packaged and sent with delivery fees shown for your region at checkout.";
