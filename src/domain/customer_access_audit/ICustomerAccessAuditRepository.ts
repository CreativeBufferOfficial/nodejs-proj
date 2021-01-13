export interface ICustomerAccessAuditRepository {
  logUserAccess({ customerLocation, userId, ipAddress, customerMachine, isParentUser }: { customerLocation: string, userId: number, ipAddress: string, customerMachine: string, isParentUser: boolean }): Promise<Boolean>;
}
