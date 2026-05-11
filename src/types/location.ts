export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  coordinates: GeoCoordinates;
  displayName: string; // "Washington, DC, US"
  country: string;
  state?: string;
}
