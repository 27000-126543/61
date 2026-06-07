import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Shield, Share2, QrCode as QrIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from '@/types';
import { useAppStore } from '@/store/appStore';
import { formatCurrency, formatDate } from '@/utils';

interface Props {
  ticket: Ticket;
  onBack: () => void;
}

export default function TicketDetail({ ticket, onBack }: Props) {
  const { events, verifyAndCheckIn } = useAppStore();
  const [checkedIn, setCheckedIn] = useState(ticket.status === 'used');
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null);
  const event = events.find((e) => e.id === ticket.eventId);

  if (!event) return null;

  const handleCheckIn = () => {
    const result = verifyAndCheckIn(ticket.qrCode || ticket.id);
    setCheckInMessage(result.message);
    if (result.success) {
      setCheckedIn(true);
    }
    setTimeout(() => setCheckInMessage(null), 3000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">电子票详情</h1>
      </div>

      <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm mb-1">电子票</p>
              <h2 className="text-xl font-bold">{event.title}</h2>
            </div>
            <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition">
              <Share2 size={18} />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 text-gray-900 relative -mx-2">
            <div className="absolute -left-4 top-1/2 w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-700 rounded-full" style={{ transform: 'translateY(-50%)' }} />
            <div className="absolute -right-4 top-1/2 w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-700 rounded-full" style={{ transform: 'translateY(-50%)' }} />

            <div className="flex justify-center mb-6">
              <div className="bg-white p-3 rounded-xl shadow-inner border border-gray-100">
                <QRCodeSVG
                  value={ticket.qrCode}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 -mx-6 mb-4" />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">座位信息</span>
                <span className="font-medium">{ticket.seatInfo.zone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">排号座号</span>
                <span className="font-medium">{ticket.seatInfo.row}排 {ticket.seatInfo.number}座</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500"><Calendar size={14} className="inline mr-1" />观演时间</span>
                <span className="font-medium">{event.startTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500"><MapPin size={14} className="inline mr-1" />场馆</span>
                <span className="font-medium text-right text-sm">{event.venue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">实付金额</span>
                <span className="font-bold text-primary-600">{formatCurrency(ticket.paidPrice)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-white/80 text-xs">
            <div className="flex items-center gap-1.5">
              <Shield size={14} />
              <span>防伪码: {ticket.antiFakeCode}</span>
            </div>
            <span>购票: {ticket.purchaseTime}</span>
          </div>

          {ticket.transferChain.length > 1 && (
            <div className="mt-3 p-3 bg-white/10 rounded-xl text-xs">
              <p className="text-white/80">转赠链路: 经过 {ticket.transferChain.length} 次转赠</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={checkedIn || ticket.status !== 'valid'}
        className="w-full mt-6 py-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-medium rounded-2xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {checkedIn ? '✓ 已核销入场' : ticket.status !== 'valid' ? '该票已无效' : '扫码入场核销（演示）'}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        请在入场时出示此二维码，工作人员扫码后即可入场
      </p>
    </div>
  );
}
