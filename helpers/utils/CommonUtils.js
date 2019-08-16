function isBlank(args) {
	var isNotInit = args === undefined || args === null;
	if (isNotInit)
		return isNotInit;

	if (typeof args == 'string' || args instanceof String)
		return args.trim().length == 0;

	if (Array.isArray(args))
		return args.length == 0;

	return false;
}

function formatQuery(args) {
	return '\n ' + args.trim().replace(/\t/g, ' ');
}

function sortCompare(value1, value2) {
	if (value1 > value2)
		return 1;
	if (value1 < value2)
		return -1;
	return 0;
}

module.exports = {
	isBlank,
	formatQuery,
	sortCompare
}
