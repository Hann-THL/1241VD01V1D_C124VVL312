const dbService = require('../../services/DbService');
const result4DQuery = require('../../queries/4D/result_4d-query');

const result4DNumberService = require('../../services/4D/Result4DNumberService');
const constantResult4D = require('../../helpers/4D/ConstantResult4D');

const commonUtils = require('../../helpers/utils/CommonUtils');

const requestPromise = require('request-promise');
const moment = require('moment');

async function update4DResult() {
	var queryString = result4DQuery._SELECT_LATEST_DATE();
	var whereFilter = '';
	var valueParams = {};

	queryString = queryString.replace('${WHERE_FILTER}', whereFilter);
	var result = await dbService.getOneOrError(queryString, valueParams);

	var dateFrom = moment(result.lastest_date);
	var dateTo = moment();

	for (var drawDate = dateFrom.clone(); drawDate.diff(dateTo, 'days') <= 0; drawDate.add(1, 'days')) {
		var options = {
			// alternative URL: https://www.check4d.com/genwestjson.php?drawpastdate=1985-04-25
			url: 'http://www.4dking.com.my/past_result_json.php?draw_date=' + drawDate.format('YYYY-MM-DD'),
			json: true,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
			}
		};

		console.log('[DEBUG] ', options.url);

		await requestPromise(options)
		.then(async(result) => {
			// Magnum
			var magnumData = result.filter((item) => { return item.t == 'M'; });
			if (!commonUtils.isBlank(magnumData)) {
				var magnum4DVO = generateVO(magnumData);
				await save(magnum4DVO);
			}

			// Sports Toto
			var sportsTotoData = result.filter((item) => { return item.t == 'ST'; });
			if (!commonUtils.isBlank(sportsTotoData)) {
				var sportsToto4DVO = generateVO(sportsTotoData);
				await save(sportsToto4DVO);
			}

			// Da Ma Cai
			var damacaiData = result.filter((item) => { return item.t == 'PMP'; });
			if (!commonUtils.isBlank(damacaiData)) {
				var damacai4DVO = generateVO(damacaiData);
				await save(damacai4DVO);
			}
		})
		.catch((error) => {
			throw Error(error);
		});
	}

	return `4D result updated successfully from ${dateFrom.format('YYYY-MM-DD')} to ${dateTo.format('YYYY-MM-DD')}.`;
}

function generateVO(data) {
	// result_4d data
	var companyCode;
	switch(data[0].t) {
		case 'M':
			companyCode = constantResult4D._COMPANY_MAGNUM();
			break;

		case 'ST':
			companyCode = constantResult4D._COMPANY_SPORTS_TOTO();
			break;

		case 'PMP':
			companyCode = constantResult4D._COMPANY_DAMACAI();
			break;
	}
	var drawNo = data.find(item => item.p == 'dn').n;
	var drawDate = data.find(item => item.p == 'dd').n.substring(0, 10);

	// result_4d_number data
	var numberVOList = [];
	data.filter((item) => {
		return ['1', '2', '3', '4', '5'].includes(item.p);
	})
	.forEach((item, index) => {
		var number = item.n;
		var category;
		switch(item.p) {
			case '1':
				category = constantResult4D._CATEGORY_FIRST();
				break;

			case '2':
				category = constantResult4D._CATEGORY_SECOND();
				break;

			case '3':
				category = constantResult4D._CATEGORY_THIRD();
				break;

			case '4':
				category = constantResult4D._CATEGORY_SPECIAL();
				break;

			case '5':
				category = constantResult4D._CATEGORY_CONSOLATION();
				break;
		}

		var position;
		switch (category) {
			case constantResult4D._CATEGORY_FIRST():
				position = 1;
				break;

			case constantResult4D._CATEGORY_SECOND():
				position = 2;
				break;

			case constantResult4D._CATEGORY_THIRD():
				position = 3;
				break;

			case constantResult4D._CATEGORY_SPECIAL():
			case constantResult4D._CATEGORY_CONSOLATION():
				position = numberVOList.filter((item) => item.category == category).length + 1;
				break;
		}
		var numberVO = { number, category, position };
		numberVOList.push(numberVO);
	});

	var result4DVO = { companyCode, drawDate, drawNo, numberVOList };
	return result4DVO;
}

async function save({ uuid, companyCode, drawDate, drawNo, numberVOList }) {
	var queryString = '';
	var whereFilter = '';
	var valueParams = {};
	var result;

	try {
		valueParams = { companyCode, drawDate, drawNo };
		queryString = result4DQuery._SELECT();
		whereFilter = result4DQuery.filter(valueParams);

		queryString = queryString.replace('${WHERE_FILTER}', whereFilter);
		result = await dbService.getOne(queryString, valueParams);

		if (result && result.hasOwnProperty('id')) {
			uuid = result.uuid;

		} else {
			// save result_4d
			queryString = result4DQuery._NEXT_UUID();
			valueParams = {};
			result = await dbService.getOneOrError(queryString, valueParams);
			uuid = result.next_uuid;

			queryString = result4DQuery._INSERT();
			valueParams = {
				uuid, companyCode, drawDate, drawNo,
				createdBy: 'SYSTEM', updatedBy: 'SYSTEM'
			};
			result = await dbService.executeAction(queryString, valueParams);
		}

		// save result_4d_number
		result = await result4DNumberService.saveList(uuid, numberVOList);
		return result;

	} catch (error) {
		throw Error(error);
	}
}

async function get4DResult(date) {
	var queryString = '';
	var whereFilter = '';
	var valueParams = {};
	var result;

	try {
		queryString = result4DQuery._SELECT_4D_RESULT();
		valueParams = { drawDate: date };
		whereFilter = result4DQuery.filter(valueParams);
		queryString = queryString.replace('${WHERE_FILTER}', whereFilter);

		result = await dbService.getList(queryString, valueParams);
		return result;

	} catch (error) {
		throw Error(error);
	}
}

async function get4DResultFlat({ dateFrom, dateTo }) {
	var queryString = '';
	var whereFilter = '';
	var valueParams = {};
	var result;

	try {
		queryString = result4DQuery._SELECT_4D_RESULT_FLAT();
		valueParams = { dateFrom, dateTo };
		whereFilter = result4DQuery.filter(valueParams);
		queryString = queryString.replace('${WHERE_FILTER}', whereFilter);

		result = await dbService.getList(queryString, valueParams);
		return result;

	} catch (error) {
		throw Error(error);
	}
}

module.exports = {
	update4DResult,
	get4DResult,
	get4DResultFlat
}