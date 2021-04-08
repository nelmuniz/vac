const express = require('express');
const fetch = require('node-fetch');

let app = express();

// Public folder
app.use(express.static('public'));

// Templates folder
app.set('views', './views');

// Templates engine
app.set('view engine', 'ejs');

// Router
app.use('*', async (req, res) => {

    let data;
    let dates_vaccinated = [];
    let fully_hundred = [];
    let people_hundred = [];
    let dates_daily = [];
    let daily = [];
    let last_date;
    let last_fully;
    let last_people;
    let last_daily;

    // Get JSON (https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json)
    await fetch("https://covid.ourworldindata.org/data/vaccinations/vaccinations.json", { method: "Get" })
        .then(res => res.json())
        .then((json) => {
            // Get Spain data
            data = json.find(c => c.country === "Spain").data;
        });

    // Iterate Spain data
    data.forEach((day) => {
        // If vaccination data informed
        if (day.people_fully_vaccinated_per_hundred != null ||
            day.people_vaccinated_per_hundred != null) {
            // Insert dates array
            dates_vaccinated.push(new String(`"` + day.date + `"`));
            // Insert fully vaccinated per hundred array
            fully_hundred.push(new String(`"` + day.people_fully_vaccinated_per_hundred + `"`));
            // Insert fully vaccinated per hundred array
            people_hundred.push(new String(`"` + day.people_vaccinated_per_hundred + `"`));
            // Insert daily vaccinations

        }
        // If daily vaccinations informed
        if (day.daily_vaccinations != null) {
            // Insert dates array
            dates_daily.push(new String(`"` + day.date + `"`));
            // Insert daily vaccinations array
            daily.push(new String(`"` + day.daily_vaccinations + `"`));
        }
    });

    // Last - Date
    last_date = data.reduce((a, b) => ((b.date > a.date) && (b.people_fully_vaccinated_per_hundred != null ||
        b.people_vaccinated_per_hundred != null ||
        b.daily_vaccinations != null)) ? b : a).date;

    // Last - People fully vaccinated per hundred
    last_fully = data.reduce((a, b) => ((b.date > a.date) && (b.people_fully_vaccinated_per_hundred != null)) ? b : a).people_fully_vaccinated_per_hundred;

    // Last - People vaccinated per hundred
    last_people = data.reduce((a, b) => ((b.date > a.date) && (b.people_vaccinated_per_hundred != null)) ? b : a).people_vaccinated_per_hundred;

    // Last - Daily vaccinations
    last_daily = data.reduce((a, b) => ((b.date > a.date) && (b.daily_vaccinations != null)) ? b : a).daily_vaccinations;

    // Render Index with Spain data
    res.render('index.ejs', {
        dates_vaccinated: dates_vaccinated,
        fully_hundred: fully_hundred,
        people_hundred: people_hundred,
        dates_daily: dates_daily,
        daily: daily,
        last_date: last_date,
        last_fully: last_fully,
        last_people: last_people,
        last_daily: last_daily
    })

});

// Start server
app.listen(8080);
console.log('Spain COVID-19 vaccination');
console.log('Server started: http://localhost:8080');