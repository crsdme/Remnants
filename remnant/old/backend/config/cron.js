const cron = require('node-cron');
// const { updateOrdersStatuses } = require('../controllers/order'); 

// cron.schedule('*/10 * * * *', updateOrdersStatuses);

// Export the cron job for use in other files
module.exports = cron;