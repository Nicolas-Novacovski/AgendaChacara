export interface WeatherData {
  temp: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'wind';
  description: string;
}

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await response.json();
    const code = data.current_weather.weathercode;
    const temp = Math.round(data.current_weather.temperature);

    // Mapeamento de códigos WMO (World Meteorological Organization)
    let condition = 'cloud';
    let icon: 'sun' | 'cloud' | 'rain' | 'wind' = 'cloud';
    let description = 'Céu nublado';

    if (code === 0) {
      icon = 'sun';
      description = 'Céu limpo';
    } else if (code >= 1 && code <= 3) {
      icon = 'cloud';
      description = 'Parcialmente nublado';
    } else if (code >= 51 && code <= 67) {
      icon = 'rain';
      description = 'Chuva leve';
    } else if (code >= 80 && code <= 99) {
      icon = 'rain';
      description = 'Chuva forte';
    }

    return { temp, condition, icon, description };
  } catch (error) {
    console.error('Erro ao buscar clima:', error);
    return { temp: 25, condition: 'sun', icon: 'sun', description: 'Dados indisponíveis' };
  }
};