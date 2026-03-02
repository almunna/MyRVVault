const makeApplianceController = require('../../../utils/makeApplianceController');
const { create, getAll, getById, update, remove } = makeApplianceController('expenses', ['expenseType', 'vendor', 'notes'], 'Expense');

exports.createExpense = create;
exports.getExpenses = getAll;
exports.getExpenseById = getById;
exports.updateExpense = update;
exports.deleteExpense = remove;
