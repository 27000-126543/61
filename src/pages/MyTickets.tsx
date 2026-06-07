import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Ticket } from '@/types';
import { Ticket as TicketIcon, Calendar, MapPin, QrCode, ArrowRightLeft, RefreshCw, Check, X, ChevronDown, ChevronUp, Gift, UserPlus } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/utils';
import TicketDetail from './TicketDetail';
import TransferTicket from './TransferTicket';
import RefundTicket from './RefundTicket';

export default function MyTickets() {
  const { tickets, events, currentUser } = useAppStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTransfer, setShowTransfer] = useState<Ticket | null>(null);
  const [showRefund, setShowRefund] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<'all' | 'valid' | 'used' | 'refunded'>('all');

  const myTickets = tickets.filter((t) => t.userId === currentUser?.id || t.transferChain.includes(currentUser?.id || ''));
  const filteredTickets = myTickets.filter((t) => filter === 'all' || t.status === filter);

  const getStatusBadge = (status: Ticket['status']) => {
    const map = {
      valid: { text: '有效', color: 'bg-green-100 text-green-700' },
      used: { text: '已使用', color: 'bg-gray-100 text-gray-600' },
      refunded: { text: '已退票', color: 'bg-orange-100 text-orange-600' },
      transferred: { text: '已转赠', color: 'bg-blue-100 text-blue-600' },
      expired: { text: '已过期', color: 'bg-red-100 text-red-600' }
    };
    const s = map[status] || map.valid;
    return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', s.color)}>{s.text}</span>;
  };

  if (selectedTicket) {
    return <TicketDetail ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">我的票夹</h1>
      <p className="text-gray-500 mb-6">共 {myTickets.length} 张电子票</p>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'all' as const, label: '全部' },
          { id: 'valid' as const, label: '有效票' },
          { id: 'used' as const, label: '已使用' },
          { id: 'refunded' as const, label: '已退票' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition',
              filter === f.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <TicketIcon size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无电子票，快去选购喜欢的演出吧~</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const event = events.find((e) => e.id === ticket.eventId);
            if (!event) return null;

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition group"
              >
                <div className="flex">
                  <div className="w-36 aspect-[3/4] flex-shrink-0">
                    <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                        {event.title}
                      </h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <Calendar size={14} /> {event.startTime}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <MapPin size={14} /> {event.city} · {event.venue}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <TicketIcon size={14} />
                        {ticket.seatInfo.zone} · {ticket.seatInfo.row}排 {ticket.seatInfo.number}座
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-primary-600 font-bold">{formatCurrency(ticket.paidPrice)}</p>
                      <div className="flex items-center gap-2">
                        {ticket.status === 'valid' && (
                          <>
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition"
                            >
                              <QrCode size={14} /> 查看票码
                            </button>
                            <button
                              onClick={() => setShowTransfer(ticket)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
                            >
                              <Gift size={14} /> 转赠
                            </button>
                            <button
                              onClick={() => setShowRefund(ticket)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
                            >
                              <RefreshCw size={14} /> 退票
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTransfer && <TransferTicket ticket={showTransfer} onClose={() => setShowTransfer(null)} />}
      {showRefund && <RefundTicket ticket={showRefund} onClose={() => setShowRefund(null)} />}
    </div>
  );
}
