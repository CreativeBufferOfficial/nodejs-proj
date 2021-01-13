import Transaction from './../../data/database/models/Transaction';
import CustomerDetails from './../../data/database/models/CustomerDetails';
import Users from './../../data/database/models/Users';
import { CryptoPurchase } from './../../data/database';
import { config } from '../../configuration';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

export function getTransactionStatusHistory(user_id: number, page: number, limit: number, start_date : string, end_date : string, search: string, order_by: string, email_id: string | null) {
    return new Promise((resolve, reject) => {
        getTransactionStatusHistoryawait(user_id, page, limit, start_date, end_date, search, order_by, email_id).then((result) => {
            // console.log('get result from getTransactionStatusHistoryawait :=>',result)
            resolve(result);
        }).catch((err) => {
            console.log('getTransactionStatusawait error: ', err);
            reject(err);
        });
    });
}

var getTransactionStatusHistoryawait = async (user_id: number, page: number, limit: number, start_date : string, end_date : string, search: string, order_by: string, email_id: string | null) => {
    try {
        console.log("user_id: page: number, limit: number ::==>",user_id, page, limit, start_date, end_date, search, email_id);
        // console.log("PAGE :", typeof page);
        // console.log("LIMIT :", typeof limit);
        // console.log("SEARCH :", typeof search);
        // console.log("START :", typeof start_date);
        // console.log("END :", typeof end_date);
        console.log("EMAIL :", typeof email_id);
        console.log("ORDERBY :", typeof order_by);
        let message = "";
        let status = false;
        let orderByColumn = "";
        let orderBy = "";
        let pageNumber : number = ( typeof page !== 'undefined') ? +page : config.Page;
        let records : number = ( typeof limit !== 'undefined') ? +limit : config.Limit;
        let startDate : Date | string = ( typeof start_date !== 'undefined') ? start_date: "";
        let endDate : Date | string = ( typeof end_date !== 'undefined') ? end_date : "";
        let whereSearch = (typeof search !== 'undefined') ? search : "";

        let orderByArr =  (order_by !== '') ? order_by.split("|") : [];
        console.log("ORDERBY orderByArr :", orderByArr);
        // let tableRes: any = "";
       
        if(orderByArr.length === 2){
            orderByColumn = orderByArr[0];
            orderBy = orderByArr[1];

            if(orderByColumn === 'name'){
                orderByColumn = 'first_name';
            }

            // if(orderByColumn === 'transaction_time'){
            //     orderByColumn = 'transaction_date';
            // }

            if(orderByColumn === 'fees'){
                orderByColumn = 'amount';
            }

            if(orderByColumn === 'three_ds_confirmed'){
                orderByColumn = 'transaction_status';
            }

            if(orderByColumn === 'created_date' || orderByColumn === 'created_time'){
                orderByColumn = 'createdAt';
            }

            // tableRes = await getTableName(orderByColumn);
        }

        // console.log('response of table :==>', tableRes);

        const { count, rows } = await Transaction.findAndCountAll({
            where: {
                createdAt: { [Op.gte]: startDate, [Op.lte]: new Date(new Date(endDate).getTime() + (1000 * 60 * 60 * 24)) },
                email: { [Op.like]: '%' + email_id + '%' },
                [Op.or]: {
                    transaction_status: { [Op.like]: '%' + whereSearch + '%' },
                    first_name: { [Op.like]: '%' + whereSearch + '%' },
                    last_name: { [Op.like]: '%' + whereSearch + '%' },
                    amount: { [Op.like]: '%' + whereSearch + '%' },
                    request_uuid: { [Op.like]: '%' + whereSearch + '%' },
                    card_number: { [Op.like]: '%' + whereSearch + '%' },
                },
                '$customer_details.user.id$': user_id
            },
            order: [ [ orderByColumn, orderBy ] ],
            include: [
                {
                    model: CustomerDetails, required: true,
                    attributes: [ 'id', 'fees' ],
                    include:[
                        {
                            model: Users, required: true,
                            attributes: [ 'id' ],
                        }
                    ]
                },
                {
                    model: CryptoPurchase,
                    attributes: ['txId', 'fullySettledAt', 'status'],
                }
            ],
            limit : records,
            offset: ((pageNumber-1)*records),
            subQuery: false
        });
        // console.log(rows, 'rowsrows')
        // const { count, rows } = await TransactionStatus.findAndCountAll({
        //     where: {
        //         createdAt: { [Op.gte]: startDate, [Op.lte]: new Date(new Date(endDate).getTime() + (1000 * 60 * 60 * 24)) },
        //         // transaction_date: { [Op.gte]: startDate, [Op.lte]: new Date(new Date(endDate).getTime() + (1000 * 60 * 60 * 24)) },
        //         [Op.or]: {
        //             // clearing_amount: { [Op.like]: '%' + whereSearch + '%' },
        //             transaction_status: { [Op.like]: '%' + whereSearch + '%' },
        //             '$transaction.first_name$': { [Op.like]: '%' + whereSearch + '%' },
        //             '$transaction.last_name$': { [Op.like]: '%' + whereSearch + '%' },
        //             '$transaction.amount$': { [Op.like]: '%' + whereSearch + '%' },
        //             '$transaction.request_uuid$': { [Op.like]: '%' + whereSearch + '%' },
        //             '$transaction.card_number$': { [Op.like]: '%' + whereSearch + '%' },
        //             // '$transaction.customer_details.fees$': { [Op.like]: '%' + whereSearch + '%' },
        //         }
        //     },
        //     order: [ tableRes === 'Transaction' ? [ Transaction, orderByColumn, orderBy ] : [ orderByColumn, orderBy ] ],
        //     // order: [ tableRes === 'Transaction' ? [ Transaction, orderByColumn, orderBy ] : ( tableRes === 'CustomerDetails' ? [ Transaction, CustomerDetails, orderByColumn, orderBy ] : [ orderByColumn, orderBy ] )  ],
        //     include: [{
        //         model: Transaction, required: true,
        //         attributes: [ 'id', 'first_name', 'last_name', 'request_uuid', 'amount', 'currency', 'card_number' ],
        //         include: [{
        //             model: CustomerDetails, required: true,
        //             attributes: [ 'id', 'fees' ],
        //             include:[{ model: Users, required: true,
        //                 attributes: [ 'id' ],
        //                 where: {
        //                     id: user_id
        //                 }
        //             }]
        //         }]
        //     }],
        //     limit : records,
        //     offset: ((pageNumber-1)*records),
        //     subQuery: false
        // });

        // console.log("=============================>",count);
        // console.log("=============================>",rows);

                // {
                //     model: CryptoPurchase,
                //     // attributes: ['tx_id'],
                // }
        let historyData : any = [];
        if(rows.length > 0){
            console.log('history found!!');
            status = true;
            message = "Transaction history list fetched successfully!!";
            // console.log(rows, 'rowssss');
            rows.forEach(element => {
                let newClearingAmount = element.getDataValue('amount') / 100;
                let row = {
                    id: element.getDataValue('id'),
                    created_date: element.getDataValue('createdAt'),
                    name: element.getDataValue('first_name') + " " + element.getDataValue('last_name'),
                    amount: newClearingAmount,
                    // fees: element.customer_details.getDataValue('fees') / 100,
                    fees: newClearingAmount < 0 ? 0 : ((newClearingAmount * element.customer_details.getDataValue('fees')) / 100),
                    transaction_status: element.getDataValue('transaction_status'),
                    request_uuid: element.getDataValue('request_uuid'),
                    card_number: element.getDataValue('card_number').slice(element.getDataValue('card_number').length - 4),
                    refund_status: element.getDataValue('refund_status'),
                    transaction_hash: element.getDataValue('cryptoPurchase')?.txId,
                    transfer_date: element.getDataValue('cryptoPurchase')?.fullySettledAt,
                    transfer_status: element.getDataValue('cryptoPurchase')?.status,
                };
                console.log(JSON.stringify(element.getDataValue('cryptoPurchase')), 'qqqqqqqqqqqqq')
                // let row = {
                //     id: element.getDataValue('id'),
                //     created_date: element.getDataValue('createdAt'),
                //     // transaction_date: element.getDataValue('transaction_date'),
                //     // transaction_time: moment(element.getDataValue('transaction_date')).format('HH:mm:ss'),
                //     name: element.transaction.getDataValue('first_name') + " " + element.transaction.getDataValue('last_name'),
                //     amount: element.transaction.getDataValue('amount'),
                //     fees: ((element.transaction.getDataValue('amount') * element.transaction.customer_details.getDataValue('fees')) / 100),
                //     // fees: element.getDataValue('clearing_amount'),
                //     transaction_status: element.getDataValue('transaction_status'),
                //     three_ds_confirmed: element.getDataValue('three_ds_confirmed'),
                //     request_uuid: element.transaction.getDataValue('request_uuid'),
                //     card_number: element.transaction.getDataValue('card_number').slice(element.transaction.getDataValue('card_number').length - 4)
                // };
                historyData.push(row);
            });
        }else{
            console.log('Transaction history not found!!');
            status = false;
            message = "No data found!!";
        }
        // console.log("historyData :=>",historyData);
        return ({ status: status, message: message, total_records: count, data: historyData });
    } catch (e) {
        console.log('get transaction error: ', e);
        return ({ "status": false, "message": "Something went wrong!!, please try again." });
    }
};

// var getTableName = async ( column: string ) => {

//     console.log("called getTableName", column );

//     const Transaction = [ 'first_name', 'request_uuid', 'amount', 'currency', 'card_number' ];
//     const TransactionStatus = [ 'three_ds_confirmed', 'transaction_status', 'transaction_date', 'clearing_amount', 'createdAt'];
//     // const CustomerDetails = [ 'fees' ];
    
//     if(Transaction.indexOf(column) !== -1){
//         return "Transaction";
//     }else if(TransactionStatus.indexOf(column) !== -1){
//         return "TransactionStatus";
//     }
//     // else if(CustomerDetails.indexOf(column) !== -1){
//     //     return "CustomerDetails";
//     // }
// }

