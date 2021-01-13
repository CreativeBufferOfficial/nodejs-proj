import express, { Request, Response } from 'express';
import { asyncWrapper } from '../utils/asyncWrapper';
import { TransactionService } from '../../domain/transaction';
// import { TransactionRepository } from '../../domain';
import { UserKYCService } from './../../domain/user_kyc'
import UserKYC from './../../data/database/models/UserKYC';
import CustomerDetails from './../../data/database/models/CustomerDetails';

import { fenigePaymentStatus } from './../../domain/fenige/thirdParty';
import { CryptoEngineService } from './../../services';
import { objToEncodedURI } from './../../utils';

const cryptoEngineService = new CryptoEngineService();
const router = express.Router();

export function transactionRoute(TransactionService: TransactionService, userKYCService: UserKYCService, getCustomerDetailsCompanyUUID: any) {
    router.post(
        '/',
        asyncWrapper(async (req: Request, res: Response) => {
            let customer_details_id = 0;
            const {
                adax_uuid = "",
                request_uuid = "",
                term_uuid = "",
                first_name = "",
                last_name = "",
                email = "",
                address_ip = "",
                amount = 0,
                currency = "",
                card_number = "",
                expiry_date = "",
                cvc2 = "",
                transaction_status = "",
                auto_clear = "",
                redirect_url = "",
                crypto_transfer = false,
                kyc_delayed = false,
                wallet = "",
            } = req.body;
            
            if (card_number && card_number.length !== 16) {
                return res.status(422).json({ code: 422, message:'Invalid card format.' });
            }
            // CHECK IF CARD 3DS ENROLLED
            if (card_number) {
                const cardStatus = await TransactionService.getUnenrolledCardStatus(card_number, adax_uuid);
                if (cardStatus.status !== 'Y') {
                    if (crypto_transfer) {
                        await cryptoEngineService.markCancelled({ requestUUID: String(request_uuid) });
                    }
                    return res.status(422).json({ code: 422, message: cardStatus.message });
                }
            }

            const company_uuid = adax_uuid;
            if (crypto_transfer) {
                const queryString = objToEncodedURI({ requestUUID: String(request_uuid), companyUUID: String(company_uuid) })
                const cryptoPurchaseDetails = await cryptoEngineService.getStatus({ queryString });
                if (!cryptoPurchaseDetails) {
                    return res.status(404).json({ status: 404, message: "Invalid request uuid" });
                }
                console.log(cryptoPurchaseDetails, 'cryptoPurchaseDetailscryptoPurchaseDetails');
                console.log({ email, wallet, amount: amount / 100 });
                console.log(cryptoPurchaseDetails.result.email !== email, 'aaa');
                console.log(cryptoPurchaseDetails.result.wallet !== wallet, 'bbb');
                // console.log(cryptoPurchaseDetails.result.originalPurchasedPrice !== (amount / 100), 'ccc');
                if (
                    cryptoPurchaseDetails.result.email !== email ||
                    cryptoPurchaseDetails.result.wallet !== wallet
                    // cryptoPurchaseDetails.result.originalPurchasedPrice !== (amount / 100)
                ) {
                    return res.status(422).json({ status: 422, message: "Request data does not match quoted data." });
                }
            }

            // company_uuid
            const companyDetails = await getCustomerDetailsCompanyUUID(company_uuid)

            if (companyDetails.is_active !== 1) {
                return res.status(404).json({ status: 404, message: "Customer is either inactive or paused." });
            }

            if (!companyDetails) return res.json({ "status": false, "message": "Your KYC application doesn't exist from the company, please try again or contact support." });

            if (companyDetails.is_kyc_active && (amount/100) > companyDetails.amount_threshold) { // placeholder for amount validation
                // KYC Validation
                const userKYC: UserKYC | null = await userKYCService.getUserKYCByEmail(email);
                console.log(userKYC?.status, 'userKYCuserKYC');
                if (userKYC && !['verified-status', 'approved'].includes(userKYC.status.toLocaleLowerCase())) { 
                    return res.status(422).json({ status: 422, message: "Please perform KYC before you transact." });
                }
                // end of KYC validation
            }
            
            console.log('Current term_uuid =>', term_uuid);
            console.log('Current company_uuid =>', company_uuid);
            const customerInstance: CustomerDetails | null = await CustomerDetails.findOne(
                { where: { company_uuid, term_uuid } },
            );

            if (customerInstance) {
                console.log(
                    'got response of CustomerDetails =>',
                    customerInstance!.getDataValue('id'),
                );
                customer_details_id = customerInstance.getDataValue('id');

                console.log("gether all transaction details...")
                console.log(
                    adax_uuid,
                    customer_details_id,
                    term_uuid,
                    request_uuid,
                    first_name,
                    last_name,
                    email,
                    address_ip,
                    amount,
                    currency,
                    card_number,
                    expiry_date,
                    cvc2,
                    transaction_status,
                    auto_clear,
                    redirect_url,
                    crypto_transfer,
                    kyc_delayed,
                );

                let fees = (amount / 100) * (companyDetails.fees / 100);
                fees = fees > 2.99 ? fees : 2.99;
                const result = await TransactionService.createTransaction(
                    adax_uuid,
                    customer_details_id,
                    request_uuid,
                    term_uuid,
                    first_name,
                    last_name,
                    email,
                    address_ip,
                    amount,
                    fees,
                    currency,
                    card_number,
                    expiry_date,
                    cvc2,
                    transaction_status,
                    auto_clear,
                    redirect_url,
                    crypto_transfer,
                    kyc_delayed,
                    wallet,
                );
                // console.log('transaction result :==>',result);
                return res.send(result);
                // if(result.getDataValue('id') > 0){
                //     // return res.send(result);
                //     return res.send({ "status": true, "maessage": "Transaction done successfully!!." });
                // }else{
                //     return res.send({ "status": false, "message": "Something went wrong!!, please try again." });
                // }
            }
            else {
                return res.send({ "status": false, "message": "User details not found or deactivated!!" });
            }
        }),
    );
    
    router.get('/redirect', async (req: any, res: Response) => {
        await (async () => {
            return new Promise((resolveSleep) => {
                setTimeout(resolveSleep, 5000)
            })
        })()
        const request_uuid: string = req.query['request-uuid'] as string;
        const redirect_url: string = await TransactionService.getTransactionRedirectURL(request_uuid);
        const transactionStatus = await fenigePaymentStatus(request_uuid);
        const transaction = await TransactionService.transactionByRequestUUID(request_uuid);
        if (!transaction) {
            return res.redirect(`${redirect_url}?request-uuid=${request_uuid}`)
        }

        transaction.transaction_status = transactionStatus.transactionStatus;
        transaction.response_code = transactionStatus.responseCode;
        const saved = await transaction.save();
        if (transaction.crypto_transfer && !transaction.crypto_settled && saved) {
            if (['APPROVED', 'CLEARED'].includes(transactionStatus.transactionStatus)) {
                await cryptoEngineService.markReady({ requestUUID: request_uuid });
            } else if (['DECLINED'].includes(transactionStatus.transactionStatus)) {
                await cryptoEngineService.markCancelled({ requestUUID: request_uuid });
            }
        } 
        res.redirect(`${redirect_url}?request-uuid=${request_uuid}`)
    })
    return router;
}
