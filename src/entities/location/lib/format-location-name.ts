export function formatLocationName(locationId: string) {
  try {
    return decodeURIComponent(locationId).split("-").join(" ");
  } catch (error) {
    return locationId.split("-").join(" ");
  }
}
