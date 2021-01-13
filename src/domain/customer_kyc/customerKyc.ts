import CustomerKyc from './../../data/database/models/UserKYC';
import { config } from '../../configuration';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

export function getCustomerKyc(user_id: number, page: number, limit: number, start_date : string, end_date : string, search: string, order_by: string) {
    return new Promise((resolve, reject) => {
        getCustomerKycAwait(user_id, page, limit, start_date, end_date, search, order_by).then((result) => {
            // console.log('get result from getCustomerKycAwait :=>',result)
            resolve(result);
        }).catch((err) => {
            console.log('getCustomerKycAwait error: ', err);
            reject(err);
        });
    });
}

var getCustomerKycAwait = async (user_id: number, page: number, limit: number, start_date : string, end_date : string, search: string, order_by: string) => {
    try {
        console.log("user_id: page: number, limit: number ::==>",user_id, page, limit, start_date, end_date, search);
        // console.log("PAGE :", typeof page);
        // console.log("LIMIT :", typeof limit);
        // console.log("SEARCH :", typeof search);
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
            if(orderByColumn === 'created_date'){
                orderByColumn = 'created_at';
            }
            if(orderByColumn === 'updated_date'){
                orderByColumn = 'updated_at';
            }
        }

        const { count, rows } = await CustomerKyc.findAndCountAll({
            where: {
                created_at: { [Op.gte]: startDate, [Op.lte]: new Date(new Date(endDate).getTime() + (1000 * 60 * 60 * 24)) },
                user_id,
                [Op.or]: {
                    first_name: { [Op.like]: '%' + whereSearch + '%' },
                    last_name: { [Op.like]: '%' + whereSearch + '%' },
                    email: { [Op.like]: '%' + whereSearch + '%' },
                    case_id: { [Op.like]: '%' + whereSearch + '%' },
                    status: { [Op.like]: '%' + whereSearch + '%' },
                }
            },
            order: [ [ orderByColumn, orderBy ] ],
            limit : records,
            offset: ((pageNumber-1)*records),
            subQuery: false
        });

        // console.log("=============================>",count);
        // console.log("=============================>",rows);

        let historyData : any = [];
        if(rows.length > 0){
            console.log('CustomerKyc found!!');
            status = true;
            message = "CustomerKyc list fetched successfully!!";
            rows.forEach(element => {
                let row = {
                    id: element.getDataValue('running_id'),
                    created_date: element.getDataValue('created_at'),
                    case_id: element.getDataValue('case_id'),
                    first_name: element.getDataValue('first_name'),
                    last_name: element.getDataValue('last_name'),
                    email: element.getDataValue('email'),
                    status: element.getDataValue('status'),
                    updated_date: element.getDataValue('updated_at'),
                };
                historyData.push(row);
            });
        }else{
            console.log('CustomerKyc list not found!!');
            status = false;
            message = "No data found!!";
        }
        // console.log("historyData :=>",historyData);
        return ({ status: status, message: message, total_records: count, data: historyData });
    } catch (e) {
        console.log('get customer kyc error: ', e);
        return ({ "status": false, "message": "Something went wrong!!, please try again." });
    }
};