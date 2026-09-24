import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Printer,
  Smartphone,
  CheckCircle2,
  Clock,
  BellRing,
  QrCode,
  Building2,
} from 'lucide-react';
import { BusinessProfile, Invoice } from '../types';
import {
  copyToClipboard,
  formatZAR,
  generateInvoiceWhatsAppText,
  openWhatsApp,
} from '../utils/whatsapp';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  profile: BusinessProfile;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (invoiceId: string) => void;
  onOpenReminder: (invoice: Invoice) => void;
  onOpenStatusCard: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  profile,
  isOpen,
  onClose,
  onToggleStatus,
  onOpenReminder,
  onOpenStatusCard,
}) => {
  const [tab, setTab] = useState<'slip' | 'whatsapp' | 'payment'>('slip');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPayShap, setCopiedPayShap] = useState(false);

  if (!isOpen || !invoice) return null;

  const isPaid = invoice.status === 'paid';
  const whatsappMessage = generateInvoiceWhatsAppText(invoice, profile);

  const handleCopyWhatsApp = async () => {
    const success = await copyToClipboard(whatsappMessage);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleCopyPayShap = async () => {
    const payText =
      profile.paymentType === 'payshap' && profile.payshapId
        ? profile.payshapId
        : `${profile.bankName} Acc: ${profile.accountNumber} (Ref: ${invoice.clientName})`;
    const success = await copyToClipboard(payText);
    if (success) {
      setCopiedPayShap(true);
      setTimeout(() => setCopiedPayShap(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    openWhatsApp(invoice.clientPhone, whatsappMessage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300">
              #{invoice.id}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isPaid
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              <span>{isPaid ? 'PAID' : 'PENDING PAYMENT'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleStatus(invoice.id)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              {isPaid ? 'Mark Pending' : 'Mark as Paid ✅'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-neutral-800 flex items-center gap-2 no-print bg-neutral-950/50">
          <button
            onClick={() => setTab('slip')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all ${
              tab === 'slip'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Invoice Slip
          </button>
          <button
            onClick={() => setTab('whatsapp')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all ${
              tab === 'whatsapp'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            WhatsApp Text
          </button>
          <button
            onClick={() => setTab('payment')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all ${
              tab === 'payment'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            PayShap & Bank Details
          </button>
        </div>

        <div className="p-5 max-h-[72vh] overflow-y-auto">
          {/* TAB 1: INVOICE SLIP (Professional layout with business logo) */}
          {tab === 'slip' && (
            <div className="space-y-5">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 shadow-sm print-card">
                {/* Brand Header with Uploaded Business Logo */}
                <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full border border-neutral-700 bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                      {profile.logoUrl ? (
                        <img
                          src={profile.logoUrl}
                          alt={profile.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{profile.logoEmoji || '✂️'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">
                        {profile.businessName}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {profile.location || 'East London, South Africa'}
                      </p>
                      {profile.phone && (
                        <p className="text-[11px] text-neutral-500 font-mono">
                          WhatsApp: {profile.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-neutral-400 block">INVOICE</span>
                    <span className="font-mono text-sm font-semibold text-white">
                      #{invoice.id}
                    </span>
                    <span className="text-[11px] text-neutral-500 block mt-1">
                      {new Date(invoice.createdAt).toLocaleDateString('en-ZA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Billed To */}
                <div className="py-4 border-b border-neutral-800 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-500 block uppercase tracking-wider">
                      Billed To
                    </span>
                    <span className="text-sm font-bold text-white">{invoice.clientName}</span>
                    {invoice.clientPhone && (
                      <span className="text-xs text-neutral-400 font-mono block">
                        {invoice.clientPhone}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-neutral-500 block uppercase tracking-wider">
                      Payment Status
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isPaid ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isPaid ? 'PAID IN FULL ✅' : 'PENDING PAYMENT ⏳'}
                    </span>
                  </div>
                </div>

                {/* Line Item Table */}
                <div className="py-4 border-b border-neutral-800">
                  <div className="flex justify-between text-xs text-neutral-400 font-semibold mb-2">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-neutral-200 font-medium">{invoice.item}</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {formatZAR(invoice.price)}
                    </span>
                  </div>
                  {invoice.notes && (
                    <p className="text-xs text-neutral-400 italic mt-1 bg-neutral-900/60 p-2 rounded-lg">
                      Note: {invoice.notes}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-neutral-300">Total {isPaid ? 'Paid' : 'Due'}:</span>
                  <span className="font-mono text-2xl font-extrabold text-emerald-400 tabular-nums">
                    {formatZAR(invoice.price)}
                  </span>
                </div>

                {/* Banking details snippet inside card */}
                {!isPaid && (
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 bg-neutral-900/40 p-3 rounded-lg text-xs space-y-1">
                    <div className="text-neutral-400 font-semibold flex items-center gap-1">
                      <span>How to pay:</span>
                    </div>
                    {profile.paymentType === 'payshap' && profile.payshapId ? (
                      <div className="font-mono text-emerald-300">
                        ⚡ PayShap: {profile.payshapId}
                      </div>
                    ) : (
                      <div className="font-mono text-neutral-300">
                        🏦 {profile.bankName} · Acc: {profile.accountNumber} · Code: {profile.branchCode}
                      </div>
                    )}
                    <div className="text-neutral-400 text-[11px]">
                      Ref: {invoice.clientName}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Slip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md col-span-2 sm:col-span-1"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenStatusCard(invoice)}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-1"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Status Card</span>
                </button>

                {!isPaid && (
                  <button
                    type="button"
                    onClick={() => onOpenReminder(invoice)}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-1"
                  >
                    <BellRing className="w-4 h-4" />
                    <span>Remind</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: WHATSAPP TEXT PREVIEW */}
          {tab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-200 font-sans whitespace-pre-wrap leading-relaxed select-text shadow-inner">
                {whatsappMessage}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="py-2.5 px-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send in WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT / PAYSHAP LINK */}
          {tab === 'payment' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">
                        Direct Payment Link
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        South African instant PayShap / Capitec details
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {formatZAR(invoice.price)}
                  </span>
                </div>

                {profile.paymentType === 'payshap' && profile.payshapId ? (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-2">
                    <span className="text-xs text-neutral-400 block font-medium">
                      ⚡ PayShap ID / Cell
                    </span>
                    <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {profile.payshapId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPayShap}
                        className="text-xs text-neutral-300 hover:text-white px-2 py-1 bg-neutral-800 rounded flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Client can pay instantly from any SA banking app (Capitec, FNB, Standard Bank, Nedbank, TymeBank).
                    </p>
                  </div>
                ) : null}

                {/* Bank Account Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Bank:</span>
                    <span className="font-semibold text-white">{profile.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Account Number:</span>
                    <span className="font-mono font-semibold text-white">{profile.accountNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Branch Code:</span>
                    <span className="font-mono text-white">{profile.branchCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Account Name:</span>
                    <span className="text-white">{profile.accountHolder || profile.businessName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">Reference:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {invoice.clientName.replace(/\s+/g, '')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyPayShap}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedPayShap ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Payment Details Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Banking & PayShap Details</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
