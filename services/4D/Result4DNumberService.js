const dbService = require('../../services/DbService');
const result4DNumberQuery = require('../../queries/4D/result_4d_number-query');

const commonUtils = require('../../helpers/utils/CommonUtils');

async function saveList(idResult, voList) {
	var result;
	for (var vo of voList) {
		vo.idResult = idResult;
		result += await save(vo);
	}
	return result;
}

async function save({ idResult, number, category, position }) {
	var queryString = '';
	var whereFilter = '';
	var valueParams = {};
	var result;

	try {
		valueParams = { idResult, number, category, position };
		queryString = result4DNumberQuery._COUNT();
		whereFilter = result4DNumberQuery.filter(valueParams);

		queryString = queryString.replace('${WHERE_FILTER}', whereFilter);
		result = await dbService.getOneOrError(queryString, valueParams);

		if (result.row_count != 0)
			return 0;

		queryString = result4DNumberQuery._INSERT();
		valueParams = {
			idResult, number, category, position,
			createdBy: 'SYSTEM', updatedBy: 'SYSTEM'
		};
		result = await dbService.executeAction(queryString, valueParams);
		return result.rowCount;

	} catch (error) {
		throw Error(error);
	}
}

async function get4DNumberOccurrence({ dateFrom, dateTo, number }, { orderBy, sortOrder }) {
	var queryString = '';
	var whereFilter = '';
	var valueParams = {};
	var sortArrange = '';
	var sortParams = {};
	var result;

	try {
		valueParams = { dateFrom, dateTo, number };
		queryString = result4DNumberQuery._SELECT_4D_NUMBER_OCCURRENCE();
		whereFilter = result4DNumberQuery.filter(valueParams);
		sortParams = {
			orderBy: commonUtils.isBlank(orderBy) ? 'total_occurrence' : orderBy,
			sortOrder: commonUtils.isBlank(sortOrder) ? 'DESC' : sortOrder,
		};
		sortArrange = result4DNumberQuery.sort(sortParams);

		queryString = queryString.replace('${WHERE_FILTER}', whereFilter);
		queryString = queryString.replace('${SORT_ARRANGE}', sortArrange);
		result = await dbService.getList(queryString, valueParams);
		return result;

	} catch (error) {
		throw Error(error);
	}
}

async function get4DDigitOccurrence({ dateFrom, dateTo }) {
	var queryString = '';
	var whereFilter = '';
	var valueParams = {};
	var result;

	try {
		valueParams = { dateFrom, dateTo };
		queryString = result4DNumberQuery._SELECT_4D_DIGIT_OCCURRENCE();
		whereFilter = result4DNumberQuery.filter(valueParams);

		queryString = queryString.replace('${WHERE_FILTER}', whereFilter);
		result = await dbService.getList(queryString, valueParams);
		return result;

	} catch (error) {
		throw Error(error);
	}
}

module.exports = {
	saveList,
	get4DNumberOccurrence,
	get4DDigitOccurrence
}