const commonUtils = require('../helpers/utils/CommonUtils');

function generateUUID(UUID_CODE, tableName) {
	const UUID_LENGTH = 15;
	const PERIOD_LENGTH = 6;
	const PAD_CHAR = "'0'";
	const PADL_COUNT = UUID_LENGTH - UUID_CODE.length - PERIOD_LENGTH;
	const SUBSTR_INDEX = UUID_LENGTH - PADL_COUNT + 1;

	const UUID_PERIOD = "TO_CHAR(CURRENT_TIMESTAMP, 'YYMMDD')";
	const UUID_PREFIX = "'" + UUID_CODE + "' || " + UUID_PERIOD;
	const DEFAULT_UUID = UUID_PREFIX + " || LPAD('1', " + PADL_COUNT + ", " + PAD_CHAR + ")";
	const NEW_UUID =  UUID_PREFIX + " || LPAD((SUBSTRING(MAX(uuid), " + SUBSTR_INDEX + ")::BigInt + 1)::Text, " + PADL_COUNT + ", " + PAD_CHAR + ")";

	return commonUtils.formatQuery(`
		SELECT COALESCE(` + NEW_UUID + `, ` + DEFAULT_UUID + `) AS next_uuid
		FROM ` + tableName + `
		WHERE uuid LIKE ` + UUID_PREFIX + ` || '%'`);
}

function filter(tableAlias, { id, statusCode, createdBy, createdDt, updatedBy, updatedDt, uuid }) {
	var filterParams = " AND " + tableAlias + ".status_code = " + (!commonUtils.isBlank(statusCode) ? "${statusCode}" : "'A'");

	if (!commonUtils.isBlank(id))
		filterParams += " AND " + tableAlias + ".id = ${id}";

	if (!commonUtils.isBlank(createdBy))
		filterParams += " AND " + tableAlias + ".created_by = ${createdBy}";

	if (!commonUtils.isBlank(createdDt))
		filterParams += " AND DATE(" + tableAlias + ".created_dt) = DATE(${createdDt})";

	if (!commonUtils.isBlank(updatedBy))
		filterParams += " AND " + tableAlias + ".updated_by = ${updatedBy}";

	if (!commonUtils.isBlank(updatedDt))
		filterParams += " AND DATE(" + tableAlias + ".updated_dt) = DATE(${updatedDt})";

	if (!commonUtils.isBlank(uuid))
		filterParams += " AND " + tableAlias + ".uuid = ${uuid}";
	return filterParams;
}

function formatFilter(filterParams) {
	if (!commonUtils.isBlank(filterParams)) {
		if (filterParams.trim().startsWith('AND '))
			filterParams = filterParams.trim().substring(3);

		if (!filterParams.trim().startsWith('WHERE '))
			filterParams = "WHERE " + filterParams.trim();
	}
	return filterParams;
}

function sort(tableAlias, { orderBy, sortOrder }) {
	var sortParams = "";
	if (!commonUtils.isBlank(orderBy)) {
		sortOrder = !commonUtils.isBlank(sortOrder) ? sortOrder : "ASC";

		switch (orderBy) {
			case 'id':
				return tableAlias + ".id " + sortOrder;

			case 'status_code':
				return tableAlias + ".status_code " + sortOrder;

			case 'created_by':
				return tableAlias + ".created_by " + sortOrder;

			case 'created_dt':
				return tableAlias + ".created_dt " + sortOrder;

			case 'updated_by':
				return tableAlias + ".updated_by " + sortOrder;

			case 'updated_dt':
				return tableAlias + ".updated_dt " + sortOrder;

			case 'uuid':
				return tableAlias + ".uuid " + sortOrder;

			default:
				return sortParams;
		}
	}
	return sortParams;
}

function formatSort(sortParams) {
	if (!commonUtils.isBlank(sortParams)) {
		if (!sortParams.trim().startsWith('ORDER BY '))
			sortParams = "ORDER BY " + sortParams.trim();
	}
	return sortParams;
}

module.exports = {
	generateUUID,
	filter,
	formatFilter,
	sort,
	formatSort
}