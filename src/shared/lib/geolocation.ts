export type GeolocationPosition = {
  latitude: number;
  longitude: number;
};

export type GeolocationError =
  | { type: "denied"; message: string }
  | { type: "unavailable"; message: string }
  | { type: "timeout"; message: string }
  | { type: "unknown"; message: string };

const GEOLOCATION_TIMEOUT_MS = 10_000;

function mapGeolocationError(error: globalThis.GeolocationPositionError): GeolocationError {
  if (error.code === error.PERMISSION_DENIED) {
    return { type: "denied", message: "위치 접근이 거부되었습니다. 브라우저 설정을 확인해주세요." };
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return { type: "unavailable", message: "현재 위치 정보를 가져올 수 없습니다." };
  }
  if (error.code === error.TIMEOUT) {
    return { type: "timeout", message: "위치 정보를 가져오는 데 시간이 초과되었습니다." };
  }
  return { type: "unknown", message: "알 수 없는 위치 오류가 발생했습니다." };
}

export function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        type: "unavailable",
        message: "이 브라우저는 위치를 지원하지 않습니다.",
      } satisfies GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(mapGeolocationError(error)),
      { timeout: GEOLOCATION_TIMEOUT_MS, enableHighAccuracy: true },
    );
  });
}
