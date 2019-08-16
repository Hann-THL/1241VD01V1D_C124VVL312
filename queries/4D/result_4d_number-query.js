const baseQuery = require('../base-query');
const commonUtils = require('../../helpers/utils/CommonUtils');

// FILTER
function filter({
		// default filter
		id, statusCode, createdBy, createdDt, updatedBy, updatedDt, uuid,
		idResult, number, category, position,

		// additional filter
		dateFrom, dateTo
	}) {

	var filterParams = baseQuery.filter('r4dn', {
		id, statusCode, createdBy, createdDt, updatedBy, updatedDt, uuid
	});

	if (!commonUtils.isBlank(idResult))
		filterParams += " AND r4dn.id_result = ${idResult}";

	if (!commonUtils.isBlank(number))
		filterParams += " AND r4dn.number = ${number}";

	if (!commonUtils.isBlank(category))
		filterParams += " AND r4dn.category = ${category}";

	if (!commonUtils.isBlank(position))
		filterParams += " AND r4dn.position = ${position}";

	if (!commonUtils.isBlank(dateFrom) && !commonUtils.isBlank(dateTo))
		filterParams += " AND DATE(r4d.draw_date) BETWEEN DATE(${dateFrom}) AND DATE(${dateTo})";

	return baseQuery.formatFilter(filterParams);
}

// ORDER
function sort({ orderBy, sortOrder }) {
	var sortParams = baseQuery.sort('r4dn', { orderBy, sortOrder });

	if (!commonUtils.isBlank(orderBy)) {
		sortOrder = !commonUtils.isBlank(sortOrder) ? sortOrder : "";

		switch (orderBy) {
			// default sort
			case 'id_result':
				sortParams = tableAlias + ".id_result " + sortOrder;
				break;

			case 'number':
				sortParams = tableAlias + ".number " + sortOrder;
				break;

			case 'category':
				sortParams = tableAlias + ".category " + sortOrder;
				break;

			case 'position':
				sortParams = tableAlias + ".position " + sortOrder;
				break;

			// additional sort
			case 'total_occurrence':
				sortParams = "total_occurrence " + sortOrder;
				break;

			case 'first_occurrence':
				sortParams = "first_occurrence " + sortOrder;
				break;

			case 'second_occurrence':
				sortParams = "second_occurrence " + sortOrder;
				break;

			case 'third_occurrence':
				sortParams = "third_occurrence " + sortOrder;
				break;

			case 'special_occurrence':
				sortParams = "special_occurrence " + sortOrder;
				break;

			case 'consolation_occurrence':
				sortParams = "consolation_occurrence " + sortOrder;
				break;
		}
	}
	return baseQuery.formatSort(sortParams);
}

// COUNT
const COUNT = `
	SELECT COUNT(1) AS row_count
	FROM result_4d_number r4dn
	\${WHERE_FILTER}
`;

function _COUNT() {
	return commonUtils.formatQuery(COUNT);
}

// SELECT
const SELECT = `
	SELECT *
	FROM result_4d_number r4dn
	\${WHERE_FILTER}
`;

const SELECT_4D_NUMBER_OCCURRENCE = `
	SELECT
		r4dn.number,
		COUNT(1) AS total_occurrence,
		COUNT(1) FILTER(WHERE r4dn.category = 'FST') AS first_occurrence,
		COUNT(1) FILTER(WHERE r4dn.category = 'SCD') AS second_occurrence,
		COUNT(1) FILTER(WHERE r4dn.category = 'TRD') AS third_occurrence,
		COUNT(1) FILTER(WHERE r4dn.category = 'SP') AS special_occurrence,
		COUNT(1) FILTER(WHERE r4dn.category = 'CONS') AS consolation_occurrence,
		json_agg(
			json_build_object(
				'draw_date', r4d.draw_date,
				'category', r4dn.category
			)
			ORDER BY CASE
				WHEN category = 'FST' THEN 1
				WHEN category = 'SCD' THEN 2
				WHEN category = 'TRD' THEN 3
				WHEN category = 'SP' THEN 4
				WHEN category = 'CONS' THEN 5
				ELSE 99
			END ASC, r4d.draw_date DESC
		) AS draw_result
	FROM result_4d_number r4dn
	INNER JOIN result_4d r4d ON r4d.uuid = r4dn.id_result
		AND r4d.status_code = r4dn.status_code
		AND r4dn.number != '----'
	\${WHERE_FILTER}
	GROUP BY r4dn.number
	\${SORT_ARRANGE}
`;

const SELECT_4D_DIGIT_OCCURRENCE = `
	SELECT TO_CHAR(r4d.draw_date, 'YYYY-MM-DD') AS draw_date,
		json_build_object(
			'total',
			json_build_object(
				'digit_0', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '0', ''))) / CHAR_LENGTH('0')),
				'digit_1', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '1', ''))) / CHAR_LENGTH('1')),
				'digit_2', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '2', ''))) / CHAR_LENGTH('2')),
				'digit_3', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '3', ''))) / CHAR_LENGTH('3')),
				'digit_4', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '4', ''))) / CHAR_LENGTH('4')),
				'digit_5', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '5', ''))) / CHAR_LENGTH('5')),
				'digit_6', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '6', ''))) / CHAR_LENGTH('6')),
				'digit_7', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '7', ''))) / CHAR_LENGTH('7')),
				'digit_8', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '8', ''))) / CHAR_LENGTH('8')),
				'digit_9', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '9', ''))) / CHAR_LENGTH('9'))
			),
			'top_3',
			json_build_object(
				'digit_0', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '0', ''))) / CHAR_LENGTH('0')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_1', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '1', ''))) / CHAR_LENGTH('1')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_2', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '2', ''))) / CHAR_LENGTH('2')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_3', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '3', ''))) / CHAR_LENGTH('3')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_4', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '4', ''))) / CHAR_LENGTH('4')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_5', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '5', ''))) / CHAR_LENGTH('5')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_6', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '6', ''))) / CHAR_LENGTH('6')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_7', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '7', ''))) / CHAR_LENGTH('7')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_8', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '8', ''))) / CHAR_LENGTH('8')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD')),
				'digit_9', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '9', ''))) / CHAR_LENGTH('9')) FILTER(WHERE r4dn.category IN ('FST', 'SCD', 'TRD'))
			),
			'special',
			json_build_object(
				'digit_0', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '0', ''))) / CHAR_LENGTH('0')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_1', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '1', ''))) / CHAR_LENGTH('1')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_2', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '2', ''))) / CHAR_LENGTH('2')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_3', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '3', ''))) / CHAR_LENGTH('3')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_4', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '4', ''))) / CHAR_LENGTH('4')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_5', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '5', ''))) / CHAR_LENGTH('5')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_6', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '6', ''))) / CHAR_LENGTH('6')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_7', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '7', ''))) / CHAR_LENGTH('7')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_8', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '8', ''))) / CHAR_LENGTH('8')) FILTER(WHERE r4dn.category = 'SP'),
				'digit_9', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '9', ''))) / CHAR_LENGTH('9')) FILTER(WHERE r4dn.category = 'SP')
			),
			'consolation',
			json_build_object(
				'digit_0', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '0', ''))) / CHAR_LENGTH('0')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_1', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '1', ''))) / CHAR_LENGTH('1')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_2', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '2', ''))) / CHAR_LENGTH('2')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_3', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '3', ''))) / CHAR_LENGTH('3')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_4', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '4', ''))) / CHAR_LENGTH('4')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_5', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '5', ''))) / CHAR_LENGTH('5')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_6', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '6', ''))) / CHAR_LENGTH('6')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_7', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '7', ''))) / CHAR_LENGTH('7')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_8', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '8', ''))) / CHAR_LENGTH('8')) FILTER(WHERE r4dn.category = 'CONS'),
				'digit_9', SUM((CHAR_LENGTH(r4dn.number) - CHAR_LENGTH(REPLACE(r4dn.number, '9', ''))) / CHAR_LENGTH('9')) FILTER(WHERE r4dn.category = 'CONS')
			)
		) AS digit_occurrence
	FROM result_4d_number r4dn
	INNER JOIN result_4d r4d ON r4d.uuid = r4dn.id_result
		AND r4d.status_code = r4dn.status_code
	\${WHERE_FILTER}
	GROUP BY r4d.draw_date
`;

function _SELECT() {
	return commonUtils.formatQuery(SELECT);
}

function _SELECT_4D_NUMBER_OCCURRENCE() {
	return commonUtils.formatQuery(SELECT_4D_NUMBER_OCCURRENCE);
}

function _SELECT_4D_DIGIT_OCCURRENCE() {
	return commonUtils.formatQuery(SELECT_4D_DIGIT_OCCURRENCE);
}

// INSERT
const INSERT = `
	INSERT INTO result_4d_number (created_by, updated_by,
		id_result, number, category, position)
	VALUES (\${createdBy}, \${updatedBy},
		\${idResult}, \${number}, \${category}, \${position})
`;

function _INSERT() {
	return commonUtils.formatQuery(INSERT);
}

module.exports = {
	filter,
	sort,

	_COUNT,

	_SELECT,
	_SELECT_4D_NUMBER_OCCURRENCE,
	_SELECT_4D_DIGIT_OCCURRENCE,

	_INSERT
}