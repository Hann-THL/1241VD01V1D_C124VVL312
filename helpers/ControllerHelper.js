const constantAPI = require('./ConstantAPI');

function handleError(res, error, errorSummary) {
	res
	.status(constantAPI._HTTP_RESPONSE_SERVER_ERROR())
	.json({
		status: constantAPI._STATUS_ERROR(),
		message: error.message
	});
	console.log('[ERROR] ', errorSummary + '\n', error)
}

function handleSuccess(res, json) {
	json.status = constantAPI._STATUS_SUCCESS();

	res
	.status(constantAPI._HTTP_RESPONSE_OK())
	.json(json);
}

module.exports = {
	handleError,
	handleSuccess
}
