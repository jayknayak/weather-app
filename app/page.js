import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet, faUmbrella } from "@fortawesome/free-solid-svg-icons";
import { faWind } from "@fortawesome/free-solid-svg-icons";
import DisplayCurrentTime from "./displayCurrentTime";
import GetCurrentLocation from "./getCurrentLocation";

const getLiveWeatherData = async (latitude, longitude) => {
  if (latitude && longitude) {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto&models=best_match`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return res.json();
  }
};

const weekDays = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

// This part is important!
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const selectedSearch = searchParams?.loc ?? "";
  let weatherData = null;
  let city = null;
  let currentWeatherIllustrations = null;
  if (selectedSearch) {
    const location = selectedSearch.split(",");
    city = location[0];
    const latitude = location[1];
    const longitude = location[2];
    weatherData = await getLiveWeatherData(latitude, longitude);
    weatherData = prepareWeatherData(weatherData);
    if (weatherData)
      currentWeatherIllustrations = addAppropriateIllustration(
        weatherData.currentWeatherCode,
        weatherData.isDay
      );
  }
  return (
    <main className="bg-[url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center flex justify-center items-center min-h-screen">
      <div className="bg-black/20 w-[80vw] sm:w-[50vw] justify-center items-center p-2 rounded flex flex-col">
        <div className="bg-black/40 w-full flex flex-col gap-2 p-2 justify-center items-center text-white">
          <DisplayCurrentTime />
          <GetCurrentLocation />
          <span className="text-2xl font-bold">{city}</span>
        </div>
        {weatherData ? (
          <>
            <div className="flex flex-col sm:flex-row w-full p-2 sm:p-4 gap-4 sm:gap-8 justify-center items-center mt-4">
              <div className="group relative w-40 sm:w-48">
                <Image
                  width={500}
                  height={500}
                  className="w-full"
                  src={
                    currentWeatherIllustrations &&
                    currentWeatherIllustrations[0]
                  }
                  alt={
                    currentWeatherIllustrations &&
                    currentWeatherIllustrations[1]
                  }
                  priority
                />
                <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-sm text-gray-300 rounded-md -top-[5px] left-[5px] mx-auto group-hover:opacity-100">
                  {currentWeatherIllustrations &&
                    currentWeatherIllustrations[1]}
                </span>
              </div>
              <div className="flex flex-col gap-2 text-[#fef8bc]">
                <div className="flex gap-2 justify-start">
                  <span className="text-6xl sm:text-8xl">
                    {weatherData.currentTemperature}
                  </span>
                  <div className="mt-3">
                    <p className="text-xl sm:text-3xl">
                      <span>
                        <sup>o</sup>C
                      </span>
                    </p>
                    <p>
                      <span className="text-xs sm:text-sm">
                        MIN {weatherData.minCurrentTemperature} <sup>o</sup>C
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-black/50 flex py-2 px-2 items-center sm:px-4 gap-2 sm:gap-4">
                  <div className="group relative flex flex-col items-center gap-1">
                    <FontAwesomeIcon
                      icon={faDroplet}
                      className="text-[#64dcfd] w-3"
                    />
                    <span className="text-xs sm:text-sm">
                      {weatherData.relativeHumidity}%
                    </span>
                    <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-xs text-gray-300 rounded-md top-[100%] left-6/8 mx-auto group-hover:opacity-100">
                      Humidity
                    </span>
                  </div>
                  <div className="group relative flex flex-col items-center gap-1">
                    <FontAwesomeIcon
                      icon={faWind}
                      className="text-[#64dcfd] w-4"
                    />
                    <span className="text-xs sm:text-sm">
                      {weatherData.currentWindspeed} km/h
                    </span>
                    <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-xs text-gray-300 rounded-md top-[100%] left-6/8 mx-auto group-hover:opacity-100">
                      Wind
                    </span>
                  </div>
                  <div className="group relative flex flex-col items-center gap-1">
                    <FontAwesomeIcon
                      icon={faUmbrella}
                      className="text-[#64dcfd] w-4"
                    />
                    <span className="text-xs sm:text-sm">
                      {weatherData.precipitationProbability}%
                    </span>
                    <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-xs text-gray-300 rounded-md top-[100%] left-6/8 mx-auto group-hover:opacity-100">
                      Precipitation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-1 justify-between p-1 sm:p-4 w-full text-[#fef8bc] mt-8">
              {weatherData.nextWeatherForecast.map(
                (
                  {
                    nextDay,
                    nextDayTempMax,
                    nextDayTempMin,
                    nextDayIllustration,
                  },
                  index
                ) => {
                  if (index > 0)
                    return (
                      <div
                        key={index}
                        className="group relative bg-black/50 flex flex-row justify-around sm:flex-col flex-1 gap-1 p-1 items-center text-center"
                      >
                        <span className="text-sm sm:text-md">{nextDay}</span>
                        {/* <FontAwesomeIcon
                      icon={faCloud}
                      className="text-[#64dcfd] w-4"
                    /> */}
                        <div className="w-10">
                          <Image
                            src={nextDayIllustration && nextDayIllustration[0]}
                            alt={nextDayIllustration && nextDayIllustration[1]}
                            width={300}
                            height={300}
                            className="w-full"
                          />
                        </div>
                        <span className="text-xs">
                          {nextDayTempMax}
                          <sup>o</sup> / {nextDayTempMin}
                          <sup>o</sup>
                        </span>
                        <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-xs text-gray-300 rounded-md -top-1/3 left-1/4 mx-auto group-hover:opacity-100">
                          {nextDayIllustration && nextDayIllustration[1]}
                        </span>
                      </div>
                    );
                }
              )}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

const prepareWeatherData = (weatherData) => {
  if (weatherData) {
    const { current_weather, hourly, daily } = weatherData;
    const {
      time: forecastTime,
      temperature_2m_max: forecastTempMax,
      temperature_2m_min: forecastTempMin,
      weathercode: dailyWeatherCodes,
    } = daily;
    const timeIndex =
      hourly.time.indexOf(
        hourly.time.find(
          (time) => new Date(time).getTime() >= new Date().getTime()
        )
      ) - 1;
    const nextWeatherForecast = forecastTime.map((time, index) => ({
      nextDay: weekDays[new Date(time).getUTCDay()],
      nextDayTempMax: Math.ceil(forecastTempMax[index]),
      nextDayTempMin: Math.ceil(forecastTempMin[index]),
      nextDayIllustration: addAppropriateIllustration(dailyWeatherCodes[index]),
    }));

    return {
      currentTemperature: Math.ceil(current_weather.temperature),
      currentWeatherCode: current_weather.weathercode,
      isDay: current_weather.is_day,
      minCurrentTemperature: Math.ceil(daily.temperature_2m_min[0]),
      relativeHumidity: hourly.relativehumidity_2m[timeIndex],
      currentWindspeed: current_weather.windspeed.toFixed(1),
      precipitationProbability: hourly.precipitation_probability[timeIndex],
      nextWeatherForecast: nextWeatherForecast,
    };
  }
};

const addAppropriateIllustration = (weathercode, isDay = 1) => {
  if (weathercode === 0) {
    // Clear sky
    if (isDay === 1)
      // (day)
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/clear-day.svg",
        "Sunny",
      ];
    //(night)
    else
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/clear-night.svg",
        "Clear night",
      ];
  } else if (weathercode === 1 || weathercode === 2) {
    if (isDay === 1)
      // Mainly clear (day)
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-day.svg",
        "Partial Cloudy",
      ];
    // Mainly clear (night)
    else
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-night.svg",
        "Partial Cloudy",
      ];
  } else if (weathercode === 3)
    return [
      "https://basmilius.github.io/weather-icons/production/fill/all/overcast.svg",
      "Overcast",
    ];
  else if (weathercode >= 45 && weathercode <= 48)
    // Fog
    return [
      "https://basmilius.github.io/weather-icons/production/fill/all/fog.svg",
      "Fog",
    ];
  else if (weathercode === 51 || weathercode === 53) {
    if (isDay === 1)
      // Mainly clear (day)
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-day-drizzle.svg",
        "Partial Drizzle",
      ];
    // Mainly clear (night)
    else
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-night-drizzle.svg",
        "Partial Drizzle",
      ];
  } else if (weathercode === 55)
    return [
      "https://basmilius.github.io/weather-icons/production/fill/all/drizzle.svg",
      "Drizzle",
    ];
  else if (weathercode === 56 || weathercode === 66) {
    if (isDay === 1)
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-day-drizzle.svg",
        "Partial Freezing Rain",
      ];
    else
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-night-drizzle.svg",
        "Partial Freezing Rain",
      ];
  } else if (weathercode === 57 || weathercode === 67)
    return [
      "https://basmilius.github.io/weather-icons/production/fill/all/hail.svg",
      "Freezing Rain",
    ];
  else if (weathercode === 61 || weathercode === 63) {
    if (isDay === 1)
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-day-rain.svg",
        "Partial Rain",
      ];
    else
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-night-rain.svg",
        "Partial Rain",
      ];
  } else if (weathercode === 65 || (weathercode >= 80 && weathercode <= 82))
    return [
      "https://basmilius.github.io/weather-icons/production/fill/all/rain.svg",
      "Rain",
    ];
  else if (weathercode === 71 || weathercode === 73) {
    if (isDay === 1)
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-day-snow.svg",
        "Snow",
      ];
    else
      return [
        "https://basmilius.github.io/weather-icons/production/fill/all/partly-cloudy-night-snow.svg",
        "Snow",
      ];
  } else if (
    weathercode === 75 ||
    weathercode === 77 ||
    weathercode === 85 ||
    weathercode === 86
  )
    return [
      "https://basmilius.github.io/weather-icons/production/fill/all/snow.svg",
      "Heavy Snow",
    ];
  else if (weathercode >= 95 && weathercode <= 99)
    return [
      "https://basmilius.github.io/weather-icons/production/fill/all/thunderstorms.svg",
      "Thunderstorm",
    ];
};
