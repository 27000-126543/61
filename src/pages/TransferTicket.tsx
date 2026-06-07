import { useState } from 'react';
import { Ticket } from '@/types';
import { useAppStore } from '@/store/appStore';
import { X, Gift, UserPlus, Check, Search } from 'lucide-react';
import { cn } from '@/utils';

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export default function TransferTicket({ ticket, onClose }: Props) {
  const { events, users, transferTicket, currentUser } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [success, setSuccess] = useState(false);

  const event = events.find((e) => e.id === ticket.eventId);
  const filteredUsers = users.filter(
    (u) => u.id !== currentUser?.id && (u.username.includes(searchText) || u.phone.includes(searchText))
  );

  const handleConfirm = () => {
    if (!selectedUser) return;
    const ok = transferTicket(ticket.id, selectedUser);
    if (ok) {
      setSuccess(true);
      setTimeout(onClose, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg">
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Gift size={20} />
            <h2 className="text-lg font-bold">转赠电子票</h2>
          </div>
          <p className="text-white/80 text-sm">{event?.title}</p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">转赠成功</h3>
              <p className="text-gray-500 text-sm">电子票已成功转赠给好友，原票已自动失效</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                {[1, 2].map((s) => (
                  <div key={s} className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        step >= s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                      )}>
                        {s}
                      </div>
                      <span className={cn('text-sm', step >= s ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                        {s === 1 ? '选择好友' : '确认转赠'}
                      </span>
                    </div>
                    {s < 2 && <div className={cn('h-0.5 mt-1', step >= 2 ? 'bg-primary-500' : 'bg-gray-200')} />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="搜索好友用户名或手机号"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition',
                          selectedUser === user.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-100 hover:bg-gray-50'
                        )}
                      >
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-200" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                        {selectedUser === user.id && <Check className="text-primary-500" size={20} />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => selectedUser && setStep(2)}
                    disabled={!selectedUser}
                    className={cn(
                      'w-full mt-4 py-3 rounded-xl font-medium transition',
                      selectedUser
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    下一步
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={users.find((u) => u.id === selectedUser)?.avatar}
                        alt=""
                        className="w-12 h-12 rounded-full bg-gray-200"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {users.find((u) => u.id === selectedUser)?.username}
                        </p>
                        <p className="text-xs text-gray-500">对方接受后原票立即失效</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 pt-3 border-t border-gray-200">
                      <p>演出: {event?.title}</p>
                      <p>座位: {ticket.seatInfo.zone} · {ticket.seatInfo.row}排 {ticket.seatInfo.number}座</p>
                      <p>时间: {event?.startTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl hover:shadow-lg transition"
                    >
                      确认转赠
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
