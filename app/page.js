import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet, faUmbrella } from "@fortawesome/free-solid-svg-icons";
import { faWind } from "@fortawesome/free-solid-svg-icons";

const getCurrentLocationData = async () => {
  const res = await fetch("https://ipapi.co/json/", {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

const getLiveWeatherData = async (latitude, longitude) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto&models=best_match`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

const weekDays = {
  0: "Mon",
  1: "Tue",
  2: "Wed",
  3: "Thu",
  4: "Fri",
  5: "Sat",
  6: "Sun",
};

export default async function Home() {
  const curr_time = new Date().toLocaleString("en-us", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  const { city, latitude, longitude } = await getCurrentLocationData();
  const weatherData = await getLiveWeatherData(latitude, longitude);
  const {
    currentTemperature,
    currentWeatherCode,
    isDay,
    minCurrentTemperature,
    relativeHumidity,
    currentWindspeed,
    precipitationProbability,
    nextWeatherForecast,
  } = prepareWeatherData(weatherData);
  const currentWeatherIllustrations = addAppropriateIllustration(
    currentWeatherCode,
    isDay
  );
  return (
    <main className="bg-[url('https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')] bg-cover bg-center flex justify-center items-center min-h-screen">
      <div className="bg-white/30 w-[60vw] sm:w-[50vw] justify-center items-center p-2 rounded flex flex-col">
        <div className="bg-black/30 w-full flex flex-col gap-2 p-2 justify-center items-center text-white">
          <span className="text-sm">{curr_time}</span>
          <span className="text-2xl font-bold">{city}</span>
        </div>
        <div className="flex flex-col sm:flex-row w-full p-2 sm:p-4 gap-4 sm:gap-8 justify-center items-center mt-4">
          <div className="group relative w-28 sm:w-40">
            <Image
              width={500}
              height={500}
              className="w-full"
              src={
                currentWeatherIllustrations && currentWeatherIllustrations[0]
              }
              alt={
                currentWeatherIllustrations && currentWeatherIllustrations[1]
              }
              priority
            />
            <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-sm text-gray-300 rounded-md -top-1/4 left-6/8 mx-auto group-hover:opacity-100">
              {currentWeatherIllustrations && currentWeatherIllustrations[1]}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-[#fef8bc]">
            <div className="flex gap-2 justify-start">
              <span className="text-6xl sm:text-8xl">{currentTemperature}</span>
              <div className="mt-3">
                <p className="text-xl sm:text-3xl">
                  <span>
                    <sup>o</sup>C
                  </span>
                </p>
                <p>
                  <span className="text-xs sm:text-sm">
                    MIN {minCurrentTemperature} <sup>o</sup>C
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-black/30 flex py-2 px-2 items-center sm:px-4 gap-2 sm:gap-4">
              <div className="group relative flex flex-col items-center gap-1">
                <FontAwesomeIcon
                  icon={faDroplet}
                  className="text-[#64dcfd] w-3"
                />
                <span className="text-xs sm:text-sm">{relativeHumidity}%</span>
                <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-xs text-gray-300 rounded-md top-[100%] left-6/8 mx-auto group-hover:opacity-100">
                  Humidity
                </span>
              </div>
              <div className="group relative flex flex-col items-center gap-1">
                <FontAwesomeIcon icon={faWind} className="text-[#64dcfd] w-4" />
                <span className="text-xs sm:text-sm">
                  {currentWindspeed} km/h
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
                  {precipitationProbability}%
                </span>
                <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-xs text-gray-300 rounded-md top-[100%] left-6/8 mx-auto group-hover:opacity-100">
                  Precipitation
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 justify-between p-1 sm:p-4 w-full text-[#fef8bc] mt-8">
          {nextWeatherForecast.map(
            (
              { nextDay, nextDayTempMax, nextDayTempMin, nextDayIllustration },
              index
            ) => {
              if (index > 0)
                return (
                  <div
                    key={index}
                    className="group relative bg-black/30 flex flex-row justify-around sm:flex-col grow gap-1 p-1 items-center text-center"
                  >
                    <span className="text-sm sm:text-md">{nextDay}</span>
                    {/* <FontAwesomeIcon
                      icon={faCloud}
                      className="text-[#64dcfd] w-4"
                    /> */}
                    <div className=" w-8 ">
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
                    <span className="absolute opacity-0 transition-opacity duration-200 ease-in bg-black/50 p-1 text-xs text-gray-300 rounded-md -top-1/3 left-6/8 mx-auto group-hover:opacity-100">
                      {nextDayIllustration && nextDayIllustration[1]}
                    </span>
                  </div>
                );
            }
          )}
        </div>
      </div>
    </main>
  );
}

const prepareWeatherData = (weatherData) => {
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
    nextDay: weekDays[new Date(time).getDay()],
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
};

const addAppropriateIllustration = (weathercode, isDay = 1) => {
  if (weathercode === 0) {
    // Clear sky
    if (isDay === 1)
      // (day)
      return ["https://i.ibb.co/xDpF63y/day-clear.png", "Sunny"];
    //(night)
    else
      return [
        "https://i.ibb.co/PrQfyk1/night-half-moon-clear.png",
        "Clear night",
      ];
  } else if (weathercode === 1 || weathercode === 2 || weathercode === 3) {
    if (isDay === 1) {
      // Mainly clear (day)
      return [
        "https://i.ibb.co/3YD4Bc1/day-partial-cloud.png",
        "Partial Cloudy",
      ];
    } else {
      // Mainly clear (night)
      return [
        "https://i.ibb.co/6tLnLCR/night-full-moon-partial-cloud.png",
        "Partial Cloudy",
      ];
    }
  } else if (weathercode >= 45 && weathercode <= 48) {
    // Fog
    return ["https://i.ibb.co/WpV7VDz/fog.png", "Fog"];
  } else if (
    (weathercode >= 51 && weathercode <= 67) ||
    (weathercode >= 80 && weathercode <= 82)
  ) {
    if (isDay === 1) {
      // Rain (day)
      return ["https://i.ibb.co/pJxyNwy/day-rain.png", "Rainy"];
    } else {
      // Rain (night)
      return [
        "https://i.ibb.co/ZcQmh89/night-full-moon-rain.png",
        "Rainy night",
      ];
    }
  } else if (
    (weathercode >= 71 && weathercode <= 77) ||
    weathercode === 85 ||
    weathercode === 86
  ) {
    if (isDay === 1)
      // Snow (day)
      return ["https://i.ibb.co/3rdTxwb/night-full-moon-snow.png", "Snowy"];
    // Snow (night)
    else
      return [
        "https://i.ibb.co/3rdTxwb/night-full-moon-snow.png",
        "Snowy night",
      ];
  } else if (weathercode >= 95 && weathercode <= 99) {
    // Thunder (day)
    if (isDay === 1)
      return ["https://i.ibb.co/gVmrPkV/day-rain-thunder.png", "Thunderstorm"];
    // Thunder (night)
    else
      return [
        "https://i.ibb.co/qxWQ9PY/night-full-moon-rain-thunder.png",
        "Thunderstorm night",
      ];
  }
};
