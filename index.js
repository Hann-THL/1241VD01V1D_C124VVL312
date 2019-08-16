const serverConfig = require('./config/server-config');

const result4DController = require('./routes/4D/Result4DController');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/4D', result4DController);

var port = process.env.port || serverConfig._SERVER_PORT();
app.listen(port, function() {
	console.log('Server listening on port ' + port);
});
