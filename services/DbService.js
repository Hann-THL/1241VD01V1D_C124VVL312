const dbConfig = require('../config/db-config');
const db = dbConfig.db;

/*
 * Filters Formatting:
 * 1. :name
 *    queryString = 'SELECT $1:name FROM $2:name'
 *    valueParams = ['*', 'table']
 *    result = SELECT * FROM "table"
 *
 * 2. :alias
 *    queryString = 'SELECT full_name as $1:alias FROM $2:name'
 *    valueParams = ['name', 'table']
 *    result = SELECT full_name as name FROM "table"
 *
 * 3. :raw
 *    queryString = 'SELECT * FROM products $1:raw'
 *    valueParams = 'WHERE price BETWEEN 5 AND 10'
 *    result = SELECT * FROM products WHERE price BETWEEN 5 AND 10
 *
 * 4. :value
 *    queryString = "SELECT * FROM table WHERE name LIKE '%$1:value%'"
 *    valueParams = 'John'
 *    result = SELECT * FROM table WHERE name LIKE '%John%'
 *
 * 5. :csv / :list
 *    queryString = 'INSERT INTO table($1:name) VALUES($1:list)'
 *    valueParams = {first: 123, second: 'text'}
 *    result = INSERT INTO table("first", "second") VALUES(123, 'text')
 *
 * 6. :json
 *    - explicit JSON formatting is applied to the value.
 */

function getList(queryString, valueParams) {
	return new Promise(function(resolve, reject) {
		db
		.any(queryString, valueParams)
		.then(function(data) {
			resolve(data);
		})
		.catch(function(err) {
			reject(new Error(err));
		})
	});
}

function getListOrError(queryString, valueParams) {
	return new Promise(function(resolve, reject) {
		db
		.many(queryString, valueParams)
		.then(function(data) {
			resolve(data);
		})
		.catch(function(err) {
			reject(new Error(err));
		})
	});
}

function getOne(queryString, valueParams) {
	return new Promise(function(resolve, reject) {
		db
		.oneOrNone(queryString, valueParams)
		.then(function(data) {
			resolve(data);
		})
		.catch(function(err) {
			reject(new Error(err));
		})
	});
}

function getOneOrError(queryString, valueParams) {
	return new Promise(function(resolve, reject) {
		db
		.one(queryString, valueParams)
		.then(function(data) {
			resolve(data);
		})
		.catch(function(err) {
			reject(new Error(err));
		})
	});
}

function executeAction(queryString, valueParams) {
	return new Promise(function(resolve, reject) {
		db
		.result(queryString, valueParams)
		.then(function(result) {
			resolve(result);
		})
		.catch(function(err) {
			reject(new Error(err));
		})
	});
}

module.exports = {
	getList,
	getListOrError,
	getOne,
	getOneOrError,
	executeAction
}
