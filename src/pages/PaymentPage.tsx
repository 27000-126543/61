import { useState } from 'react';
import { ArrowLeft, CreditCard, Check, Shield, Clock, Ticket, Sparkles } from 'lucide-react';
import { useAppStore, PaymentInfo } from '@/store/appStore';
import { formatCurrency, cn } from '@/utils';
import { memberLevelConfig } from '@/data/mockData';
import { EventItem, Seat } from '@/types';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  event?: EventItem;
  seats?: Seat[];
}

export default function PaymentPage({ onBack, onSuccess, event: propEvent, seats: propSeats }: Props) {
  const { pendingSeats, pendingEventId, events, currentUser, processPayment, clearPendingSeats, selectSeats } = useAppStore();
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | 'card'>('wechat');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seats = propSeats && propSeats.length > 0 ? propSeats : pendingSeats;
  const event = propEvent || events.find((e) => e.id === pendingEventId);

  if (!event || seats.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">未找到待支付订单（pendingSeats: ${pendingSeats.length}, propSeats: ${propSeats?.length || 0}）</p>
        <button onClick={onBack} className="px-6 py-2.5 bg-primary-500 text-white rounded-xl">
          返回选座
        </button>
      </div>
    );
  }

  const originalTotal = seats.reduce((s, seat) => s + seat.price, 0);
  const discount = currentUser ? 1 - (currentUser.memberLevel === 'normal' ? 1 : currentUser.memberLevel === 'silver' ? 0.95 : currentUser.memberLevel === 'gold' ? 0.9 : 0.85) : 0;
  const discountAmount = Math.round(originalTotal * discount);
  const finalTotal = originalTotal - discountAmount;

  const handlePay = () => {
    if (!currentUser) return;
    setProcessing(true);
    setError(null);

    selectSeats(event.id, seats);

    setTimeout(() => {
      const paymentInfo: PaymentInfo = { method: paymentMethod };
      const result = processPayment(paymentInfo);

      if (result && result.length > 0) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2500);
      } else {
        setError('支付失败，请重试');
      }
      setProcessing(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
          <Check className="text-white" size={44} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">支付成功！</h2>
        <p className="text-gray-500 mb-1">您的电子票已生成</p>
        <p className="text-gray-400 text-sm">共 {seats.length} 张 · 实付 {formatCurrency(finalTotal)}</p>
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-left">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <Ticket size={16} /> 电子票已发送至您的票夹
          </p>
          <p className="text-sm text-green-700 flex items-center gap-2 mt-1">
            <Sparkles size={16} /> 已累积 {formatCurrency(finalTotal)} 会员消费
          </p>
        </div>
      </div>
    );
  }

  const levelConfig = currentUser ? memberLevelConfig[currentUser.memberLevel] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-36">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">确认支付</h1>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-4">
        <div className="flex gap-4">
          <img src={event.coverImage} alt="" className="w-24 h-20 rounded-xl object-cover" />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 line-clamp-1">{event.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{event.startTime}</p>
            <p className="text-sm text-gray-500">{event.city} · {event.venue}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          {seats.map((seat) => {
            const zone = event.zones.find((z) => z.id === seat.zoneId);
            return (
              <div key={seat.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {zone?.name} · {seat.row}排 {seat.number}座
                </span>
                <span className="font-medium text-gray-900">{formatCurrency(seat.price)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {discountAmount > 0 && levelConfig && (
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary-600" size={18} />
              <span className="text-sm font-medium text-primary-700">{levelConfig.name}专享折扣</span>
            </div>
            <span className="text-primary-600 font-bold">-{formatCurrency(discountAmount)}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 mb-4">
        <h3 className="font-bold text-gray-900 mb-4">选择支付方式</h3>
        <div className="space-y-3">
          {[
            { id: 'wechat' as const, name: '微信支付', color: 'bg-green-500', desc: '推荐使用' },
            { id: 'alipay' as const, name: '支付宝', color: 'bg-blue-500', desc: '' },
            { id: 'card' as const, name: '银行卡支付', color: 'bg-gray-700', desc: '支持储蓄卡/信用卡' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition',
                paymentMethod === m.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', m.color)}>
                <CreditCard className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{m.name}</p>
                {m.desc && <p className="text-xs text-gray-500">{m.desc}</p>}
              </div>
              {paymentMethod === m.id && (
                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="text-white" size={14} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-2">
          <Shield className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-0.5">安全支付保障</p>
            <p>您的支付信息由银行级加密保护，购票后电子票自动存入票夹</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={14} /> 支付剩余 14:59
            </div>
            <div>
              <span className="text-sm text-gray-500 mr-2">应付:</span>
              <span className="text-2xl font-bold text-primary-600">{formatCurrency(finalTotal)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { clearPendingSeats(); onBack(); }}
              disabled={processing}
              className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handlePay}
              disabled={processing}
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition disabled:opacity-50"
            >
              {processing ? '支付中...' : `立即支付 ${formatCurrency(finalTotal)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
