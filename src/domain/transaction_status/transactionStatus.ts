import { Transaction, TransactionStatus } from './../../data/database';
import { fenigePaymentStatus } from '../../domain/fenige/thirdParty';

// TODO: uncomment this part
// import { ITransactionRepository } from './../transaction';
// TODO_END: uncomment this part

// TODO: uncomment this part
// import { containerInstance } from './../../container';
// TODO_END: uncomment this part

export function getTransactionStatus(request_uuid: string) {
    return new Promise((resolve, reject) => {
        getTransactionStatusawait(request_uuid).then((result) => {
            // console.log('get result from getTransactionStatusawait :=>',result)
            resolve(result);
        }).catch((err) => {
            console.log('getTransactionStatusawait error: ', err);
            reject(err);
        });
    });
}

var getTransactionStatusawait = async (request_uuid : string) => {
    try {
        const selectedTransaction = await Transaction.findOne({where: { request_uuid }});

        if (selectedTransaction && ['APPROVED', 'DECLINED', 'CLEARED', 'REJECTED'].includes(selectedTransaction.transaction_status)) {
            // transaction status is at end state
            const amount = selectedTransaction.amount / 100;
            const hiddenCardNumber = `${selectedTransaction.card_number.substring(0, 6)}*****${selectedTransaction.card_number.substring(12, 16)}`;
            return {
                amount,
                hiddenCardNumber,
                '3DS': true,
                requestUuid: selectedTransaction.request_uuid,
                createdDate: selectedTransaction.createdAt,
                transactionStatus: selectedTransaction.transaction_status,
                responseCode: selectedTransaction.response_code,
                autoClear: selectedTransaction.auto_clear,
                currency: selectedTransaction.currency,
                finalAmount: amount,
                finalCurrency: selectedTransaction.currency,
                firstName: selectedTransaction.first_name,
                lastName: selectedTransaction.last_name,
                email: selectedTransaction.email,
                clearingAmount: amount,
                httpStatus: 'OK',
            };
        }

        let fenigeRes: any = await fenigePaymentStatus(request_uuid)

        if(typeof fenigeRes.merchantUuid !== "undefined"){
            delete fenigeRes.merchantUuid
        }

        if (selectedTransaction && typeof selectedTransaction.id !== "undefined") {
            if (!selectedTransaction) {
                return;
            }
            if (selectedTransaction.transaction_status !== fenigeRes.transactionStatus) {
                selectedTransaction.transaction_status = fenigeRes.transactionStatus;
                selectedTransaction.response_code = fenigeRes.responseCode;
                await selectedTransaction.save();
                // const transactionRepository = containerInstance?.resolve<ITransactionRepository>('TransactionRepository');
                // await transactionRepository.checkCardTransactions24Hr(fenigeRes.transactionStatus, fenigeRes.responseCode, selectedTransaction.card_number, selectedTransaction.adax_uuid, selectedTransaction.request_uuid, selectedTransaction.email);
                // await transactionRepository.volumeByDollarAmountChecker();
                // await transactionRepository.checkDeclinedTransactions(fenigeRes.transactionStatus, selectedTransaction.adax_uuid);
            }

            if (fenigeRes.status === 'S0000') {

                var insertRes = await insertTransactionHistory(selectedTransaction.id, fenigeRes.clearingAmount, fenigeRes.createdDate, fenigeRes.transactionStatus, fenigeRes['3DS'], fenigeRes.message);

                insertRes = JSON.parse(JSON.stringify(insertRes));

                console.log('if section insertTransactionHistory resp :', insertRes);
                
                // return ({ status: true, message: fenigeRes.message, transaction_status: fenigeRes.transactionStatus });
            }
            // return ({ status: true, message: fenigeRes.message, transaction_status: transactionStatusResponse.transaction_status });
            const {
                amount,
                hiddenCardNumber,
                requestUuid,
                createdDate,
                transactionStatus,
                responseCode,
                autoClear,
                currency,
                finalAmount,
                finalCurrency,
                firstName,
                lastName,
                email,
                clearingAmount,
                httpStatus,
             } = fenigeRes;
            return {
                amount,
                hiddenCardNumber,
                requestUuid,
                createdDate,
                transactionStatus,
                responseCode,
                autoClear,
                currency,
                finalAmount,
                finalCurrency,
                firstName,
                lastName,
                email,
                clearingAmount,
                httpStatus,
                '3DS': fenigeRes['3DS'],
            };
        }
        else {
            return ({ status: false, message: "Invalid request UUID, please try again." });
        }
    } catch (e) {
        console.log('get transaction error: ', e);
        return ({ "status": false, "message": "Something went wrong!!, please try again." });
    }
};

export function insertTransactionHistory(transaction_id : number, clearing_amount: string = '0.00', transaction_date : Date, transaction_status: string, three_ds_confirmed: boolean, event_result: string) {
    return new Promise((resolve, reject) => {
       let created_date = new Date();
        TransactionStatus.create({
            transaction_id: transaction_id,
            clearing_amount: clearing_amount,
            transaction_status: transaction_status,
            event_result: event_result,
            three_ds_confirmed: three_ds_confirmed,
            transaction_date: transaction_date,
            created_date: created_date,
          }).then(async (result: any) => {
            // console.log("result's auto-generated ID:", result);
            console.log("result's auto-generated ID:", result.dataValues.id);
            resolve(result.dataValues.id);
          })
          .catch((err) => {
                console.log('insertTransactionHistory error: ', err);
                reject({ "status": false, "message": "Something went wrong!!, please try again." });
            });
    });
};

// function updateTransactionStatus(
//     request_uuid: string,
//     transaction_status: string,
//     response_code: string,
// ) {
//     return new Promise((resolve, reject) => {
//         const date_updated = new Date();
//         Transaction
//         .update({
//           transaction_status,
//           response_code,
//           date_updated,
//         }, {where: {request_uuid}})
//         .then((result) => {
//           console.log('updateData resolved: ', result);
//           resolve(result)
//         })
//         .catch((err) => {
//           console.log('updateData error: ', err);
//           reject({ "status": false, "message": "Something went wrong!!, please try again." });
//         });
//     }); 
// }

//   var getCustomerTransactionDetails = async (request_uuid : string) => {
//     return new Promise((resolve, reject) => {
//         const transaction: any = Transaction.findOne({
//             where: { request_uuid }
//           }).then((result = transaction) => {
//             // console.log('resolved and find customer transaction details ::',result);
//             resolve(result);
//           }).catch((err) => {
//             console.log('rejected customer transaction details ::',err);
//             reject(err);
//           });
//     });
// }