// 🔥 in-memory cache
const geoCache = new Map();

export const reverseGeocode = async (lat, lng) => {
  try {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;

    if (geoCache.has(key)) {
      return geoCache.get(key);
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "EvacTrack/1.0 (klintruales11@gmail.com)"
        }
      }
    );

    if (!res.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await res.json();
    const addr = data.address || {};

    const result = {
      region: addr.region || "",
      province: addr.state || addr.region || "",
      city: addr.city || addr.town || addr.municipality || "",
      barangay: addr.suburb || addr.village || addr.neighbourhood || "",
      street: addr.road || "",
      full_address: data.display_name || "",
    };

    geoCache.set(key, result);

    return result;

  } catch (error) {
    console.error("Reverse geocode error:", error);

    return {
      region: "",
      province: "",
      city: "",
      barangay: "",
      street: "",
      full_address: "Unable to fetch address",
    };
  }
};