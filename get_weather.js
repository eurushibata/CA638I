#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const lat = 53.3498;
const lon = -6.2603;
const appid = "";

const initial_dt = 1714672800; // Thu May 02 2024 19:00:00 GMT+0100 (Irish Standard Time)
// const end_dt = 1714708800; //	Thu May 02 2024 19:10:00 GMT+0100 (Irish Standard Time) simulated
const end_dt = 1717196100; //	Fri May 31 2024 23:55:00 GMT+0100 (Irish Standard Time)
const intervalInSeconds = 30 * 60;

// const api_url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${appid}`;

const finalResults = new Map();

/**
 * Converts a Unix timestamp to a formatted date string.
 *
 * @param {number} timestamp - The Unix timestamp to convert.
 * @returns {string} - The formatted date string in YYYY-MM-DD HH:MM:SS format.
 */
function formatTimestamp(timestamp) {
  // Create a new Date object from the timestamp (Note: multiply by 1000 to convert seconds to milliseconds)
  const date = new Date(timestamp * 1000);

  // Function to pad single digit numbers with a leading zero
  const pad = (num) => (num < 10 ? '0' : '') + num;

  // Extract parts of the date
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are zero-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Format the date as YYYY-MM-DD HH:MM:SS
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function makeCall(dt) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?units=metric&lat=${lat}&lon=${lon}&dt=${dt}&appid=${appid}`;

  // Call the API using axios
  axios.get(apiUrl)
    .then(response => {
      // Handle the successful response
      // console.log('Status Code:', response.status);
      // console.log('Response Data:', response.data);
      const formattedDate = formatTimestamp(dt);
      console.log(formattedDate); // Output: 2024-05-02 19:00:00

      // finalResults.set(formattedDate, );

      resolve({date: formattedDate, data: {
        temp: response.data.data[0].temp,
        feels_like: response.data.data[0].feels_like,
        pressure: response.data.data[0].pressure,
        humidity: response.data.data[0].humidity,
        dew_point: response.data.data[0].dew_point,
        clouds: response.data.data[0].clouds,
        visibility: response.data.data[0].visibility,
        wind_speed: response.data.data[0].wind_speed,
        wind_deg: response.data.data[0].wind_deg,
        weather_main: response.data.data[0].weather[0].main,
        weather_description: response.data.data[0].weather[0].description
      } });
    })
    .catch(error => {
      // Handle any errors
      console.error('Error:', error);
    });
  })
}

async function start() {
  dt = initial_dt;

  while (dt < end_dt) {
    const res = await makeCall(dt);
    finalResults.set(res.date, res.data);
    dt += intervalInSeconds;
  }
  // console.log(finalResults);

  // Convert the Map to an array of objects suitable for CSV writing
  const dataArray = Array.from(finalResults, ([key, value]) => (
    {
      key,
      temp: value.temp,
      feels_like: value.feels_like,
      pressure: value.pressure,
      humidity: value.humidity,
      dew_point: value.dew_point,
      clouds: value.clouds,
      visibility: value.visibility,
      wind_speed: value.wind_speed,
      wind_deg: value.wind_deg,
      weather_main: value.weather_main,
      weather_description: value.weather_description,
    }));

  // Define the CSV writer
  const csvWriter = createCsvWriter({
    path: 'data/weather_dublin.csv',
    header: [
      { id: 'key', title: 'date' },
      { id: 'temp', title: 'temp' },
      { id: 'feels_like', title: 'feels_like' },
      { id: 'pressure', title: 'pressure' },
      { id: 'humidity', title: 'humidity' },
      { id: 'dew_point', title: 'dew_point' },
      { id: 'clouds', title: 'clouds' },
      { id: 'visibility', title: 'visibility' },
      { id: 'wind_speed', title: 'wind_speed' },
      { id: 'wind_deg', title: 'wind_deg' },
      { id: 'weather_main', title: 'weather_main' },
      { id: 'weather_description', title: 'weather_description' }
    ]
  });

  // Write the data to the CSV file
  csvWriter.writeRecords(dataArray)
  .then(() => {
    console.log('CSV file was written successfully');
  })
  .catch(err => {
    console.error('Error writing CSV file', err);
  });
}

start();

