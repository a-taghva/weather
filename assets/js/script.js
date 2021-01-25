let cityInput = $("#city-search");
let searchBtn = $(".search-btn");
const apiKey = '2408a1d36393718a3319e00c5a057fac';
let savedCities = [];
let listEl;
let resultDiv = $(".result");
let todayDivEl = $(".result-today");
let resultForecastDiv = $(".result-forecast");
let today = moment().format(" (DD/MM/YYYY)");

$(searchBtn).on("click", (event) => {
    event.preventDefault();

    let cityName = $(cityInput)
        .val()
        .trim();

    if (cityName) {
        $(cityInput).val("");
        searchCity(cityName);
    } else {
        alert("Seriously dude?? You gotta enter a city name...");
    }
});

function createResultSection(ctname, date, temp, humid, ws, uv) {
    //$(".result").html("");
    todayDivEl.addClass("border");

    let h2El = $("<h2>")
        .css("margin-bottom", "20px")
        .append($("<span>")
            .attr("id", "city-name")
            .text(ctname))
        .append($("<span>")
            .attr("id", "date")
            .text(date))
        .append($("<span>")
            .attr("id", "status-icon"));

    let tempEl = $("<p>")
        .text("Tempereature: ")
        .append($("<span>")
            .attr("id", "temperature")
            .text(temp));

    let humidityEl = $("<p>")
        .text("Humidity: ")
        .append($("<span>")
            .attr("id", "humidity")
            .text(humid));

    let windEl = $("<p>")
        .text("Wind Speed: ")
        .append($("<span>")
            .attr("id", "wind-speed")
            .text(ws));

    let uvEl = $("<p>")
        .text("UV Index: ")
        .append($("<span>")
            .attr("id", "uv-index")
            .addClass("badge badge-danger")
            .text(uv));

    todayDivEl.append(h2El, tempEl, humidityEl, windEl, uvEl);
}

function createForecastSection(date, temp, humid) {
    let cardDivEl = $("<div>")
        .addClass("card bg-primary text-light p-2 col-auto mt-2");

    let cardTitle = $("<h4>")
        .addClass("card-title")
        .text(date);

    let statusIcon = $("<div>")
        .addClass("status-icon");

    let tempEl = $("<p>")
        .addClass("card-text")
        .text(`Temp: ${temp}`);

    let humidEl = $("<p>")
        .addClass("card-text")
        .text(`Humidity: ${humid}`);

    cardDivEl.append(cardTitle, statusIcon, tempEl, humidEl);
    resultForecastDiv.append(cardDivEl);
}

function createSearchedCitiesSection(ctArr) {
    let divEl = $(".searched-cities");
    let ulEl = $(".list-group");

    for (let i = ctArr.length - 1; i >= 0; i--) {
        let liEl = $("<li>")
            .addClass("list-group-item")
            .text(ctArr[i]);
        ulEl.append(liEl);
    }

    listItemEl = $('.list-group-item');

}

function addSearchCityLi (ctname) {
    let ulEl = $("ul");
    let liEl = $("<li>")
        .addClass("list-group-item")
        .text(ctname);

    ulEl.prepend(liEl);
    listItemEl = $('list-group-item');
}

function saveCity(ctname) {
    isIncluded = false;
    for (let i = 0; i < savedCities.length; i++) {
        (savedCities[i] == ctname) && (isIncluded = true);
    }

    if (!isIncluded) {
        savedCities.push(ctname);
        localStorage.setItem("cities", JSON.stringify(savedCities));
    }
}

function loadCities() {
    savedCities = JSON.parse(localStorage.getItem("cities"));
    if (!savedCities) {
        savedCities = [];
    }
}


function searchCity(cityName) {
    let apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
    fetch(apiUrl).then(response => {
        if (response.ok) {
            response.json().then(data => {
                let cityName = data.name;
                addSearchCityLi(cityName);
                let temp = (data.main.temp - 273.15).toFixed(2);
                let wind = data.wind.speed;
                let humidity = data.main.humidity;

                let lat = data.coord.lat;
                let lon = data.coord.lon;
                let uvIndexUrl = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`

                fetch(uvIndexUrl).then(response => {
                    if (response.ok) {
                        response.json().then(data => {
                            let uvIndex = data.value;
                            createResultSection(cityName, today, temp, humidity, wind, uvIndex)
                        })
                    }
                });


                let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`;
                fetch(forecastUrl).then(response => {
                    if (response.ok) {
                        response.json().then(data => {
                            for (let i = 0; i < 5; i++) {
                                let thisDay = data.list[i*8 + 3];
                                let date = moment().add(i+1, 'days').format("MM/DD/YYYY");
                                let temp = thisDay.main.temp;
                                let humidity = thisDay.main.humidity;
                                let icon = thisDay.weather.icon;
                                createForecastSection(date, temp, humidity);
                            }

                        })
                    }
                });
                debugger;
            saveCity(cityName);
            })
        } else {
            alert("City not found Error: " + response.statusText);
        }
    })
}

$(listEl).on("click", ()=> {
    alert("clicked");
})

loadCities();
createSearchedCitiesSection(savedCities);

