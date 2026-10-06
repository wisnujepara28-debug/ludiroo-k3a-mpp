import React, { useState } from 'react';
import { FleetDispatch, OnlineUser } from '../../types';
import { 
  Radio, 
  Send, 
  Clock, 
  User, 
  Sparkles, 
  MessageSquare,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FleetDispatchBoardProps {
  dispatches: FleetDispatch[];
  onlineUsers: OnlineUser[];
  currentUserName: string;
  currentUserRole: string;
  onSendDispatch: (message: string) => Promise<void>;
}

export const FleetDispatchBoard: React.FC<FleetDispatchBoardProps> = ({
  dispatches,
  onlineUsers,
  currentUserName,
  currentUserRole,
  onSendDispatch,
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const quickDispatches = [
    '⚓ Dermaga siap untuk sandar & olah gerak kapal',
    '🌊 Laporan cuaca laut tenang, ombak 0.8 meter aman',
    '📦 Muatan petikemas telah selesai lashing di palka',
    '⛽ Pengisian bunker MGO selesai, siap berlayar',
    '🚢 Surat Persetujuan Berlayar (SPB) diterbitkan',
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendDispatch(message);
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSend = async (text: string) => {
    setMessage(text);
  };

  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 text-white p-5 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center ring-1 ring-sky-500/30">
            <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-tight">
                RADIO KOMUNIKASI & DISPATCH OPERASIONAL
              </h3>
              <span className="text-[10px] font-bold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30">
                Semua Petugas Terhubung
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pesan radio langsung tersinkronisasi seketika ke seluruh operator yang membuka aplikasi
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Quick Dispatch Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-slate-400 text-[10px] font-bold shrink-0 uppercase">Pesan Cepat:</span>
            {quickDispatches.map((qd, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickSend(qd)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer shrink-0 text-[10px] font-medium"
              >
                {qd}
              </button>
            ))}
          </div>

          {/* Dispatch Feed Container */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 max-h-56 overflow-y-auto space-y-2.5">
            {dispatches.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <MessageSquare className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                <span>Belum ada pesan radio. Kirimkan pesan pertama untuk koordinasi antar petugas.</span>
              </div>
            ) : (
              dispatches.map((d) => {
                const isMe = d.senderName === currentUserName;
                return (
                  <div
                    key={d.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isMe
                        ? 'bg-sky-950/40 border-sky-800/60 ml-4'
                        : 'bg-slate-800/50 border-slate-700/60 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={isMe ? 'text-sky-300' : 'text-emerald-400'}>
                          {d.senderName} {isMe && '(Anda)'}
                        </span>
                        <span className="text-slate-500 font-normal">[{d.senderRole}]</span>
                      </div>
                      <span className="text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(d.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed">{d.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Kirim pesan radio sebagai ${currentUserName}...`}
              className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : 'Siarkan'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
