const clientModel = require('../models/client.js');
const { createNotification } = require('./notification.js');

const createClient = async ({ name, middlename, lastname, emails, phones, dayofbirth, comment, orders, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const clientCount = await clientModel.count();

    const createdClient = await clientModel.create({ id: clientCount + 1, name, middlename, lastname, emails, phones, dayofbirth, comment, orders });
    console.log(createdClient)
    if (createdClient) {
        status = 'success';
        data = createdClient;
    } else {
        status = 'failed';
    }

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const editClient = async ({ _id, name, middlename, lastname, emails, phones, dayofbirth, comment, orders, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedClient = await clientModel.updateOne({ _id }, { name, middlename, lastname, emails, phones, dayofbirth, comment, orders });

    if (editedClient) {
        status = 'success';
        data = editedClient;
    } else {
        status = 'failed';
    }   

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const getClients = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: null });

    const { search } = (filter || { search: null });

    filter = { disabled: false };

    // let query = clientModel.find(filter);

    let pipline = [
        // {
        //     $match: filter
        // },
        {
            $sort: { id: 1 }
        }
    ];

    if (search) {
        pipline.push({
            $match: {
                $or: [
                  { id: search },
                  { name: { $regex: search, $options: "i" } },
                  { middlename: { $regex: search, $options: "i" } },
                  { lastname: { $regex: search, $options: "i" } },
                  { emails: { $elemMatch: { $regex: search, $options: "i" } } },
                  { phones: { $elemMatch: { $regex: search, $options: "i" } } },
                  { comment: { $regex: search, $options: "i" } },
                  { orders: search }
                ]
              }
        });
    }
    let clientsQuery = clientModel.aggregate(pipline);

    if (allPages === false || !allPages) {
        clientsQuery = clientsQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    const clients = await clientsQuery.exec();

    let clientsCount = await clientModel.count();
    
    if (clients) {
        status = 'success';
        data = { clients, clientsCount };
    } else {
        status = 'failed';
    }

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const removeClient = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removeClient = await clientModel.updateOne({ _id }, { disabled: true });

    if (removeClient) {
        status = 'success';
        data = removeClient;
    } else {
        status = 'failed';
    }


    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

module.exports = {
    createClient,
    editClient,
    removeClient,
    getClients
  };
