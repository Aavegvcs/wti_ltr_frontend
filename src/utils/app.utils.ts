export enum TripSheetStatusEnum {
  CREATED, // Tripsheet created but not submitted by driver
  SUBMITTED, // Tripsheet submitted by driver
  APPROVED, // Approved by corporate admin
  REJECTED, // Rejected by corporate admin
  CANCELLED // Trip has been cancelled by driver
}
