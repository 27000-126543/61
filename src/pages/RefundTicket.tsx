import { useState, useMemo } from 'react';
import { Ticket } from '@/types';
import { useAppStore } from '@/store/appStore';
import { X, RefreshCw, Check, AlertCircle, Info } from 'lucide-react';
import { formatCurrency, cn, getDaysUntil } from '@/utils';

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export default function RefundTicket({ ticket, onClose }: Props) {
  const { events, requestRefund, calculateRefundFee, currentUser } = useAppStore();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const event = events.find((e) => e.id === ticket.eventId);
  const daysUntil = event ? getDaysUntil(event.startTime) : 0;

  const refundCalc = useMemo(() => calculateRefundFee(ticket.id), [ticket.id]);
  const fee = refundCalc.fee;
  const refundAmount = refundCalc.refundAmount;
  const description = refundCalc.description;

  const handleSubmit = () => {
    if (!reason) return;
    setSubmitting(true);
    setErrorMsg(null);
    setTimeout(() => {
      const result = requestRefund(ticket.id, reason);
      setSubmitting(false);
      if (result.success) {
        setSuccess(true);
        setTimeout(onClose, 2000);
      } else {
        setErrorMsg(result.message);
      }
    }, 1000);
  };

  const reasons = ['时间冲突', '计划变更', '票价过高', '演出质量担忧', '其他原因'];

  const memberFreeRefund = currentUser?.memberLevel === 'gold' || currentUser?.memberLevel === 'diamond';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg">
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw size={20} />
            <h2 className="text-lg font-bold">申请退票</h2>
          </div>
          <p className="text-white/80 text-sm">{event?.title}</p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">退票申请已提交</h3>
              <p className="text-gray-500 text-sm">主办方将在24小时内审核，退款将原路返回</p>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Info size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">退票规则</p>
                    <p>距离开演还有 <span className="font-bold">{daysUntil}</span> 天</p>
                    <p className="mt-1">{description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">原支付金额</span>
                  <span className="font-medium">{formatCurrency(ticket.paidPrice)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">
                    手续费 ({Math.round(refundCalc.feeRate * 100)}%)
                    {memberFreeRefund && <span className="ml-1 text-green-600 text-xs">会员免除</span>}
                  </span>
                  <span className={cn(memberFreeRefund && 'line-through text-gray-400')}>-{formatCurrency(fee)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">预计退款</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(memberFreeRefund ? ticket.paidPrice : refundAmount)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 font-medium mb-3">退票原因</p>
              <div className="space-y-2 mb-4">
                {reasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 text-left text-sm transition',
                      reason === r
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl mb-4">
                <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  退票审核通过后，电子票将立即失效，无法恢复。请谨慎操作。
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  className={cn(
                    'flex-1 py-3 font-medium rounded-xl transition',
                    !reason || submitting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                  )}
                >
                  {submitting ? '提交中...' : '确认退票'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
