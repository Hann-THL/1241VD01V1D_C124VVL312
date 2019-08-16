const promise = require('bluebird');
const options = {
	promiseLib: promise,
	query: function (e) {
		console.log('\n[DEBUG-QUERY]: ', e.query);
		if (e.params) {
			console.log('[DEBUG-PARAMS]: ', e.params);
		}
		console.log('');
	}
}
const pgp = require('pg-promise')(options);
const connectionString = 'postgres://postgres:root@localhost:5432/data-analysisdb';
const db = pgp(connectionString);

module.exports = {
	db
}
