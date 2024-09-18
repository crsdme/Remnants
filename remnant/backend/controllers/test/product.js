const { assert, expect } = require('chai');
const { getProducts, createProduct, editProduct, removeProduct } = require('../product.js');
const dbRunner = require('../../bin/runners/db'); 

const productModel = require('../../models/product.js');

describe('Products Test', () => {
    before(async () => {
        await dbRunner();
    })
    
    let oldProduct;

    it('getProducts', async () => {
        
        const result = await getProducts({ stocks: [{ _id: '63ea4abd11564342b11af1cf' }] });
        expect(result.status).to.equal('ok');
    }) 
    
    it('createProduct', async () => {
        const args = {
            name: 'testName',
            model: 'testModel', 
            price: 100, 
            quantity: 0, 
            category: 'testCategory', 
            sku: 'testSku', 
            site: '63ee3be6c42d88b158bb0f75', 
        }
        const result = await createProduct(args);

        oldProduct = result.payload;

        expect(result.status).to.equal('ok');
    }) 

    it('editProduct', async () => {
        const args = {
            new: {
                name: 'testNameEdit',
                model: 'testModelEdit', 
                price: 111, 
                quantity: 1, 
                category: 'testCategoryEdit', 
                sku: 'testSkuEdit', 
                site: '63ee3be6c42d88b158bb0f75',
            },
            old: {
                _id: oldProduct 
            }
        }
        const result = await editProduct(args);

        expect(result.status).to.equal('ok');
    }) 

    it('removeProduct', async () => {
        const args = {
            _id: oldProduct._id
        }
        
        const result = await removeProduct(args);

        expect(result.status).to.equal('ok');
    }) 

})