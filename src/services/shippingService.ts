import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Vessel, 
  Voyage, 
  Manifest, 
  OperationalLog,
  OnlineUser,
  LiveActivity,
  UserProfile
} from '../types';

/* =========================================================================
   LIVE BROADCAST & PRESENCE (REALTIME MULTI-USER)
   ========================================================================= */

export async function broadcastActivity(activity: Omit<LiveActivity, 'id' | 'timestamp'>): Promise<void> {
  const colPath = 'live_activities';
  try {
    const docRef = doc(collection(db, colPath));
    const payload: LiveActivity = {
      id: docRef.id,
      actorName: activity.actorName || 'Petugas Operasional',
      actionType: activity.actionType,
      entityType: activity.entityType,
      message: activity.message,
      timestamp: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
  } catch (err) {
    // Non-blocking for primary CRUD
    console.warn('Failed to broadcast live activity:', err);
  }
}

export function subscribeToLiveActivities(callback: (activities: LiveActivity[]) => void) {
  const colPath = 'live_activities';
  const q = query(collection(db, colPath), orderBy('timestamp', 'desc'), limit(12));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: LiveActivity[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LiveActivity));
      callback(data);
    },
    (error) => {
      console.warn('Live activities stream error:', error);
    }
  );
}

export async function updatePresence(user: UserProfile, currentTab: string): Promise<void> {
  if (!user || !user.uid) return;
  const colPath = 'online_users';
  try {
    const docRef = doc(db, colPath, user.uid);
    const payload: OnlineUser = {
      id: user.uid,
      userId: user.uid,
      displayName: user.displayName || 'Petugas Maritim',
      role: user.role || 'Petugas',
      currentTab,
      lastSeen: new Date().toISOString(),
      color: getUserColor(user.displayName || user.uid),
    };
    await setDoc(docRef, payload);
  } catch (err) {
    console.warn('Presence update error:', err);
  }
}

export async function removePresence(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await deleteDoc(doc(db, 'online_users', userId));
  } catch (err) {
    console.warn('Presence remove error:', err);
  }
}

export function subscribeToOnlineUsers(callback: (users: OnlineUser[]) => void) {
  const colPath = 'online_users';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const now = Date.now();
      // Keep users active within last 5 minutes
      const data: OnlineUser[] = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as OnlineUser))
        .filter(u => {
          if (!u.lastSeen) return true;
          const diff = now - new Date(u.lastSeen).getTime();
          return diff < 1000 * 60 * 10;
        });
      callback(data);
    },
    (error) => {
      console.warn('Online users stream error:', error);
    }
  );
}

function getUserColor(name: string): string {
  const colors = [
    '#0284c7', '#0d9488', '#16a34a', '#d97706', '#9333ea', '#e11d48', '#2563eb'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/* =========================================================================
   VESSELS (ARMADA KAPAL) CRUD
   ========================================================================= */

export function subscribeToVessels(
  callback: (vessels: Vessel[]) => void, 
  onError?: (err: Error) => void
) {
  const colPath = 'vessels';
  const q = query(collection(db, colPath), orderBy('name', 'asc'));
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const data: Vessel[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vessel));
      callback(data);
    },
    (error) => {
      console.error('Error fetching vessels:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

export async function createVessel(
  vesselData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>,
  actorName?: string
): Promise<string> {
  const colPath = 'vessels';
  try {
    const docRef = doc(collection(db, colPath));
    const now = new Date().toISOString();
    
    const payload: Vessel = {
      id: docRef.id,
      name: vesselData.name.trim().substring(0, 100),
      imoNumber: vesselData.imoNumber.trim().substring(0, 30),
      vesselType: vesselData.vesselType,
      capacityDwt: Number(vesselData.capacityDwt),
      capacityTeu: vesselData.capacityTeu ? Number(vesselData.capacityTeu) : undefined,
      buildYear: Number(vesselData.buildYear),
      flagPort: (vesselData.flagPort || 'Tanjung Priok, Jakarta').trim().substring(0, 100),
      captainName: (vesselData.captainName || '-').trim().substring(0, 100),
      status: vesselData.status,
      currentLocation: (vesselData.currentLocation || 'Pelabuhan Pangkalan').trim().substring(0, 100),
      fuelLevelPercent: Math.min(100, Math.max(0, Number(vesselData.fuelLevelPercent || 100))),
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, payload);

    await broadcastActivity({
      actorName: actorName || 'Admin Armada',
      actionType: 'CREATE',
      entityType: 'VESSEL',
      message: `Mendaftarkan kapal baru: ${payload.name} (${payload.vesselType}, ${payload.capacityDwt.toLocaleString('id-ID')} DWT)`,
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, colPath);
  }
}

export async function updateVessel(
  id: string, 
  updates: Partial<Omit<Vessel, 'id' | 'createdAt'>>,
  actorName?: string
): Promise<void> {
  const path = `vessels/${id}`;
  try {
    const cleanUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.name) cleanUpdates.name = updates.name.trim().substring(0, 100);
    if (updates.imoNumber) cleanUpdates.imoNumber = updates.imoNumber.trim().substring(0, 30);
    if (updates.capacityDwt !== undefined) cleanUpdates.capacityDwt = Number(updates.capacityDwt);
    if (updates.fuelLevelPercent !== undefined) cleanUpdates.fuelLevelPercent = Math.min(100, Math.max(0, Number(updates.fuelLevelPercent)));

    await updateDoc(doc(db, 'vessels', id), cleanUpdates);

    await broadcastActivity({
      actorName: actorName || 'Admin Armada',
      actionType: updates.status ? 'STATUS_CHANGE' : 'UPDATE',
      entityType: 'VESSEL',
      message: updates.status 
        ? `Memperbarui status kapal #${id.substring(0, 6)} menjadi: ${updates.status}`
        : `Memperbarui data spesifikasi kapal #${id.substring(0, 6)}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteVessel(id: string, actorName?: string, vesselName?: string): Promise<void> {
  const path = `vessels/${id}`;
  try {
    await deleteDoc(doc(db, 'vessels', id));

    await broadcastActivity({
      actorName: actorName || 'Admin Armada',
      actionType: 'DELETE',
      entityType: 'VESSEL',
      message: `Menghapus kapal ${vesselName || id} dari armada`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/* =========================================================================
   VOYAGES (JADWAL & RUTE PELAYARAN) CRUD
   ========================================================================= */

export function subscribeToVoyages(
  callback: (voyages: Voyage[]) => void,
  onError?: (err: Error) => void
) {
  const colPath = 'voyages';
  const q = query(collection(db, colPath), orderBy('departureDate', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: Voyage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Voyage));
      callback(data);
    },
    (error) => {
      console.error('Error fetching voyages:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

export async function createVoyage(
  voyageData: Omit<Voyage, 'id' | 'createdAt' | 'updatedAt'>,
  actorName?: string
): Promise<string> {
  const colPath = 'voyages';
  try {
    const docRef = doc(collection(db, colPath));
    const now = new Date().toISOString();

    const payload: Voyage = {
      id: docRef.id,
      voyageNumber: voyageData.voyageNumber.trim().substring(0, 50),
      vesselId: voyageData.vesselId.trim().substring(0, 100),
      vesselName: voyageData.vesselName.trim().substring(0, 100),
      originPort: voyageData.originPort.trim().substring(0, 100),
      destinationPort: voyageData.destinationPort.trim().substring(0, 100),
      departureDate: voyageData.departureDate,
      arrivalDate: voyageData.arrivalDate,
      status: voyageData.status,
      cargoLoadPercent: Math.min(100, Math.max(0, Number(voyageData.cargoLoadPercent || 0))),
      notes: (voyageData.notes || '').substring(0, 500),
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, payload);

    await broadcastActivity({
      actorName: actorName || 'Jadwal Pelayaran',
      actionType: 'CREATE',
      entityType: 'VOYAGE',
      message: `Menjadwalkan rute baru: ${payload.voyageNumber} (${payload.vesselName}: ${payload.originPort} → ${payload.destinationPort})`,
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, colPath);
  }
}

export async function updateVoyage(
  id: string, 
  updates: Partial<Omit<Voyage, 'id' | 'createdAt'>>,
  actorName?: string
): Promise<void> {
  const path = `voyages/${id}`;
  try {
    const cleanUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.voyageNumber) cleanUpdates.voyageNumber = updates.voyageNumber.trim().substring(0, 50);
    if (updates.originPort) cleanUpdates.originPort = updates.originPort.trim().substring(0, 100);
    if (updates.destinationPort) cleanUpdates.destinationPort = updates.destinationPort.trim().substring(0, 100);
    if (updates.cargoLoadPercent !== undefined) cleanUpdates.cargoLoadPercent = Math.min(100, Math.max(0, Number(updates.cargoLoadPercent)));
    if (updates.notes !== undefined) cleanUpdates.notes = updates.notes.substring(0, 500);

    await updateDoc(doc(db, 'voyages', id), cleanUpdates);

    await broadcastActivity({
      actorName: actorName || 'Jadwal Pelayaran',
      actionType: updates.status ? 'STATUS_CHANGE' : 'UPDATE',
      entityType: 'VOYAGE',
      message: updates.status
        ? `Memperbarui status pelayaran #${id.substring(0, 6)} menjadi: ${updates.status}`
        : `Memperbarui data pelayaran #${id.substring(0, 6)}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteVoyage(id: string, actorName?: string, voyageNumber?: string): Promise<void> {
  const path = `voyages/${id}`;
  try {
    await deleteDoc(doc(db, 'voyages', id));

    await broadcastActivity({
      actorName: actorName || 'Jadwal Pelayaran',
      actionType: 'DELETE',
      entityType: 'VOYAGE',
      message: `Menghapus jadwal pelayaran ${voyageNumber || id}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/* =========================================================================
   MANIFESTS (MANIFEST KARGO & BILL OF LADING) CRUD
   ========================================================================= */

export function subscribeToManifests(
  callback: (manifests: Manifest[]) => void,
  onError?: (err: Error) => void
) {
  const colPath = 'manifests';
  const q = query(collection(db, colPath), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: Manifest[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Manifest));
      callback(data);
    },
    (error) => {
      console.error('Error fetching manifests:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

export async function createManifest(
  manifestData: Omit<Manifest, 'id' | 'createdAt' | 'updatedAt'>,
  actorName?: string
): Promise<string> {
  const colPath = 'manifests';
  try {
    const docRef = doc(collection(db, colPath));
    const now = new Date().toISOString();

    const payload: Manifest = {
      id: docRef.id,
      blNumber: manifestData.blNumber.trim().substring(0, 50),
      voyageId: manifestData.voyageId.trim().substring(0, 100),
      voyageNumber: manifestData.voyageNumber.trim().substring(0, 50),
      vesselName: manifestData.vesselName.trim().substring(0, 100),
      shipperName: manifestData.shipperName.trim().substring(0, 120),
      consigneeName: manifestData.consigneeName.trim().substring(0, 120),
      cargoDescription: manifestData.cargoDescription.trim().substring(0, 250),
      cargoCategory: manifestData.cargoCategory,
      weightTon: Math.max(0, Number(manifestData.weightTon || 0)),
      containerCount: manifestData.containerCount ? Math.max(0, Number(manifestData.containerCount)) : undefined,
      freightRateIdr: Math.max(0, Number(manifestData.freightRateIdr || 0)),
      paymentStatus: manifestData.paymentStatus,
      cargoStatus: manifestData.cargoStatus,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, payload);

    await broadcastActivity({
      actorName: actorName || 'Petugas Dokumen Kargo',
      actionType: 'CREATE',
      entityType: 'MANIFEST',
      message: `Menerbitkan B/L baru ${payload.blNumber} untuk Shipper: ${payload.shipperName} (${payload.weightTon} Ton)`,
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, colPath);
  }
}

export async function updateManifest(
  id: string, 
  updates: Partial<Omit<Manifest, 'id' | 'createdAt'>>,
  actorName?: string
): Promise<void> {
  const path = `manifests/${id}`;
  try {
    const cleanUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.blNumber) cleanUpdates.blNumber = updates.blNumber.trim().substring(0, 50);
    if (updates.shipperName) cleanUpdates.shipperName = updates.shipperName.trim().substring(0, 120);
    if (updates.consigneeName) cleanUpdates.consigneeName = updates.consigneeName.trim().substring(0, 120);
    if (updates.cargoDescription) cleanUpdates.cargoDescription = updates.cargoDescription.trim().substring(0, 250);
    if (updates.weightTon !== undefined) cleanUpdates.weightTon = Math.max(0, Number(updates.weightTon));
    if (updates.freightRateIdr !== undefined) cleanUpdates.freightRateIdr = Math.max(0, Number(updates.freightRateIdr));

    await updateDoc(doc(db, 'manifests', id), cleanUpdates);

    await broadcastActivity({
      actorName: actorName || 'Petugas Kargo',
      actionType: updates.cargoStatus ? 'STATUS_CHANGE' : 'UPDATE',
      entityType: 'MANIFEST',
      message: updates.cargoStatus 
        ? `Memperbarui status kargo B/L #${id.substring(0, 6)}: ${updates.cargoStatus}`
        : `Memperbarui dokumen B/L #${id.substring(0, 6)}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteManifest(id: string, actorName?: string, blNumber?: string): Promise<void> {
  const path = `manifests/${id}`;
  try {
    await deleteDoc(doc(db, 'manifests', id));

    await broadcastActivity({
      actorName: actorName || 'Petugas Kargo',
      actionType: 'DELETE',
      entityType: 'MANIFEST',
      message: `Menghapus manifest / B/L ${blNumber || id}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/* =========================================================================
   OPERATIONAL LOGS (LOG AKTIVITAS OPERASIONAL & PELABUHAN)
   ========================================================================= */

export function subscribeToOperationalLogs(
  callback: (logs: OperationalLog[]) => void,
  onError?: (err: Error) => void
) {
  const colPath = 'operational_logs';
  const q = query(collection(db, colPath), orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: OperationalLog[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as OperationalLog));
      callback(data);
    },
    (error) => {
      console.error('Error fetching logs:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

export async function createOperationalLog(
  logData: Omit<OperationalLog, 'id' | 'createdAt'>,
  actorName?: string
): Promise<string> {
  const colPath = 'operational_logs';
  try {
    const docRef = doc(collection(db, colPath));
    const now = new Date().toISOString();

    const payload: OperationalLog = {
      id: docRef.id,
      vesselId: logData.vesselId.trim().substring(0, 100),
      vesselName: logData.vesselName.trim().substring(0, 100),
      portName: (logData.portName || 'Pelabuhan Tanjung Priok').trim().substring(0, 100),
      activityType: logData.activityType,
      recordedBy: logData.recordedBy.trim().substring(0, 100),
      details: logData.details.trim().substring(0, 500),
      timestamp: logData.timestamp || now,
      createdAt: now,
    };

    await setDoc(docRef, payload);

    await broadcastActivity({
      actorName: actorName || payload.recordedBy,
      actionType: 'CREATE',
      entityType: 'LOG',
      message: `Mencatat log ${payload.activityType} untuk kapal ${payload.vesselName} di ${payload.portName}`,
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, colPath);
  }
}

export async function deleteOperationalLog(id: string, actorName?: string): Promise<void> {
  const path = `operational_logs/${id}`;
  try {
    await deleteDoc(doc(db, 'operational_logs', id));

    await broadcastActivity({
      actorName: actorName || 'Petugas Pelabuhan',
      actionType: 'DELETE',
      entityType: 'LOG',
      message: `Menghapus catatan log operasional #${id.substring(0, 6)}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/* =========================================================================
   DATA INITIALIZER / SEEDER
   ========================================================================= */

export async function seedInitialMaritimeData(): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  // 1. Initial Vessels (Armada Kapal Modern Indonesia)
  const initialVessels: Array<Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      name: 'KM Samudera Perkasa 01',
      imoNumber: 'IMO 9452381',
      vesselType: 'Container',
      capacityDwt: 28500,
      capacityTeu: 2200,
      buildYear: 2020,
      flagPort: 'Tanjung Priok, Jakarta',
      captainName: 'Capt. Hendra Gunawan, M.Mar',
      status: 'Underway',
      currentLocation: 'Laut Jawa (Menuju Tanjung Perak)',
      fuelLevelPercent: 88,
    },
    {
      name: 'KM Bahari Nusantara IX',
      imoNumber: 'IMO 9382104',
      vesselType: 'Bulk Carrier',
      capacityDwt: 45000,
      buildYear: 2018,
      flagPort: 'Tanjung Perak, Surabaya',
      captainName: 'Capt. Bambang Suryono',
      status: 'Berthed',
      currentLocation: 'Dermaga Jamrud, Tanjung Perak',
      fuelLevelPercent: 64,
    },
    {
      name: 'KM Bintang Khatulistiwa',
      imoNumber: 'IMO 9621049',
      vesselType: 'General Cargo',
      capacityDwt: 14200,
      capacityTeu: 850,
      buildYear: 2022,
      flagPort: 'Belawan, Medan',
      captainName: 'Capt. Rizal Fahmi',
      status: 'Underway',
      currentLocation: 'Selat Bangka (Rute Belawan - JKT)',
      fuelLevelPercent: 75,
    },
    {
      name: 'MT Samudera Petro I',
      imoNumber: 'IMO 9510344',
      vesselType: 'Tanker',
      capacityDwt: 32000,
      buildYear: 2019,
      flagPort: 'Balikpapan',
      captainName: 'Capt. Andi Wijaya',
      status: 'Anchored',
      currentLocation: 'Lego Jangkar Teluk Balikpapan',
      fuelLevelPercent: 92,
    },
    {
      name: 'KMP Samudera Pasifik 08',
      imoNumber: 'IMO 9705128',
      vesselType: 'Ro-Ro',
      capacityDwt: 9800,
      buildYear: 2021,
      flagPort: 'Makassar',
      captainName: 'Capt. M. Syahrir',
      status: 'Maintenance',
      currentLocation: 'Drydock Galangan PT Dok Surabaya',
      fuelLevelPercent: 40,
    }
  ];

  const vesselIds: string[] = [];

  for (const v of initialVessels) {
    const vRef = doc(collection(db, 'vessels'));
    vesselIds.push(vRef.id);
    batch.set(vRef, {
      id: vRef.id,
      ...v,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 2. Initial Voyages
  const initialVoyages: Array<Omit<Voyage, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      voyageNumber: 'VYG-2025-JKT-SUB-042',
      vesselId: vesselIds[0] || 'v1',
      vesselName: 'KM Samudera Perkasa 01',
      originPort: 'Pelabuhan Tanjung Priok (Jakarta)',
      destinationPort: 'Pelabuhan Tanjung Perak (Surabaya)',
      departureDate: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      arrivalDate: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
      status: 'In Transit',
      cargoLoadPercent: 92,
      notes: 'Pelayaran rute ekspres reguler Jawa Timur. Cuaca laut tenang, ombak 1.0m.',
    },
    {
      voyageNumber: 'VYG-2025-SUB-MKS-019',
      vesselId: vesselIds[1] || 'v2',
      vesselName: 'KM Bahari Nusantara IX',
      originPort: 'Pelabuhan Tanjung Perak (Surabaya)',
      destinationPort: 'Pelabuhan Soekarno-Hatta (Makassar)',
      departureDate: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
      arrivalDate: new Date(Date.now() + 1000 * 60 * 60 * 62).toISOString(),
      status: 'Scheduled',
      cargoLoadPercent: 80,
      notes: 'Pemuatan kargo semen curah dan besi konstruksi proyek IKN via transit.',
    },
    {
      voyageNumber: 'VYG-2025-BLW-JKT-088',
      vesselId: vesselIds[2] || 'v3',
      vesselName: 'KM Bintang Khatulistiwa',
      originPort: 'Pelabuhan Belawan (Medan)',
      destinationPort: 'Pelabuhan Tanjung Priok (Jakarta)',
      departureDate: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      arrivalDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
      status: 'In Transit',
      cargoLoadPercent: 88,
      notes: 'Muatan komoditas ekspor kopi Sumatera & karet olahan.',
    }
  ];

  const voyageIds: string[] = [];

  for (const voy of initialVoyages) {
    const voyRef = doc(collection(db, 'voyages'));
    voyageIds.push(voyRef.id);
    batch.set(voyRef, {
      id: voyRef.id,
      ...voy,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 3. Initial Cargo Manifests
  const initialManifests: Array<Omit<Manifest, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      blNumber: 'BL-SBL-2025-0911',
      voyageId: voyageIds[0] || 'voy1',
      voyageNumber: 'VYG-2025-JKT-SUB-042',
      vesselName: 'KM Samudera Perkasa 01',
      shipperName: 'PT Indofood Sukses Makmur Tbk',
      consigneeName: 'PT Sumber Alfaria Trijaya Cabang Sidoarjo',
      cargoDescription: '15 x 40ft Kontainer Produk Makanan Kering & Minuman Ringan',
      cargoCategory: 'Kontainer FCL',
      weightTon: 340.5,
      containerCount: 15,
      freightRateIdr: 125000000,
      paymentStatus: 'Paid',
      cargoStatus: 'In Transit',
    },
    {
      blNumber: 'BL-SBL-2025-0912',
      voyageId: voyageIds[0] || 'voy1',
      voyageNumber: 'VYG-2025-JKT-SUB-042',
      vesselName: 'KM Samudera Perkasa 01',
      shipperName: 'PT Astra Honda Motor',
      consigneeName: 'PT Mitra Pinasthika Mustika (MPM Motor Surabaya)',
      cargoDescription: '8 x 40ft High Cube Kontainer Spareparts & Komponen Otomotif',
      cargoCategory: 'Kontainer FCL',
      weightTon: 180.2,
      containerCount: 8,
      freightRateIdr: 96000000,
      paymentStatus: 'Paid',
      cargoStatus: 'In Transit',
    },
    {
      blNumber: 'BL-SBL-2025-0915',
      voyageId: voyageIds[1] || 'voy2',
      voyageNumber: 'VYG-2025-SUB-MKS-019',
      vesselName: 'KM Bahari Nusantara IX',
      shipperName: 'PT Semen Indonesia (Persero) Tbk Tuban',
      consigneeName: 'PT Bosowa Berlian Motor Kargo Makassar',
      cargoDescription: 'Curah Semen Portland Tipe 1 dalam Jumbo Bag',
      cargoCategory: 'Curah Kering',
      weightTon: 1250.0,
      freightRateIdr: 450000000,
      paymentStatus: 'Credit',
      cargoStatus: 'Loaded',
    }
  ];

  for (const m of initialManifests) {
    const mRef = doc(collection(db, 'manifests'));
    batch.set(mRef, {
      id: mRef.id,
      ...m,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 4. Initial Operational Logs
  const initialLogs: Array<Omit<OperationalLog, 'id' | 'createdAt'>> = [
    {
      vesselId: vesselIds[0] || 'v1',
      vesselName: 'KM Samudera Perkasa 01',
      portName: 'Pelabuhan Tanjung Priok (Dermaga JICT)',
      activityType: 'Loading',
      recordedBy: 'Admin Operasional (Capt. Wisnu)',
      details: 'Penyelesaian lashing kontainer tier ke-4 selesai aman. Surat Laik Laut (SPB) diterbitkan oleh Syahbandar.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    },
    {
      vesselId: vesselIds[1] || 'v2',
      vesselName: 'KM Bahari Nusantara IX',
      portName: 'Pelabuhan Tanjung Perak',
      activityType: 'Bunkering',
      recordedBy: 'Chief Engineer Sunarto',
      details: 'Bunkering bahan bakar MGO sebanyak 120 kiloliter selesai dengan laju alir stabil 25 KL/jam. Uji densitas bahan bakar normal.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      vesselId: vesselIds[3] || 'v4',
      vesselName: 'MT Samudera Petro I',
      portName: 'Balikpapan Anchorage',
      activityType: 'Safety Inspection',
      recordedBy: 'Port State Control (PSC) Officer',
      details: 'Pemeriksaan rutin Annual Safety Radio & Lifeboat Release Gear dinyatakan lulus tanpa catatan deficiency.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    }
  ];

  for (const log of initialLogs) {
    const lRef = doc(collection(db, 'operational_logs'));
    batch.set(lRef, {
      id: lRef.id,
      ...log,
      createdAt: now,
    });
  }

  // Initial Welcome Broadcast
  const actRef = doc(collection(db, 'live_activities'));
  batch.set(actRef, {
    id: actRef.id,
    actorName: 'Sistem PT Japara Bahari Line',
    actionType: 'CREATE',
    entityType: 'LOG',
    message: 'Sistem komando operasional armada pelayaran online diaktifkan dengan sinkronisasi multi-user real-time.',
    timestamp: now,
  });

  await batch.commit();
}
