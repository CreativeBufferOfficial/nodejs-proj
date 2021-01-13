import Sequelize from 'sequelize';
// tslint:disable-next-line: no-duplicate-imports
import { Op } from 'sequelize';
import {
  IBlockCardRepository,
  IVolumeFailedTransactionLogsRequest,
  IUpdateBlockedCardRequest,
  IGetAllBlockedCardsResponse,
  IUpdateBlockedCardResponse,
  BlockedCardDataResponseModel,
} from './BlockCard.interfaces';
import { UnenrolledCard, CardFailedTransactionLogs, CardFailedTransactionLogsCounter } from './../../data/database';

export class BlockCardRepository implements IBlockCardRepository {
  async searchBlockedCards(dataRequest: IVolumeFailedTransactionLogsRequest): Promise<IGetAllBlockedCardsResponse> {
    try {
      const {
        searchQuery,
        companyUUID,
        orderByField,
        orderSort,
        page,
        limit,
      } = dataRequest;
      const sortableFieldsObjV2: any = {
        email: '`user_email`',
        card: '`card_number`',
        latest_transaction_status: '`latest_alert_sent`',
        createdAt: '`CardFailedTransactionLogs`.`created_at`',
      };
      const sortFieldV2 =  sortableFieldsObjV2[orderByField] || '`CardFailedTransactionLogs`.`created_at`';
      const { rows: data, count } = await CardFailedTransactionLogs.findAndCountAll({
        where: {
          status: 1,
          '$unenrolled_card.enrolled_status$': 'B',
          ...(searchQuery && {
            email: {
              [Op.like]: `%${searchQuery}%`,
            }
          }),
          ...(companyUUID && {
            '$unenrolled_card.company_UUID$': `${companyUUID}`,
          }),
        },
        order: [
          [ Sequelize.literal(sortFieldV2), ['DESC', 'ASC'].includes(orderSort) ? orderSort : 'DESC' ],
        ],
        include: [ UnenrolledCard ],
        subQuery: false,
      });

      const pages = Math.ceil(count / limit);

      return {
        pages,
        limit,
        current_page: page,
        total: count,
        data: data.length > 0
          ? data.map((cardFailedTransactionLog: CardFailedTransactionLogs): BlockedCardDataResponseModel => {
              return {
                id: cardFailedTransactionLog.id,
                email: cardFailedTransactionLog.user_email,
                card: cardFailedTransactionLog.card_number,
                attemtps: 3,
                latest_transaction_status: cardFailedTransactionLog.latest_alert_sent,
                status: cardFailedTransactionLog.status,
                is_read: cardFailedTransactionLog.is_read,
                created_at: cardFailedTransactionLog.createdAt,
              };
          }) 
          : []
      };
    } catch (error) {
      console.log('searchBlockedCards_ERROR_ENCOUNTERED', error);
      if (error === 'DatabaseError') {
        throw ({ code: 422, message: 'Unable to process data1.' });
      }
      throw ({ code: 500, message: 'Internal server error.' });
    }
  }

  async updateBlockedCard(data: IUpdateBlockedCardRequest): Promise<IUpdateBlockedCardResponse> {
    const { id, enrolled_status, is_read } = data;

    const cardFailedTransactionLog = await CardFailedTransactionLogs.findOne({
      include: [ UnenrolledCard ],
      where: { id },
    });

    if (!cardFailedTransactionLog || !cardFailedTransactionLog.unenrolled_card) {
      throw { code: 422, message: 'Invalid data.' }
    }

    const unenrolledCard = await UnenrolledCard.findOne({ where: { id: cardFailedTransactionLog.unenrolled_card_id } });
    // tslint:disable-next-line: no-unused-expression
    (unenrolledCard && ['Y', 'N', 'B', null].includes(enrolled_status)) && await unenrolledCard.update({
      ...(enrolled_status && { enrolled_status: enrolled_status.toUpperCase() }),
    });

    // tslint:disable-next-line: no-unused-expression
    (cardFailedTransactionLog) && await cardFailedTransactionLog.update({
      ...((enrolled_status === 'Y' || enrolled_status === 'N') && { status: 2, }),
      ...(is_read && { is_read }),
    });

    if (enrolled_status === 'Y') {
      const cardFailedTransactionLogsCounter = await CardFailedTransactionLogsCounter.findOne({
        where: {
          // company_uuid: cardFailedTransactionLog.unenrolled_card.companyUUID,
          unenrolled_card_id: cardFailedTransactionLog.unenrolled_card_id,
        },
      });
      console.log(cardFailedTransactionLogsCounter, 'cardFailedTransactionLogsCountercardFailedTransactionLogsCounter');
      if (cardFailedTransactionLogsCounter) {
        cardFailedTransactionLogsCounter.no_auth_attempts = 0;
        cardFailedTransactionLogsCounter.waiting_verify_attempts = 0;
        cardFailedTransactionLogsCounter.declined_attempts = 0;
        await cardFailedTransactionLogsCounter.save();

      }
    }

    return {
      data: {
        id: cardFailedTransactionLog.id,
        email: cardFailedTransactionLog.user_email,
        card: cardFailedTransactionLog.card_number,
        attemtps: 3,
        latest_transaction_status: cardFailedTransactionLog.latest_alert_sent,
        status: cardFailedTransactionLog.status,
        is_read: cardFailedTransactionLog.is_read,
        created_at: cardFailedTransactionLog.createdAt,
      }
    };
  }

}