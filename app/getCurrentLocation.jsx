"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function GetCurrentLocation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    fetchLocationData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLocationData = async () => {
    const currentLocationData = await getCurrentLocationData();
    const newParams = new URLSearchParams(searchParams.toString());
    if (currentLocationData) {
      // setCity(currentLocationData.city);
      newParams.set("loc", [
        currentLocationData.city,
        currentLocationData.latitude,
        currentLocationData.longitude,
      ]);
    } else {
      newParams.delete("q");
    }
    router.push(`${pathname}?${newParams}`);
  };
}

const getCurrentLocationData = async () => {
  const res = await fetch("https://ipapi.co/json/", {
    next: { revalidate: 900 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};
