const express = require('express');
const router = express.Router();
const controllerHelper = require('../../helpers/ControllerHelper');
const result4DService = require('../../services/4D/Result4DService');
const result4DNumberService = require('../../services/4D/Result4DNumberService');

const commonUtils = require('../../helpers/utils/CommonUtils');
const constantResult4D = require('../../helpers/4D/ConstantResult4D');

const moment = require('moment');
const { parse } = require("json2csv");
const FileSystem = require("fs");

router.post('/update-result', function(req, res) {
	const errorSummary = 'Result4DController.js /update-result';

	result4DService.update4DResult()
	.then((result) => {
		const json = { data: result };
		controllerHelper.handleSuccess(res, json);
	})
	.catch((error) => {
		controllerHelper.handleError(res, error, errorSummary);
	});
})

router.get('/result', function(req, res) {
	const errorSummary = 'Result4DController.js /result';

	var date = moment(req.body.date).format('YYYY-MM-DD');

	result4DService.get4DResult(date)
	.then((result) => {
		var json = { data: result };

		if (!commonUtils.isBlank(result)) {
			var data = {
				magnum: format4DResult(result, constantResult4D._COMPANY_MAGNUM()),
				sports_toto: format4DResult(result, constantResult4D._COMPANY_SPORTS_TOTO()),
				damacai: format4DResult(result, constantResult4D._COMPANY_DAMACAI())
			};
			json = { data };
		}
		controllerHelper.handleSuccess(res, json);
	})
	.catch((error) => {
		controllerHelper.handleError(res, error, errorSummary);
	});
});

function format4DResult(result4DVOList, companyCode) {
	var matchedVO = result4DVOList.find((item) => {
		return item.company_code == companyCode;
	});

	var result4DVO = {
		drawDate: moment(matchedVO.draw_date).format('YYYY-MM-DD'),
		drawNo: matchedVO.draw_no,

		first: format4DCategoryData(
			matchedVO.numbers, constantResult4D._CATEGORY_FIRST()),

		second: format4DCategoryData(
			matchedVO.numbers, constantResult4D._CATEGORY_SECOND()),

		third: format4DCategoryData(
			matchedVO.numbers, constantResult4D._CATEGORY_THIRD()),

		special: format4DCategoryData(
			matchedVO.numbers, constantResult4D._CATEGORY_SPECIAL()),

		consolation: format4DCategoryData(
			matchedVO.numbers, constantResult4D._CATEGORY_CONSOLATION())
	}
	return result4DVO;
}

function format4DCategoryData(numbers, category) {
	switch(category) {
		case constantResult4D._CATEGORY_FIRST():
		case constantResult4D._CATEGORY_SECOND():
		case constantResult4D._CATEGORY_THIRD():
			return numbers.find((item) => {
				return item.category == category;
			}).number;

		case constantResult4D._CATEGORY_SPECIAL():
		case constantResult4D._CATEGORY_CONSOLATION():
			return numbers.filter((item) => {
				return item.category == category;
			})
			.sort((item1, item2) => {
				return commonUtils.sortCompare(item1.position, item2.position);
			})
			.map((item) => {
				return item.number;
			});

		default:
			return [];
	}
}

router.get('/number-occurrence', function(req, res) {
	const errorSummary = 'Result4DController.js /number-occurrence';

	var dateFrom = commonUtils.isBlank(req.body.dateFrom) ?
		moment('1985-04-25').format('YYYY-MM-DD') : moment(req.body.dateFrom).format('YYYY-MM-DD');
	var dateTo = moment(req.body.dateTo).format('YYYY-MM-DD');
	var number = req.body.number;
	var orderBy = req.body.orderBy;
	var sortOrder = req.body.sortOrder;

	result4DNumberService.get4DNumberOccurrence({ dateFrom, dateTo, number }, { orderBy, sortOrder })
	.then((result) => {
		var json = { data: result };

		if (!commonUtils.isBlank(result)) {
			var data = [];

			result.forEach((item, index) => {
				data.push({
					number: item.number,
					total_occurrence: item.total_occurrence,

					first: {
						occurrence: item.first_occurrence,
						dates: formatNumberOccurrenceCategoryData(
							item.draw_result, constantResult4D._CATEGORY_FIRST())
					},

					second: {
						occurrence: item.second_occurrence,
						dates: formatNumberOccurrenceCategoryData(
							item.draw_result, constantResult4D._CATEGORY_SECOND())	
					},

					third: {
						occurrence: item.third_occurrence,
						dates: formatNumberOccurrenceCategoryData(
							item.draw_result, constantResult4D._CATEGORY_THIRD())
					},

					special: {
						occurrence: item.special_occurrence,
						dates: formatNumberOccurrenceCategoryData(
							item.draw_result, constantResult4D._CATEGORY_SPECIAL())
					},

					consolation: {
						occurrence: item.consolation_occurrence,
						dates: formatNumberOccurrenceCategoryData(
							item.draw_result, constantResult4D._CATEGORY_CONSOLATION())
					}
				});
			});
			json = { data };
		}
		controllerHelper.handleSuccess(res, json);
	})
	.catch((error) => {
		controllerHelper.handleError(res, error, errorSummary);
	});
});

function formatNumberOccurrenceCategoryData(drawResult, category) {
	return drawResult.filter((item) => {
		return item.category == category;
	})
	.map((item) => {
		return item.draw_date
	});
}

router.get('/digit-occurrence', function(req, res) {
	const errorSummary = 'Result4DController.js /digit-occurrence';

	var dateFrom = commonUtils.isBlank(req.body.dateFrom) ?
		moment('1985-04-25').format('YYYY-MM-DD') : moment(req.body.dateFrom).format('YYYY-MM-DD');
	var dateTo = moment(req.body.dateTo).format('YYYY-MM-DD');

	result4DNumberService.get4DDigitOccurrence({ dateFrom, dateTo })
	.then((result) => {
		var json = { data: result };
		controllerHelper.handleSuccess(res, json);
	})
	.catch((error) => {
		controllerHelper.handleError(res, error, errorSummary);
	});
});

router.get('/number-category', function(req, res) {
	const errorSummary = 'Result4DController.js /number-category';

	var max_number = 9999;
	var max_digit_count = max_number.toString().length;

	var arr = [];
	for (var i = 0; i <= max_number; i++) {
		var number = i.toString().padStart(max_digit_count, '0');
		var pattern = number;
		var alphabet = 'A';
		var oddeven = '';
		var bigsmall = '';

		for (var n in number) {
			var digit = number[n];

			// Verify Odd / Even
			oddeven += digit % 2 != 0 ? 'O' : 'E';

			// Verify Big / Small
			bigsmall += digit >= 5 ? 'B' : 'S';

			// Verify Pattern
			if (isNaN(parseInt(pattern[n], 10)))
				continue;
			pattern = pattern.replace(new RegExp(digit, 'g'), alphabet);
			alphabet = String.fromCharCode(alphabet.charCodeAt(0) + 1);
		}

		// Verify Group
		var group4 = number[0] + '***';
		var group3 = '*' + number[1] + '**';
		var group2 = '**' + number[2] + '*';
		var group1 = '***' + number[3];

		arr.push({
			'number': number,
			'pattern': pattern,
			'group_4': group4,
			'group_3': group3,
			'group_2': group2,
			'group_1': group1,
			'odd_even': oddeven,
			'big_small': bigsmall
		})
	}

	var filename = 'number_category.csv';
	var csv = parse(arr, {
		fields: ['number', 'pattern', 'group_4', 'group_3', 'group_2', 'group_1', 'odd_even', 'big_small'],
		delimiter: ';'
	});
	FileSystem.writeFileSync(`./${filename}`, csv);

	var json = { message: `Data successfully exported to ${filename}.` };
	controllerHelper.handleSuccess(res, json);
});

router.get('/result-flat', function(req, res) {
	const errorSummary = 'Result4DController.js /result-flat';

	var dateFrom = commonUtils.isBlank(req.body.dateFrom) ?
		moment('1985-04-25').format('YYYY-MM-DD') : moment(req.body.dateFrom).format('YYYY-MM-DD');
	var dateTo = moment(req.body.dateTo).format('YYYY-MM-DD');

	result4DService.get4DResultFlat({ dateFrom, dateTo })
	.then((result) => {
		var filename = `4D_result_${dateFrom}_${dateTo}.csv`;
		var csv = parse(result, {
			fields: ['draw_date', 'company_code', 'number', 'category', 'position'],
			delimiter: ';'
		});
		FileSystem.writeFileSync(`./${filename}`, csv);

		var json = { message: `Data successfully exported to ${filename}.` };
		controllerHelper.handleSuccess(res, json);
	})
	.catch((error) => {
		controllerHelper.handleError(res, error, errorSummary);
	});
});

module.exports = router;
