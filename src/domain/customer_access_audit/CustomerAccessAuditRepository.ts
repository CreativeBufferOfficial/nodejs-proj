import CustomerAccessAudit from './../../data/database/models/CustomerAccessAudit';

// DATA LAYER
// is used to provide an abstraction on top of the database ( and possible other data sources)
// so other parts of the application are decoupled from the specific database implementation.
// Furthermore it can hide the origin of the data from it's consumers.
// It is possible to fetch the entities from different sources like inmemory cache,
// network or the db without the need to alter the consumers code.

export class CustomerAccessAuditRepository {
  async logUserAccess({ customerLocation, userId, ipAddress, customerMachine, isParentUser }: { customerLocation: string, userId: number, ipAddress: string, customerMachine: string, isParentUser: boolean  }): Promise<Boolean> {
    const customerLog : CustomerAccessAudit = new CustomerAccessAudit();
    customerLog.customer_location = customerLocation;
    customerLog.ip_address = ipAddress;
    customerLog.customer_machine = customerMachine;
    customerLog.user_id = userId;
    customerLog.is_parent_user = isParentUser;
    if (!customerLog.save()) return false;
    return true;
  }
}
