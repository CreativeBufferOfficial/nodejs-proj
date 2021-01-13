
import { ICustomerAccessAuditRepository } from './ICustomerAccessAuditRepository';
import CustomerAccessAudit from './../../data/database/models/CustomerAccessAudit';
import CustomerDetails from './../../data/database/models/CustomerDetails';
import Users from './../../data/database/models/Users';
import { config } from  '../../configuration';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

export class CustomerAccessAuditService {
  constructor(private readonly repo: ICustomerAccessAuditRepository) {}

  async logUserAccess({ customerLocation, userId, ipAddress, customerMachine, isParentUser }: { customerLocation: string, userId: number, ipAddress: string, customerMachine: string, isParentUser: boolean }): Promise<Boolean> {
    return this.repo.logUserAccess({ customerLocation, userId, ipAddress, customerMachine, isParentUser });
  }

}

export function getloginEvents(user_id: number, page: number, limit: number, search: string, order_by: string, is_parent_user: boolean) : Promise<any> {
  return new Promise((resolve, reject) => {
    getloginEventsAwait(user_id, page, limit, search, order_by, is_parent_user).then((result) => {
          // console.log('get result from getloginEventsAwait :=>',result)
          resolve(result);
      }).catch((err) => {
          console.log('getloginEventsAwait error: ', err);
          reject(err);
      });
  });
}


var getloginEventsAwait = async (user_id: number, page: number, limit: number, search: string, order_by: string, is_parent_user: boolean) => {
    try {
        console.log("user_id: page: number, limit: number , order_by ::==>",user_id, page, limit, search, order_by);
        let message = "";
        let status = false;
        let orderByColumn = "";
        let orderBy = "";
        let pageNumber : number = ( typeof page !== 'undefined') ? +page : config.Page;
        let records : number = ( typeof limit !== 'undefined') ? +limit : config.Limit;
        let whereSearch = (typeof search !== 'undefined') ? search : "";
        // console.log("typeof search =>",typeof search);

        let orderByArr =  (order_by !== '') ? order_by.split("|") : [];
        console.log("ORDERBY orderByArr :", orderByArr);
        let tableRes: any = "";

        if(orderByArr.length === 2){
          orderByColumn = orderByArr[0];
          orderBy = orderByArr[1];

          if(orderByColumn == 'user_name'){
              orderByColumn = 'contact_person';
          }
          if(orderByColumn == 'date_time'){
              orderByColumn = 'createdAt';
          }
          if(orderByColumn == 'login_type'){
              orderByColumn = 'customer_machine';
          }
          tableRes = await getTableName(orderByColumn);
          console.log('response of table :==>', tableRes);
        }

          const { count, rows } = await CustomerAccessAudit.findAndCountAll({
            where: {
              '$customer_access_audits.user_id$': { [Op.eq]: user_id },
              is_parent_user,
              [Op.or]: {
                // '$customer_access_audits.customer_machine$': { [Op.like]: '%' + whereSearch + '%' },
                // '$user.customer_details.contact_person$': { [Op.like]: '%' + whereSearch + '%' },
                '$customer_access_audits.ip_address$': { [Op.like]: '%' + whereSearch + '%' },
              }
            },
            order: [ tableRes === 'CustomerDetails' ? [ Users, CustomerDetails, orderByColumn, orderBy ] : [ orderByColumn, orderBy ] ],
            // include:[{
            //   model: Users, required: true,
            //   attributes: [ 'id' ], 
            //   include:[{
            //     model: CustomerDetails, required: true,
            //     attributes: [ 'id', 'contact_person' ],
            //     // where: {
            //     //     id: user_id,
            //     //     [Op.or]: {contact_person : {[Op.like]: '%' + whereSearch + '%' }}
            //     // }
            //   }]
            // }],
            limit : records,
            offset:((pageNumber-1)*records),
            subQuery:false
        });

        // console.log("=============================>",count);
        // console.log("=============================>",rows);
  
        let loginEventLogs : any = [];
        if(rows.length > 0){
            console.log('eventLogs found!!');
            status = true;
            message = "Login events list fetched successfully!!";
            rows.forEach(element => {
              // console.log("element :=>",JSON.parse(element.customer_machine));
              let customerMachine = JSON.parse(element.customer_machine);
                let row = {
                    id: element.getDataValue('id'),
                    user_id: element.getDataValue('user_id'),
                    user_name: '', //element.user.customer_details.getDataValue('contact_person'),
                    date_time: element.getDataValue('createdAt'),
                    login_type: customerMachine.source === 'Auth0' ? 'Auth0' : 'Machine',
                    ip_address: element.getDataValue('ip_address')
                };
                loginEventLogs.push(row);
            });
        }else{
            console.log('Login events not found!!');
            status = false;
            message = "No data found!!";
        }
  
        return ({ status: status, message: message, total_records: count, data: loginEventLogs });
    } catch (e) {
        console.log('get login events error: ', e);
        return ({ "status": false, "message": "Something went wrong!!, please try again." });
    }
  };

var getTableName = async ( column: string ) => {

  console.log("called getTableName", column );

  const CustomerDetails = [ 'id', 'contact_person' ];
  const CustomerAccessAudit = [ 'id', 'createdAt', 'customer_machine', 'ip_address' ];
  
  if(CustomerDetails.indexOf(column) !== -1){
      return "CustomerDetails";
  }else if(CustomerAccessAudit.indexOf(column) !== -1){
      return "CustomerAccessAudit";
  }
};

