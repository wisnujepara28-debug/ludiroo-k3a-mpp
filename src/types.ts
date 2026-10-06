export type VesselType = 
  | 'Container' 
  | 'Bulk Carrier' 
  | 'General Cargo' 
  | 'Tanker' 
  | 'Ro-Ro' 
  | 'Tug & Barge';

export type VesselStatus = 
  | 'Underway' 
  | 'Berthed' 
  | 'Anchored' 
  | 'Maintenance';

export interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  vesselType: VesselType;
  capacityDwt: number;
  capacityTeu?: number;
  buildYear: number;
  flagPort: string;
  captainName: string;
  status: VesselStatus;
  currentLocation: string;
  fuelLevelPercent: number;
  createdAt: string;
  updatedAt: string;
}

export type VoyageStatus = 
  | 'Scheduled' 
  | 'In Transit' 
  | 'Berthed' 
  | 'Completed' 
  | 'Delayed';

export interface Voyage {
  id: string;
  voyageNumber: string;
  vesselId: string;
  vesselName: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  arrivalDate: string;
  status: VoyageStatus;
  cargoLoadPercent: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CargoCategory = 
  | 'Kontainer FCL' 
  | 'Kontainer LCL' 
  | 'Curah Kering' 
  | 'Curah Cair' 
  | 'Kargo Umum' 
  | 'Kendaraan';

export type CargoStatus = 
  | 'Booked' 
  | 'Loaded' 
  | 'In Transit' 
  | 'Discharged' 
  | 'Released';

export type PaymentStatus = 
  | 'Paid' 
  | 'Pending' 
  | 'Credit';

export interface Manifest {
  id: string;
  blNumber: string;
  voyageId: string;
  voyageNumber: string;
  vesselName: string;
  shipperName: string;
  consigneeName: string;
  cargoDescription: string;
  cargoCategory: CargoCategory;
  weightTon: number;
  containerCount?: number;
  freightRateIdr: number;
  paymentStatus: PaymentStatus;
  cargoStatus: CargoStatus;
  createdAt: string;
  updatedAt: string;
}

export type OperationalActivityType = 
  | 'Bunkering' 
  | 'Loading' 
  | 'Discharging' 
  | 'Safety Inspection' 
  | 'Crew Change' 
  | 'Maintenance';

export interface OperationalLog {
  id: string;
  vesselId: string;
  vesselName: string;
  portName: string;
  activityType: OperationalActivityType;
  recordedBy: string;
  details: string;
  timestamp: string;
  createdAt: string;
}

export type UserRole = 
  | 'Super Admin' 
  | 'Fleet Manager' 
  | 'Port Officer' 
  | 'Guest Officer';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL?: string | null;
  location?: string;
}

export interface OnlineUser {
  id: string;
  userId: string;
  displayName: string;
  role: string;
  currentTab?: string;
  lastSeen: string;
  color?: string;
}

export interface LiveActivity {
  id: string;
  actorName: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  entityType: 'VESSEL' | 'VOYAGE' | 'MANIFEST' | 'LOG';
  message: string;
  timestamp: string;
}
