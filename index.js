const express = require('express');
const moment = require("moment-timezone");
const fs = require('fs');
const app = express();

const schedule = {
    Friday: [
        {
        period: 0,
        start: "22:00",
        end: "22:50",
        "subject-code": "",
        "subject-name": "idk",
        room: 0,
        teacher: "-",
        }
    ]
}
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/gpt3', (req, res) => {
    res.send('Hello, World!');
});

// Define a route to read and serve the use.json file
app.get('/json', (req, res) => {
    // Read the use.json file
    fs.readFile('use.json', 'utf8', (err, data) => {
        if (err) {
            // If there's an error reading the file, send an error response
            console.error('Error reading use.json:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Send the contents of the use.json file as a JSON response
        res.json(JSON.parse(data));
    });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
});

// Function to get the current day and time in Bangkok timezone
function getCurrentDayAndTime() {
    const now = moment().tz("Asia/Bangkok");
    const day = now.format("dddd");
    const time = parseInt(now.format("HHmm"), 10);
    // const day = 'Monday'
    // const time = parseInt(`0920`, 10);
    return { day, time };
  }
  
  function getCurrentPeriod() {
    const { day, time } = getCurrentDayAndTime();
  
    console.log(`day: ${day}, time: ${time}`);
  
    if (schedule.hasOwnProperty(day)) {
      const currentSchedule = schedule[day];
      for (const period of currentSchedule) {
        const startTime = parseInt(period.start.replace(":", ""), 10);
        const endTime = parseInt(period.end.replace(":", ""), 10);
  
        if (time >= startTime && time < endTime) {
          return period;
        }
      }
      return { message: "No class found" };
    } else {
      return { message: "No schedule available for today" };
    }
  }
  
  // Express route to handle requests
  app.get('/', (req, res) => {
    res.json(schedule)
  })
  
  app.get("/now/", (req, res) => {
    res.json(getCurrentPeriod());
  });
  app.get("/next/", (req, res) => {
    const { day } = getCurrentDayAndTime();
    const next = schedule[day].find(
      (current) => current.period === getCurrentPeriod().period + 1,
    );
  
    res.json(next);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
