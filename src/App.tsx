/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { VesselsTab } from './components/vessels/VesselsTab';
import { VesselFormModal } from './components/vessels/VesselFormModal';
import { VoyagesTab } from './components/voyages/VoyagesTab';
import { VoyageFormModal } from './components/voyages/VoyageFormModal';
import { ManifestsTab } from './components/manifests/ManifestsTab';
import { ManifestFormModal } from './components/manifests/ManifestFormModal';
import { OperationalLogsTab } from './components/logs/OperationalLogsTab';
import { LogFormModal } from './components/logs/LogFormModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { LiveActivityBar } from './components/common/LiveActivityBar';

import {
  Vessel,
  Voyage,
  Manifest,
  OperationalLog,
  VesselStatus,
  VoyageStatus,
  CargoStatus,
  OnlineUser,
  LiveActivity,
} from './types';

import {
  subscribeToVessels,
  createVessel,
  updateVessel,
  deleteVessel,
  subscribeToVoyages,
  createVoyage,
  updateVoyage,
  deleteVoyage,
  subscribeToManifests,
  createManifest,
  updateManifest,
  deleteManifest,
  subscribeToOperationalLogs,
  createOperationalLog,
  deleteOperationalLog,
  seedInitialMaritimeData,
  subscribeToOnlineUsers,
  subscribeToLiveActivities,
  updatePresence,
} from './services/shippingService';

function MainApp() {
  const { user, loading: authLoading } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Firestore Data States (Source of Truth)
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [logs, setLogs] = useState<OperationalLog[]>([]);

  // Multi-User Presence & Live Activities
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);

  // Loading & Seeding States
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Modals Open State
  const [vesselModalOpen, setVesselModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  const [voyageModalOpen, setVoyageModalOpen] = useState(false);
  const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);

  const [manifestModalOpen, setManifestModalOpen] = useState(false);
  const [editingManifest, setEditingManifest] = useState<Manifest | null>(null);

  const [logModalOpen, setLogModalOpen] = useState(false);

  // Confirm Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'vessel' | 'voyage' | 'manifest' | 'log';
    item: any;
    title: string;
    message: string;
    itemName: string;
  }>({
    isOpen: false,
    type: 'vessel',
    item: null,
    title: '',
    message: '',
    itemName: '',
  });

  // Toasts Feedback State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const lastKnownActivityId = useRef<string | null>(null);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time Multi-User Presence Heartbeat
  useEffect(() => {
    if (!user) return;

    updatePresence(user, activeTab);

    const interval = setInterval(() => {
      updatePresence(user, activeTab);
    }, 35000);

    return () => clearInterval(interval);
  }, [user, activeTab]);

  // Real-time Subscriptions to Online Users and Live Activities
  useEffect(() => {
    if (!user) return;

    const unsubOnline = subscribeToOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    const unsubActivities = subscribeToLiveActivities((activities) => {
      if (activities.length > 0) {
        const newest = activities[0];
        // If an update was triggered by someone else, alert the operator
        if (
          lastKnownActivityId.current &&
          newest.id !== lastKnownActivityId.current &&
          newest.actorName !== user.displayName
        ) {
          addToast('info', `Pembaruan Realtime: ${newest.actorName}`, newest.message);
        }
        lastKnownActivityId.current = newest.id;
      }
      setLiveActivities(activities);
    });

    return () => {
      unsubOnline();
      unsubActivities();
    };
  }, [user]);

  // Real-time Firestore Subscriptions for Maritime Data
  useEffect(() => {
    if (!user) return;

    setIsDataLoading(true);

    const unsubVessels = subscribeToVessels(
      (data) => {
        setVessels(data);
        setIsDataLoading(false);
      },
      (err) => {
        addToast('error', 'Gagal memuat data armada', err.message);
        setIsDataLoading(false);
      }
    );

    const unsubVoyages = subscribeToVoyages(
      (data) => setVoyages(data),
      (err) => addToast('error', 'Gagal memuat jadwal pelayaran', err.message)
    );

    const unsubManifests = subscribeToManifests(
      (data) => setManifests(data),
      (err) => addToast('error', 'Gagal memuat manifest kargo', err.message)
    );

    const unsubLogs = subscribeToOperationalLogs(
      (data) => setLogs(data),
      (err) => addToast('error', 'Gagal memuat log operasional', err.message)
    );

    return () => {
      unsubVessels();
      unsubVoyages();
      unsubManifests();
      unsubLogs();
    };
  }, [user]);

  // Seed Initial Demo Maritime Data to Firestore
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedInitialMaritimeData();
      addToast('success', 'Data Demo Berhasil Dimuat!', 'Data armada, jadwal pelayaran, dan manifest telah ditulis ke Firestore.');
    } catch (err: any) {
      addToast('error', 'Gagal memuat data demo', err?.message || 'Terjadi kesalahan');
    } finally {
      setIsSeeding(false);
    }
  };

  /* =========================================================================
     VESSEL CRUD HANDLERS
     ========================================================================= */

  const handleOpenAddVessel = () => {
    setEditingVessel(null);
    setVesselModalOpen(true);
  };

  const handleOpenEditVessel = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setVesselModalOpen(true);
  };

  const handleSaveVessel = async (vesselData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>) => {
    setModalLoading(true);
    try {
      const actor = user?.displayName || 'Petugas Maritim';
      if (editingVessel) {
        await updateVessel(editingVessel.id, vesselData, actor);
        addToast('success', 'Data Kapal Diperbarui', `Perubahan untuk ${vesselData.name} tersimpan di Firestore.`);
      } else {
        await createVessel(vesselData, actor);
        addToast('success', 'Kapal Baru Terdaftar', `${vesselData.name} berhasil ditambahkan ke armada.`);
      }
      setVesselModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Gagal Menyimpan Kapal', err?.message || 'Gagal menyimpan ke database.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickUpdateVesselStatus = async (id: string, newStatus: VesselStatus) => {
    try {
      const actor = user?.displayName || 'Petugas Maritim';
      await updateVessel(id, { status: newStatus }, actor);
      addToast('info', 'Status Kapal Diperbarui', `Status kapal diubah menjadi ${newStatus}.`);
    } catch (err: any) {
      addToast('error', 'Gagal Mengubah Status', err?.message || 'Gagal memodifikasi status.');
    }
  };

  const handleDeleteVesselClick = (vessel: Vessel) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'vessel',
      item: vessel,
      title: 'Hapus Kapal dari Armada?',
      message: `Tindakan ini akan menghapus rekaman kapal "${vessel.name}" secara permanen dari database cloud Firestore.`,
      itemName: `${vessel.name} (${vessel.imoNumber})`,
    });
  };

  /* =========================================================================
     VOYAGE CRUD HANDLERS
     ========================================================================= */

  const handleOpenAddVoyage = () => {
    setEditingVoyage(null);
    setVoyageModalOpen(true);
  };

  const handleOpenEditVoyage = (voyage: Voyage) => {
    setEditingVoyage(voyage);
    setVoyageModalOpen(true);
  };

  const handleSaveVoyage = async (voyageData: Omit<Voyage, 'id' | 'createdAt' | 'updatedAt'>) => {
    setModalLoading(true);
    try {
      const actor = user?.displayName || 'Petugas Navigasi';
      if (editingVoyage) {
        await updateVoyage(editingVoyage.id, voyageData, actor);
        addToast('success', 'Jadwal Diperbarui', `Rute ${voyageData.voyageNumber} berhasil diupdate.`);
      } else {
        await createVoyage(voyageData, actor);
        addToast('success', 'Jadwal Ditambahkan', `Pelayaran ${voyageData.voyageNumber} dijadwalkan.`);
      }
      setVoyageModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Gagal Menyimpan Jadwal', err?.message || 'Gagal menyimpan ke database.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickUpdateVoyageStatus = async (id: string, newStatus: VoyageStatus) => {
    try {
      const actor = user?.displayName || 'Petugas Navigasi';
      await updateVoyage(id, { status: newStatus }, actor);
      addToast('info', 'Status Pelayaran Diperbarui', `Status rute diubah menjadi ${newStatus}.`);
    } catch (err: any) {
      addToast('error', 'Gagal Mengubah Status', err?.message || 'Terjadi galat.');
    }
  };

  const handleDeleteVoyageClick = (voyage: Voyage) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'voyage',
      item: voyage,
      title: 'Hapus Jadwal Pelayaran?',
      message: `Jadwal pelayaran "${voyage.voyageNumber}" akan dihapus dari sistem operasional.`,
      itemName: `${voyage.voyageNumber} - ${voyage.vesselName}`,
    });
  };

  /* =========================================================================
     MANIFEST CRUD HANDLERS
     ========================================================================= */

  const handleOpenAddManifest = () => {
    setEditingManifest(null);
    setManifestModalOpen(true);
  };

  const handleOpenEditManifest = (manifest: Manifest) => {
    setEditingManifest(manifest);
    setManifestModalOpen(true);
  };

  const handleSaveManifest = async (manifestData: Omit<Manifest, 'id' | 'createdAt' | 'updatedAt'>) => {
    setModalLoading(true);
    try {
      const actor = user?.displayName || 'Petugas Kargo';
      if (editingManifest) {
        await updateManifest(editingManifest.id, manifestData, actor);
        addToast('success', 'Dokumen B/L Diperbarui', `Data manifest ${manifestData.blNumber} berhasil diperbarui.`);
      } else {
        await createManifest(manifestData, actor);
        addToast('success', 'Manifest B/L Diterbitkan', `Bill of Lading ${manifestData.blNumber} tersimpan di Firestore.`);
      }
      setManifestModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Gagal Menyimpan Manifest', err?.message || 'Gagal menyimpan ke database.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickUpdateCargoStatus = async (id: string, newStatus: CargoStatus) => {
    try {
      const actor = user?.displayName || 'Petugas Kargo';
      await updateManifest(id, { cargoStatus: newStatus }, actor);
      addToast('info', 'Status Kargo Diperbarui', `Status muatan kargo diubah menjadi ${newStatus}.`);
    } catch (err: any) {
      addToast('error', 'Gagal Mengubah Status', err?.message || 'Terjadi galat.');
    }
  };

  const handleDeleteManifestClick = (manifest: Manifest) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'manifest',
      item: manifest,
      title: 'Hapus Dokumen Bill of Lading (B/L)?',
      message: `Dokumen muatan "${manifest.blNumber}" akan dibatalkan dan dihapus permanen.`,
      itemName: `${manifest.blNumber} (${manifest.shipperName})`,
    });
  };

  /* =========================================================================
     OPERATIONAL LOGS CRUD HANDLERS
     ========================================================================= */

  const handleOpenAddLog = () => {
    setLogModalOpen(true);
  };

  const handleSaveLog = async (logData: Omit<OperationalLog, 'id' | 'createdAt'>) => {
    setModalLoading(true);
    try {
      const actor = user?.displayName || 'Petugas Pelabuhan';
      await createOperationalLog(logData, actor);
      addToast('success', 'Catatan Log Tersimpan', `Aktivitas ${logData.activityType} untuk ${logData.vesselName} tercatat.`);
      setLogModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Gagal Menyimpan Log', err?.message || 'Gagal menyimpan ke database.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteLogClick = (log: OperationalLog) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'log',
      item: log,
      title: 'Hapus Catatan Log?',
      message: 'Catatan log aktivitas ini akan dihapus dari buku riwayat operasional.',
      itemName: `${log.activityType} - ${log.vesselName}`,
    });
  };

  /* =========================================================================
     EXECUTE DELETE CONFIRMATION
     ========================================================================= */

  const handleExecuteDelete = async () => {
    if (!deleteConfirm.item) return;

    setModalLoading(true);
    const actor = user?.displayName || 'Petugas Maritim';
    try {
      switch (deleteConfirm.type) {
        case 'vessel':
          await deleteVessel(deleteConfirm.item.id, actor, deleteConfirm.item.name);
          addToast('success', 'Kapal Dihapus', `Data kapal telah dihapus dari Firestore.`);
          break;
        case 'voyage':
          await deleteVoyage(deleteConfirm.item.id, actor, deleteConfirm.item.voyageNumber);
          addToast('success', 'Jadwal Dihapus', `Jadwal pelayaran telah dihapus.`);
          break;
        case 'manifest':
          await deleteManifest(deleteConfirm.item.id, actor, deleteConfirm.item.blNumber);
          addToast('success', 'Manifest Dihapus', `Dokumen B/L telah dihapus.`);
          break;
        case 'log':
          await deleteOperationalLog(deleteConfirm.item.id, actor);
          addToast('success', 'Log Dihapus', `Catatan log telah dihapus.`);
          break;
      }
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      addToast('error', 'Gagal Menghapus Data', err?.message || 'Gagal menghapus dari database.');
    } finally {
      setModalLoading(false);
    }
  };

  // If Auth is loading, display clean loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-300">Menghubungkan ke Jaringan Maritim Terpadu...</p>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Show Login Form if not logged in
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vesselCount={vessels.length}
        voyageCount={voyages.length}
        manifestCount={manifests.length}
        onlineCount={Math.max(1, onlineUsers.length)}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
      />

      {/* Multi-User Live Activity & Presence Bar */}
      <LiveActivityBar
        onlineUsers={onlineUsers}
        liveActivities={liveActivities}
        currentUserId={user.uid}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            vessels={vessels}
            voyages={voyages}
            manifests={manifests}
            logs={logs}
            setActiveTab={setActiveTab}
            onOpenAddVessel={handleOpenAddVessel}
            onOpenAddVoyage={handleOpenAddVoyage}
            onOpenAddManifest={handleOpenAddManifest}
            onSeedData={handleSeedData}
            isSeeding={isSeeding}
          />
        )}

        {activeTab === 'vessels' && (
          <VesselsTab
            vessels={vessels}
            onOpenAddModal={handleOpenAddVessel}
            onEditVessel={handleOpenEditVessel}
            onDeleteVessel={handleDeleteVesselClick}
            onQuickUpdateStatus={handleQuickUpdateVesselStatus}
          />
        )}

        {activeTab === 'voyages' && (
          <VoyagesTab
            voyages={voyages}
            vessels={vessels}
            onOpenAddModal={handleOpenAddVoyage}
            onEditVoyage={handleOpenEditVoyage}
            onDeleteVoyage={handleDeleteVoyageClick}
            onQuickUpdateStatus={handleQuickUpdateVoyageStatus}
          />
        )}

        {activeTab === 'manifests' && (
          <ManifestsTab
            manifests={manifests}
            voyages={voyages}
            onOpenAddModal={handleOpenAddManifest}
            onEditManifest={handleOpenEditManifest}
            onDeleteManifest={handleDeleteManifestClick}
            onQuickUpdateCargoStatus={handleQuickUpdateCargoStatus}
          />
        )}

        {activeTab === 'logs' && (
          <OperationalLogsTab
            logs={logs}
            onOpenAddModal={handleOpenAddLog}
            onDeleteLog={handleDeleteLogClick}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} PT Japara Bahari Line. Sistem Informasi Manajemen Pelayaran Maritim Terpadu.
          </span>
          <span className="text-[11px] text-slate-400">
            Terhubung ke Google Cloud Firestore • Multi-User Realtime Presence Aktif
          </span>
        </div>
      </footer>

      {/* Modals */}
      <VesselFormModal
        isOpen={vesselModalOpen}
        onClose={() => setVesselModalOpen(false)}
        onSubmit={handleSaveVessel}
        initialData={editingVessel}
        isLoading={modalLoading}
      />

      <VoyageFormModal
        isOpen={voyageModalOpen}
        onClose={() => setVoyageModalOpen(false)}
        onSubmit={handleSaveVoyage}
        initialData={editingVoyage}
        vessels={vessels}
        isLoading={modalLoading}
      />

      <ManifestFormModal
        isOpen={manifestModalOpen}
        onClose={() => setManifestModalOpen(false)}
        onSubmit={handleSaveManifest}
        initialData={editingManifest}
        voyages={voyages}
        isLoading={modalLoading}
      />

      <LogFormModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSubmit={handleSaveLog}
        vessels={vessels}
        isLoading={modalLoading}
        currentOfficerName={user?.displayName || 'Petugas Maritim'}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        itemName={deleteConfirm.itemName}
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
        isLoading={modalLoading}
      />

      {/* Global Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
