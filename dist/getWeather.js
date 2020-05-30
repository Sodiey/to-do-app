// GET REQUEST
const API_KEY = "DEMO_KEY";
const API_URL = "https://developer.accuweather.com/";

function getWeather(locationKey, location) {
  axios
  .get(
    `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${API_KEY}`)
  .then((res) => displayWeather(res, location))
  .catch((err) => console.log(err));
}

const getLocation = () => {
  axios
  .get("https://geoip-db.com/json/")
  .then((res) => convertLocation(res))
  .catch((err) => console.log(err));
}

const convertLocation = (res) => {
  const location = res.data.city;
  getLocationKey(location);
};

const getLocationKey = (location) => {
  axios
  .get(`https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${API_KEY}&q=${location}`)
  .then((res) => getWeather(res.data[0].Key, location))
  .catch((err) => console.log(err));
}


const displayWeather = (res, location) => {
  const temperatureElement = document.getElementById("temperature");
  const locationElement = document.getElementById("location");
  const weatherIcon = document.getElementById("weather-icon");
    getIcon(weatherIcon, res)
  const weatherValue = res.data[0].Temperature.Metric.Value
  const unit = "&#8451;"
  const temperature = weatherValue + " " + unit
    temperatureElement.innerHTML = temperature;
    locationElement.textContent = location;

}

const getIcon = (weatherIcon, res) => {
  let iconNumber = res.data[0].WeatherIcon;
    iconNumber = iconNumber <= 9 ? "0" + iconNumber : iconNumber
  const link = `https://developer.accuweather.com/sites/default/files/${iconNumber}-s.png`
    weatherIcon.setAttribute("src", link)  
}


// ERROR HANDLING
function errorHandling() {
  console.log("Error Handling");
}


// INTERCEPTING REQUESTS & RESPONSES

// AXIOS INSTANCES

// Show output in browser
function showOutput(res) {
  document.getElementById("res").innerHTML = `
  <div class="card card-body mb-4">
    <h5>Status: ${res.status}</h5>
  </div>

  <div class="card mt-3">
    <div class="card-header">
      Headers
    </div>
    <div class="card-body">
      <pre>${JSON.stringify(res.headers, null, 2)}</pre>
    </div>
  </div>

  <div class="card mt-3">
    <div class="card-header">
      Data
    </div>
    <div class="card-body">
      <pre>${JSON.stringify(res.data, null, 2)}</pre>
    </div>
  </div>

  <div class="card mt-3">
    <div class="card-header">
      Config
    </div>
    <div class="card-body">
      <pre>${JSON.stringify(res.config, null, 2)}</pre>
    </div>
  </div>
`;
}

// Event listeners
document.addEventListener("DOMContentLoaded", getLocation);

// document.getElementById("error").addEventListener("click", errorHandling);
