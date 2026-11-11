// Weather app - Jane

let isCelsius = true;
let lastCity = "";

const input = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitBtn = document.getElementById("unitBtn");
const loading = document.getElementById("loading");
const errorText = document.getElementById("error");
const currentBox = document.getElementById("current");

searchBtn.addEventListener("click", function () {
  let city = input.value.trim();
  if (city === "") {
    errorText.textContent = "Please type a city name";
    errorText.classList.remove("hidden");
    return;
  }
  getWeather(city);
});

input.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

unitBtn.addEventListener("click", function () {
  if (isCelsius) {
    isCelsius = false;
    unitBtn.textContent = "Change to °C";
  } else {
    isCelsius = true;
    unitBtn.textContent = "Change to °F";
  }
  if (lastCity !== "") {
    getWeather(lastCity);
  }
});

async function getWeather(city) {
  lastCity = city;
  loading.classList.remove("hidden");
  errorText.classList.add("hidden");
  currentBox.classList.add("hidden");

  let unit = "metric";
  if (!isCelsius) {
    unit = "imperial";
  }

  try {
    let url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + API_KEY + "&units=" + unit;
    let response = await fetch(url);
    let data = await response.json();

    if (data.cod !== 200) {
      throw new Error("City not found");
    }

    showWeather(data);
    getForecast(city, unit);
    saveHistory(city);

  } catch (err) {
    errorText.textContent = "City not found. Try another city.";
    errorText.classList.remove("hidden");
  }

  loading.classList.add("hidden");
}

function showWeather(data) {
  let tempUnit = "°C";
  if (!isCelsius) {
    tempUnit = "°F";
  }

  document.getElementById("cityName").textContent = data.name;
  document.getElementById("date").textContent = new Date().toDateString();
  document.getElementById("temp").textContent = Math.round(data.main.temp) + tempUnit;
  document.getElementById("desc").textContent = data.weather[0].description;
  document.getElementById("details").textContent = "Humidity: " + data.main.humidity + "% | Wind: " + data.wind.speed + " m/s";

  let icon = data.weather[0].icon;
  document.getElementById("weatherIcon").src = "https://openweathermap.org/img/wn/" + icon + "@2x.png";

  currentBox.classList.remove("hidden");
}

async function getForecast(city, unit) {
  let url = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + API_KEY + "&units=" + unit;
  let response = await fetch(url);
  let data = await response.json();

  let forecastBox = document.getElementById("forecast");
  forecastBox.innerHTML = "";

  let tempUnit = "°C";
  if (!isCelsius) {
    tempUnit = "°F";
  }

  for (let i = 0; i < data.list.length; i = i + 8) {
    let day = data.list[i];
    let p = document.createElement("p");
    p.textContent = new Date(day.dt_txt).toDateString() + " - " + Math.round(day.main.temp) + tempUnit + " - " + day.weather[0].description;
    forecastBox.appendChild(p);
  }
}

function saveHistory(city) {
  let history = JSON.parse(localStorage.getItem("history") || "[]");
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) {
      history.pop();
    }
    localStorage.setItem("history", JSON.stringify(history));
  }
  showHistory();
}

function showHistory() {
  let history = JSON.parse(localStorage.getItem("history") || "[]");
  let box = document.getElementById("history");
  box.innerHTML = "";
  for (let i = 0; i < history.length; i++) {
    let btn = document.createElement("button");
    btn.textContent = history[i];
    btn.addEventListener("click", function () {
      input.value = history[i];
      getWeather(history[i]);
    });
    box.appendChild(btn);
  }
}

showHistory();
