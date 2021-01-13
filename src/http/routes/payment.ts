// TODO: refactor this code

// /client/payments/cof/initial
import express, { Request, Response } from 'express';
import { asyncWrapper } from '../utils/asyncWrapper';
import { TransactionService } from '../../domain/transaction/transactionService';
import { UserKYCService } from './../../domain/user_kyc'
import UserKYC from './../../data/database/models/UserKYC';
import CustomerDetails from './../../data/database/models/CustomerDetails';

const router = express.Router();

export function PaymentRouter(TransactionService: TransactionService, userKYCService: UserKYCService, getCustomerDetailsCompanyUUID: any) {
  router.post(
    '/cof/initial',
    asyncWrapper(async (req: Request, res: Response) => {
      console.log('called transaction asyncWrapper');
      let customer_details_id = 0;
      // req.user // active user is here
      console.log(req.user, 'current user')
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
        auto_clear = "",
        redirect_url = "",
        crypto_transfer = false,
        kyc_delayed = false,
      } = req.body;

      // CHECK IF CARD 3DS ENROLLED
      if (card_number) {
        const cardStatus = await TransactionService.getUnenrolledCardStatus(card_number, adax_uuid);
        if (cardStatus.status !== 'Y') {
            return res.status(422).json({ code: 422, message: cardStatus.message });
        }
      }

      const company_uuid = adax_uuid;

      // company_uuid
      const companyDetails = await getCustomerDetailsCompanyUUID(company_uuid)
      console.log(companyDetails, 'companyDetailscompanyDetails');
      if (!companyDetails) return res.json({ "status": false, "message": "Your KYC application doesn't exist from the company, please try again or contact support." });

      if (companyDetails.is_kyc_active && (amount / 100) > companyDetails.amount_threshold) { // placeholder for amount validation
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
        let fees = (amount / 100) * (companyDetails.fees / 100);
        fees = fees > 2.99 ? fees : 2.99; 
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
          fees,
          currency,
          card_number,
          expiry_date,
          cvc2,
          auto_clear,
          redirect_url,
          crypto_transfer,
          kyc_delayed,
        );
        
        const result = await TransactionService.createCOFROFTransaction(
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
          auto_clear,
          redirect_url,
          true,
          crypto_transfer,
          kyc_delayed,
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


  router.post(
    '/recurring/initial',
    asyncWrapper(async (req: Request, res: Response) => {
      console.log('called transaction asyncWrapper');
      let customer_details_id = 0;
      // req.user // active user is here
      console.log(req.user, 'current user')
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
        auto_clear = "",
        redirect_url = "",
        crypto_transfer = false,
        kyc_delayed = false,
      } = req.body;

      // CHECK IF CARD 3DS ENROLLED
      if (card_number) {
        const cardStatus = await TransactionService.getUnenrolledCardStatus(card_number, adax_uuid);
        if (cardStatus.status !== 'Y') {
            return res.status(422).json({ code: 422, message: cardStatus.message });
        }
      }

      const company_uuid = adax_uuid;

      // company_uuid
      const companyDetails = await getCustomerDetailsCompanyUUID(company_uuid)
      console.log(companyDetails, 'companyDetailscompanyDetails');
      if (!companyDetails) return res.json({ "status": false, "message": "Your KYC application doesn't exist from the company, please try again or contact support." });

      if (companyDetails.is_kyc_active && (amount / 100) > companyDetails.amount_threshold) { // placeholder for amount validation
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
          auto_clear,
          redirect_url,
        );

        let fees = (amount / 100) * (companyDetails.fees / 100);
        fees = fees > 2.99 ? fees : 2.99;
        const result = await TransactionService.createCOFROFTransaction(
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
          auto_clear,
          redirect_url,
          false,
          crypto_transfer,
          kyc_delayed,
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

  router.post(
    '/cof/subsequent',
    asyncWrapper(async (req: Request, res: Response) => {
      const {
        request_uuid = "",
        amount = 0,
        currency = "",
        auto_clear = "",
        cof_initial_uuid = "",
        crypto_transfer = false,
        kyc_delayed = false,
      } = req.body;
      const ipAddress = req.connection.remoteAddress || '';
      const transactionDetails = await TransactionService.TransactionByIntialUUID(cof_initial_uuid);
      if (!transactionDetails) {
        res.json({ message: 'Initial uuid is invalid.' });
        return;
      }

      // company_uuid
      const companyDetails = await getCustomerDetailsCompanyUUID(transactionDetails.adax_uuid)
      console.log(companyDetails, 'companyDetailscompanyDetails');
      if (!companyDetails) return res.json({ "status": false, "message": "Your KYC application doesn't exist from the company, please try again or contact support." });

      if (companyDetails.is_kyc_active && (amount / 100) > companyDetails.amount_threshold) { // placeholder for amount validation
        // KYC Validation
        const userKYC: UserKYC | null = await userKYCService.getUserKYCByEmail(transactionDetails.email);
        console.log(userKYC?.status, 'userKYCuserKYC');
        if (userKYC && !['verified-status', 'approved'].includes(userKYC.status.toLocaleLowerCase())) {
          return res.status(422).json({ status: 422, message: "Please perform KYC before you transact." });
        }
        // end of KYC validation
      }

      let fees = (amount / 100) * (companyDetails.fees / 100);
      fees = fees > 2.99 ? fees : 2.99;
      const result = await TransactionService.addSubsequentCOFROFPayment(
        companyDetails.company_uuid,
        companyDetails.id,
        request_uuid,
        companyDetails.term_uuid,
        transactionDetails.first_name,
        transactionDetails.last_name,
        transactionDetails.email,
        ipAddress,
        amount,
        fees,
        currency,
        auto_clear,
        cof_initial_uuid,
        true,
        crypto_transfer,
        kyc_delayed,
      );
      // console.log('transaction result :==>',result);
      return res.send(result);
      // if(result.getDataValue('id') > 0){
      //     // return res.send(result);
      //     return res.send({ "status": true, "maessage": "Transaction done successfully!!." });
      // }else{
      //     return res.send({ "status": false, "message": "Something went wrong!!, please try again." });
      // }
    }),
  );

  router.post(
    '/recurring/subsequent',
    asyncWrapper(async (req: Request, res: Response) => {
      const {
        request_uuid = "",
        amount = 0,
        currency = "",
        auto_clear = "",
        recurring_initial_uuid = "",
        crypto_transfer = false,
        kyc_delayed = false,
      } = req.body;

      const ipAddress = req.connection.remoteAddress || ''
      const transactionDetails = await TransactionService.TransactionByIntialUUID(recurring_initial_uuid);
      if (!transactionDetails) {
        res.json({ message: 'Initial uuid is invalid.' });
        return;
      }

      // company_uuid
      const companyDetails = await getCustomerDetailsCompanyUUID(transactionDetails.adax_uuid)
      console.log(companyDetails, 'companyDetailscompanyDetails');
      if (!companyDetails) return res.json({ "status": false, "message": "Your KYC application doesn't exist from the company, please try again or contact support." });

      if (companyDetails.is_kyc_active && (amount / 100) > companyDetails.amount_threshold) { // placeholder for amount validation
        // KYC Validation
        const userKYC: UserKYC | null = await userKYCService.getUserKYCByEmail(transactionDetails.email);
        console.log(userKYC?.status, 'userKYCuserKYC');
        if (userKYC && !['verified-status', 'approved'].includes(userKYC.status.toLocaleLowerCase())) {
          return res.status(422).json({ status: 422, message: "Please perform KYC before you transact." });
        }
        // end of KYC validation
      }

      let fees = (amount / 100) * (companyDetails.fees / 100);
      fees = fees > 2.99 ? fees : 2.99;
      const result = await TransactionService.addSubsequentCOFROFPayment(
        companyDetails.company_uuid,
        companyDetails.id,
        request_uuid,
        companyDetails.term_uuid,
        transactionDetails.first_name,
        transactionDetails.last_name,
        transactionDetails.email,
        ipAddress,
        amount,
        fees,
        currency,
        auto_clear,
        recurring_initial_uuid,
        false,
        crypto_transfer,
        kyc_delayed,
      );
      // console.log('transaction result :==>',result);
      return res.send(result);
      // if(result.getDataValue('id') > 0){
      //     // return res.send(result);
      //     return res.send({ "status": true, "maessage": "Transaction done successfully!!." });
      // }else{
      //     return res.send({ "status": false, "message": "Something went wrong!!, please try again." });
      // }
    }),
  );

  router.post(
    '/refund',
    asyncWrapper(async (req: Request, res: Response) => {
      const {
        request_uuids,
        is_cof_roc = false
      } = req.body;
      try {
        if (!Array.isArray(request_uuids)) {
          const InvalidInputParameter = new Error();
          InvalidInputParameter.name = 'InvalidInputParameter';
          InvalidInputParameter.message = 'request_uuids should be array';
          throw InvalidInputParameter;
        }
        let transactions;
        if (!is_cof_roc) {
          transactions = await TransactionService.transactionByRequestUUIDs(request_uuids);
          if (!transactions) {
            const dataNotFound = new Error();
            dataNotFound.name = 'dataNotFound';
            dataNotFound.message = 'Unable to find data';
            throw dataNotFound;
          }
          const results = await Promise.all(transactions.map(async (transaction: any) => {
  
            const result = await TransactionService.paymentRefund(transaction.adax_uuid,transaction.request_uuid, transaction.amount);
            let selectedTransaction;
            if (!is_cof_roc) {
              selectedTransaction = await TransactionService.transactionByRequestUUID(transaction.request_uuid);
            } else {
              selectedTransaction = await TransactionService.getCOFROCTransactionsByUUID(transaction.request_uuid);
            }
            
            if (result.status === 'APPROVED') {
              if (selectedTransaction) {
                selectedTransaction.amount = -1 * selectedTransaction.amount;
                selectedTransaction.refund_status = 'Approved';
                selectedTransaction?.save();
              }
            } else if (['DECLINED', 'REJECTED'].includes(result.status)) {
              if (selectedTransaction) {
                selectedTransaction.refund_status = 'Rejected';
                selectedTransaction?.save();
              }
            }
            return result;
          }));
          return res.status(200).json(results); 
        }
         else {
          transactions = await TransactionService.getCOFROCTransactionsByUUIDs(request_uuids);
          if (!transactions) {
            const dataNotFound = new Error();
            dataNotFound.name = 'dataNotFound';
            dataNotFound.message = 'Unable to find data';
            throw dataNotFound;
          }
          const results = await Promise.all(transactions.map(async (transaction: any) => {
  
            const result = await TransactionService.paymentRefund(transaction.adax_uuid,transaction.request_uuid, transaction.amount);
            let selectedTransaction;
            if (!is_cof_roc) {
              selectedTransaction = await TransactionService.transactionByRequestUUID(transaction.request_uuid);
            } else {
              selectedTransaction = await TransactionService.getCOFROCTransactionsByUUID(transaction.request_uuid);
            }
            
            if (result.status === 'APPROVED') {
              if (selectedTransaction) {
                selectedTransaction.amount = -1 * selectedTransaction.amount;
                selectedTransaction.refund_status = 'Approved';
                selectedTransaction?.save();
              }
            } else if (['DECLINED', 'REJECTED'].includes(result.status)) {
              if (selectedTransaction) {
                selectedTransaction.refund_status = 'Rejected';
                selectedTransaction?.save();
              }
            }
            return result;
          }));
          return res.status(200).json(results); 
        }
      } catch (error) {
        console.log('REFUND_ERROR',error);
        return res.status(422).json({ error: error.name, message: error.message, }); 
      }
    }),
  );

  return router;
}