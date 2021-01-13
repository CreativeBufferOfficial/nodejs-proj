import CustomerDetails from './../../data/database/models/CustomerDetails';

export function getCustomerDetails(user_id: number | string) {
    return new Promise((resolve, reject) => {
        getCustomerDetailsAwait(user_id).then((result) => {
            // console.log('get result from getCustomerDetailsAwait :=>',result)
            resolve(result);
        }).catch((err) => {
            console.log('getCustomerDetailsAwait error: ', err);
            reject(err);
        });
    });
}
export async function getCustomerDetailsCompanyUUID (companyUUID: string) {
    const data = await CustomerDetails.findOne({
        where: { company_uuid: companyUUID, is_active: 1 }
    });
    return data;
}

var getCustomerDetailsAwait = async (user_id : number | string) => {
    try {
        // console.log("user_id::==>",user_id);
        let message = ""; 
        let status = false;
        const { count, rows } = await CustomerDetails.findAndCountAll({
            where: { user_id }
        });
        let userData = { term_uuid: "", adax_uuid: "" };
        if(count > 0){
            rows.forEach((e) => {
                userData.adax_uuid = e.getDataValue('company_uuid');
                userData.term_uuid = e.getDataValue('term_uuid');
            })
            status = true;
            message = "Get customer details successfully!!";
        }else{
            status = false;
            message = "Failed to get customer details!!";
        }
        return ({ status: status, message: message, data: userData });
    } catch (e) {
        console.log('get transaction error: ', e);
        return ({ "status": false, "message": "Something went wrong!!, please try again." });
    }
};