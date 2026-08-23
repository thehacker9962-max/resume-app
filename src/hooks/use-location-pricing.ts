import { useEffect, useState } from "react";

export type PaymentGateway = "razorpay" | "stripe";

export interface LocationPricing {
  countryCode: string;
  currency: string;
  symbol: string;
  proPrice: number;
  elitePrice: number;
  gateway: PaymentGateway;
  loading: boolean;
}

export function useLocationPricing(): LocationPricing {
  const [pricing, setPricing] = useState<LocationPricing>({
    countryCode: "US",
    currency: "USD",
    symbol: "$",
    proPrice: 8,
    elitePrice: 20,
    gateway: "stripe",
    loading: true,
  });

  useEffect(() => {
    // 1. Initial quick timezone-based check to avoid layout shift
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isIndiaTz = tz === "Asia/Kolkata" || tz === "Asia/Calcutta";
    
    if (isIndiaTz) {
      setPricing({
        countryCode: "IN",
        currency: "INR",
        symbol: "₹",
        proPrice: 29,
        elitePrice: 99,
        gateway: "razorpay",
        loading: false,
      });
    }

    // 2. Exact IP lookup for confirmation
    const fetchGeoIP = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("GeoIP lookup failed");
        
        const data = await response.json();
        const country = data.country_code || data.country;
        
        if (country === "IN") {
          setPricing({
            countryCode: "IN",
            currency: "INR",
            symbol: "₹",
            proPrice: 29,
            elitePrice: 99,
            gateway: "razorpay",
            loading: false,
          });
        } else {
          setPricing({
            countryCode: country || "US",
            currency: "USD",
            symbol: "$",
            proPrice: 8,
            elitePrice: 20,
            gateway: "stripe",
            loading: false,
          });
        }
      } catch (err) {
        console.warn("GeoIP check failed, falling back to timezone check:", err);
        setPricing((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchGeoIP();
  }, []);

  return pricing;
}
