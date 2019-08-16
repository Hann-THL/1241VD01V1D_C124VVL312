const baseQuery = require('../base-query');
const commonUtils = require('../../helpers/utils/CommonUtils');

// UUID
function _NEXT_UUID() {
	const UUID_CODE = "R4D";
	return baseQuery.generateUUID(UUID_CODE, 'result_4d');
}

// FILTER
function filter({
		// default filter
		id, statusCode, createdBy, createdDt, updatedBy, updatedDt, uuid,
		companyCode, drawDate, drawNo,

		// additional filter
		dateFrom, dateTo
	}) {

	var filterParams = baseQuery.filter('r4d', {
		id, statusCode, createdBy, createdDt, updatedBy, updatedDt, uuid
	});

	if (!commonUtils.isBlank(companyCode))
		filterParams += " AND r4d.company_code = ${companyCode}";

	if (!commonUtils.isBlank(drawDate))
		filterParams += " AND DATE(r4d.draw_date) = DATE(${drawDate})";

	if (!commonUtils.isBlank(drawNo))
		filterParams += " AND r4d.draw_no = ${drawNo}";

	if (!commonUtils.isBlank(dateFrom) && !commonUtils.isBlank(dateTo))
		filterParams += " AND DATE(r4d.draw_date) BETWEEN DATE(${dateFrom}) AND DATE(${dateTo})";

	return baseQuery.formatFilter(filterParams);
}

// ORDER
const ORDER_CATEGORY = `
	CASE
		WHEN r4dn.category = 'FST' THEN 1
		WHEN r4dn.category = 'SCD' THEN 2
		WHEN r4dn.category = 'TRD' THEN 3
		WHEN r4dn.category = 'SP' THEN 4
		WHEN r4dn.category = 'CONS' THEN 5
		ELSE 99
	END
`;

// COUNT
const COUNT = `
	SELECT COUNT(1) AS row_count
	FROM result_4d r4d
	\${WHERE_FILTER}
`;

function _COUNT() {
	return commonUtils.formatQuery(COUNT);
}

// SELECT
const SELECT = `
	SELECT *
	FROM result_4d r4d
	\${WHERE_FILTER}
`;
const SELECT_LATEST_DATE = `
	SELECT COALESCE(MAX(draw_date), '1985-04-25') AS lastest_date
	FROM result_4d r4d
	\${WHERE_FILTER}
`;
const SELECT_4D_RESULT = `
	SELECT
		r4d.company_code,
		TO_CHAR(r4d.draw_date, 'YYYY-MM-DD') AS draw_date,
		r4d.draw_no,
		(
			SELECT
				json_agg(
					json_build_object(
						'number', r4dn.number,
						'category', r4dn.category,
						'position', r4dn.position
					)
					ORDER BY (
						${ORDER_CATEGORY}, r4dn.position
					) ASC
				)
		) AS numbers
	FROM result_4d r4d
	LEFT JOIN result_4d_number r4dn ON r4dn.id_result = r4d.uuid
		AND r4dn.status_code = r4d.status_code
	\${WHERE_FILTER}
	GROUP BY r4d.uuid
`;
const SELECT_4D_RESULT_FLAT = `
	SELECT
		TO_CHAR(r4d.draw_date, 'YYYY-MM-DD') AS draw_date,
		r4d.company_code,
		r4dn.number,
		r4dn.category,
		r4dn.position
	FROM result_4d r4d
	LEFT JOIN result_4d_number r4dn ON r4dn.id_result = r4d.uuid
		AND r4dn.status_code = r4d.status_code
	\${WHERE_FILTER}
	ORDER BY r4d.draw_date, r4d.company_code, ${ORDER_CATEGORY}, r4dn.position
`;

function _SELECT() {
	return commonUtils.formatQuery(SELECT);
}

function _SELECT_LATEST_DATE() {
	return commonUtils.formatQuery(SELECT_LATEST_DATE);
}

function _SELECT_4D_RESULT() {
	return commonUtils.formatQuery(SELECT_4D_RESULT);
}

function _SELECT_4D_RESULT_FLAT() {
	return commonUtils.formatQuery(SELECT_4D_RESULT_FLAT);
}

// INSERT
const INSERT = `
	INSERT INTO result_4d (created_by, updated_by,
		uuid, company_code, draw_date, draw_no)
	VALUES (\${createdBy}, \${updatedBy},
		\${uuid}, \${companyCode}, \${drawDate}, \${drawNo})
`;

function _INSERT() {
	return commonUtils.formatQuery(INSERT);
}

module.exports = {
	filter,
	_NEXT_UUID,
	_COUNT,

	_SELECT,
	_SELECT_LATEST_DATE,
	_SELECT_4D_RESULT,
	_SELECT_4D_RESULT_FLAT,

	_INSERT
}