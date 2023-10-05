"use client";
import { useEffect } from "react";

export default function GetCurrentLocation() {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options
    );
  });
}
const successCallback = (position) => {
  console.log("position is:", position);
  console.log("Latitude is :", position.coords.latitude);
  console.log("Longitude is :", position.coords.longitude);
};

const errorCallback = (error) => {
  throw new Error("Failed to fetch data", error);
};
const options = {
  enableHighAccuracy: true,
  timeout: 10000,
};
