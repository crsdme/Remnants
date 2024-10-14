const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path  = require('path');
const sharp = require("sharp");
const fs = require("fs");
const dayjs = require("dayjs");

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createProduct, getProducts, removeProduct, editProduct, } = require('../../controllers/products.js');

const imageFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === 'image') {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"));
    }
};
  
const uploadPhoto = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: imageFilter
});
  

router.post('/create', authenticateToken, uploadPhoto.array('files'), async (req, res) => {
    const processedImages = [];

    const uploadFolder = path.join(__dirname, '../../', 'public/images', `${dayjs().format('DD-MM-YYYY')}`);

    if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
    }

    for (const file of req.files) {
        const bigfilename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-full.jpg`;
        const bigfilePath = path.join(uploadFolder, bigfilename);
        
        await sharp(file.buffer)
        .resize({ width: 1000 })
        .toFile(bigfilePath)


        const smallfilename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-preview.jpg`;
        const smallfilePath = path.join(uploadFolder, smallfilename);
        
        await sharp(file.buffer)
        .resize(80, 80)
        .toFile(smallfilePath);

        processedImages.push({ 
            main: { name: bigfilename, path: bigfilePath.slice(bigfilePath.indexOf('images')) }, 
            preview: { name: smallfilename, path: smallfilePath.slice(smallfilePath.indexOf('images'))  } 
        });
    }

    req.body.images = processedImages;

    const { status, data, errors, warnings, info } = await createProduct(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'products', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {

    const { status, data, errors, warnings, info } = await getProducts(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'products', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeProduct(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'products', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, uploadPhoto.array('files'), async (req, res) => {
    const processedImages = [];

    const uploadFolder = path.join(__dirname, '../../', 'public/images', `${dayjs().format('DD-MM-YYYY')}`);

    if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
    }

    for (const file of req.files) {
        const bigfilename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-full.jpg`;
        const bigfilePath = path.join(uploadFolder, bigfilename);
        console.log(file)
        await sharp(file.buffer)
        .resize({ width: 1000 })
        .toFile(bigfilePath)


        const smallfilename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-preview.jpg`;
        const smallfilePath = path.join(uploadFolder, smallfilename);
        
        await sharp(file.buffer)
        .resize(80, 80)
        .toFile(smallfilePath);

        processedImages.push({ 
            main: { name: bigfilename, path: bigfilePath.slice(bigfilePath.indexOf('images')) }, 
            preview: { name: smallfilename, path: smallfilePath.slice(smallfilePath.indexOf('images'))  }
            // uid: 
        });
    }

    req.body.images = processedImages;

    const { status, data, errors, warnings, info } = await editProduct(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'products', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;