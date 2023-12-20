const GEO_API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = '5064ec67e51d4bacab9d8fafac4c2f67';

const GEO_API_OPTIONS = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '4f0dcce84bmshac9e329bd55fd14p17ec6fjsnff18c2e61917',
      'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
    },
  };

  export const fetchWeatherData = async (latitude: string, longitude: string) => {
    try {
      let [weatherDataPromise, forcastDataPromise] = await Promise.all([
        fetch(
          `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
        ),
        fetch(
          `${WEATHER_API_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
        ),
      ]);

      const weatherDataResponse = await weatherDataPromise.json();
      const forcastDataResponse = await forcastDataPromise.json();
      return [weatherDataResponse, forcastDataResponse];
    } catch (error) {
    }
  };

  export const fetchCities = async (input: string) => {
    try {
      const response = await fetch(
        `${GEO_API_URL}/cities?minPopulation=10000&namePrefix=${input}`,
        GEO_API_OPTIONS
      );

      const data = await response.json();
      return data;
    } catch (error) {
      return;
    }
  };