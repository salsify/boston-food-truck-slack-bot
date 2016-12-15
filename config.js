var config = {};

config.locations =  [
	'Financial District, Pearl Street at Franklin',
	'Financial District, Milk and Kilby Streets',
	'Carousel',
	'City Hall Plaza, Fisher Park'
];

// The incoming Slack webhook URL.
config.slack_url = process.env.SLACK_URL || 'https://slack_webhook_url_goes_here';
config.job_time = process.env.JOB_TIME || '00 16 * * 1-5';

config.slack_bot_name = 'FoodTruckBot';
config.slack_bot_emoji = ':truck:';

module.exports = config;
