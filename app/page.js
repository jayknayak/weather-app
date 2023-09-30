import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from "@fortawesome/free-solid-svg-icons";
import { faWind } from "@fortawesome/free-solid-svg-icons";
import { faSnowflake } from "@fortawesome/free-solid-svg-icons";
import { faCloudSun } from "@fortawesome/free-solid-svg-icons";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { faCloud } from "@fortawesome/free-solid-svg-icons";

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
    minCurrentTemperature,
    relativeHumidity,
    currentWindspeed,
    precipitationProbability,
    weatherForecast,
  } = prepareWeatherData(weatherData);
  return (
    <main className="bg-[url('https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')] bg-cover bg-center flex justify-center items-center min-h-screen">
      <div className="bg-white/30 w-[80vw] sm:w-[50vw] justify-center items-center p-2 rounded flex flex-col">
        <div className="bg-black/30 w-full flex flex-col gap-2 p-2 justify-center items-center text-white">
          <span className="text-sm">{curr_time}</span>
          <span className="text-2xl font-bold">{city}</span>
        </div>
        <div className="flex w-full p-2 sm:p-4 gap-4 sm:gap-8 justify-center items-center mt-4">
          <div className="w-32">
            <Image
              width={500}
              height={500}
              className="w-full"
              src="https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/19402/cat-sleeping-on-the-moon-clipart-xl.png"
              alt=""
              priority
            />
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
              <div className="flex flex-col items-center gap-1">
                <FontAwesomeIcon
                  icon={faDroplet}
                  className="text-[#64dcfd] w-3"
                />
                <span className="text-xs sm:text-sm">{relativeHumidity}%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FontAwesomeIcon icon={faWind} className="text-[#64dcfd] w-4" />
                <span className="text-xs sm:text-sm">
                  {currentWindspeed} km/h
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FontAwesomeIcon
                  icon={faSnowflake}
                  className="text-[#64dcfd] w-4"
                />
                <span className="text-xs sm:text-sm">
                  {precipitationProbability}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 justify-between p-1 sm:p-4 w-full text-[#fef8bc] mt-8">
          {weatherForecast.map(
            ({ nextDay, nextDayTempMax, nextDayTempMin }, index) => {
              if (index > 0)
                return (
                  <div
                    key={index}
                    className="bg-black/30 flex flex-row justify-between sm:flex-col grow gap-1 p-1 items-center text-center"
                  >
                    <span className="text-sm sm:text-md">{nextDay}</span>
                    <FontAwesomeIcon
                      icon={faCloud}
                      className="text-[#64dcfd] w-4"
                    />
                    <span className="text-xs">
                      {nextDayTempMax}
                      <sup>o</sup> / {nextDayTempMin}
                      <sup>o</sup>
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
  } = daily;
  const timeIndex =
    hourly.time.indexOf(
      hourly.time.find(
        (time) => new Date(time).getTime() >= new Date().getTime()
      )
    ) - 1;
  const weatherForecast = forecastTime.map((time, index) => ({
    nextDay: weekDays[new Date(time).getDay()],
    nextDayTempMax: Math.ceil(forecastTempMax[index]),
    nextDayTempMin: Math.ceil(forecastTempMin[index]),
  }));

  return {
    currentTemperature: Math.ceil(current_weather.temperature),
    minCurrentTemperature: Math.ceil(daily.temperature_2m_min[0]),
    relativeHumidity: hourly.relativehumidity_2m[timeIndex],
    currentWindspeed: current_weather.windspeed.toFixed(1),
    precipitationProbability: hourly.precipitation_probability[timeIndex],
    weatherForecast: weatherForecast,
  };
};

const getCurrentLocationData = async () => {
  const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

const getLiveWeatherData = async (latitude, longitude) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto&models=best_match`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};
