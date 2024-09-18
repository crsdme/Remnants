const { assert, expect } = require('chai');
const { createOrder } = require('../order.js');
const dbRunner = require('../../bin/runners/db'); 

const productModel = require('../../models/product.js');
const siteModel = require('../../models/site.js');
const stockModel = require('../../models/stock.js');
const npAccountModel = require('../../models/npAccount.js');

describe('Orders Test', async () => {
    before(async () => {
        await dbRunner();
    })

    let order;

    const sites = await siteModel.find();
    const stocks = await stockModel.find();
    const npAccounts = await npAccountModel.find();
    const deliveryTypes = ['selfpickup', 'novaposhtaDelivery', 'courierDelivery'];
    const paymentTypes = ['card', 'cash'];
    const orderStatuses = ['confirmed', 'notConfirmed'];
    const paymentStatuses = ['paid', 'notPaid'];

    it('createOrder', async () => {
        
        const args = {
            site: sites[0]._id,
            stock: stocks[0]._id,
            deliveryType: deliveryTypes[0],
            paymentType: paymentTypes[0],
            orderStatus: orderStatuses[0],
            paymentStatus: paymentStatuses[0],
            npAccount: npAccounts[0],
            weight: 1,
            assessedValue: 300,
            city,
            postOffice,
            fullname: 'Литвинов Володимир',
            deliveryPayer,
            telephone,
            email,
            summary,
            discount,
            address,
            parcelHeight,
            parcelLength,
            parcelWidth,
            ttn,
            products,
            deliveryCost,
            deliveryDate,
            statusCode
        }
        
        const result = await createOrder(args);
        expect(result.status).to.equal('ok');
    }) 

})