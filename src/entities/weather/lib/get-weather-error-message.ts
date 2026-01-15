export async function getWeatherErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    if (data?.message) return data.message;
  } catch {
    // ignore parsing errors
  }
  return `날씨 정보를 가져오지 못했습니다. (${response.status})`;
}
