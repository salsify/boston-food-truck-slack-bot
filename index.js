schedule = require('node-schedule');
request = require('request');
config = require('./config');
cheerio = require('cheerio');

raw_url = 'http://www.cityofboston.gov/foodtrucks/schedule-app-min.asp';

days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function sendSlackMessage(trucks) {
	var slack_message = buildSlackMessage(trucks);

	request.post({url: config.slack_url, body: slack_message}, function (error, response, body) {
		console.log(body);
	});
}

function buildSlackMessage(trucks) {
	var text = '';

	for (var location in trucks) {
		text = text + '*' + location + '*' + '\n';
		trucks_arr = trucks[location];
		for (var i = 0; i < trucks_arr.length; i++) {
			text = text + '> ' + trucks_arr[i] + '\n'
		}
	}

	var json_obj = {
		username: config.slack_bot_name,
		icon_emoji: config.slack_bot_emoji,
		text: text
	};

	return JSON.stringify(json_obj);
}

function sendList() {
    request(raw_url, function (error, response, body) {
        let $ = cheerio.load(body);
        let trucks = $(".trFoodTrucks");
        let today = days[(new Date()).getDay()];

        var todays_trucks_by_loc = []; // map of location to list of trucks

        trucks.each(function(i, obj) {
            let truck = $(trucks[i]);
            var location = truck.children(".loc").contents().filter(function(){ return this.nodeType == 3; }).last().text();
            // fix carousel name, which cheerio can't parse correctly because of the -
            if (location == "Carousel") {
                location = "Greenway, Carousel";
            }
            let time = truck.children(".tod").text();
            let day = truck.children(".dow").text();

            if (config.locations.includes(location) && time == "Lunch" && day == today) {
                let company = truck.children(".com").text();
                if (!(location in todays_trucks_by_loc)) {
                    todays_trucks_by_loc[location] = [company];
                } else {
                    todays_trucks_by_loc[location].push(company);
                }
            }
        });

        sendSlackMessage(todays_trucks_by_loc);
    });
}

schedule.scheduleJob(config.job_time, function(){
    sendList();
});