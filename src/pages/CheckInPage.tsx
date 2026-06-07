import { useState } from 'react';
import { ArrowLeft, QrCode, Check, X, Shield, Calendar, MapPin, User, Ticket } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/utils';
import { Ticket as TicketType } from '@/types';

interface Props {
  onBack: () => void;
}

export default function CheckInPage({ onBack }: Props) {
  const { verifyAndCheckIn, events, users } = useAppStore();
  const [inputCode, setInputCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    ticket?: TicketType;
    eventTitle?: string;
    seatInfo?: string;
    userName?: string;
  } | null>(null);

  const handleVerify = () => {
    if (!inputCode.trim()) return;
    setVerifying(true);
    setResult(null);

    setTimeout(() => {
      const res = verifyAndCheckIn(inputCode.trim());
      if (res.success && res.ticket && res.event) {
        const user = users.find((u) => u.id === res.ticket!.userId);
        setResult({
          success: true,
          message: res.message,
          ticket: res.ticket,
          eventTitle: res.event.title,
          seatInfo: `${res.ticket.seatInfo.zone} · ${res.ticket.seatInfo.row}排 ${res.ticket.seatInfo.number}座`,
          userName: user?.username
        });
      } else {
        setResult({
          success: false,
          message: res.message
        });
      }
      setVerifying(false);
    }, 800);
  };

  const handleReset = () => {
    setInputCode('');
    setResult(null);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">入场核销</h1>
      </div>

      <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode size={40} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1">扫码 / 输入票码</h2>
          <p className="text-white/70 text-sm">请扫描观众电子票二维码或手动输入票码</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">票码 / 二维码内容</label>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="请输入票号或扫码内容，如 XT-XXXXXX-XXXX..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
        />
        <button
          onClick={handleVerify}
          disabled={!inputCode.trim() || verifying}
          className={cn(
            'w-full mt-4 py-3 font-medium rounded-xl transition',
            inputCode.trim() && !verifying
              ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:shadow-lg hover:shadow-primary-500/30'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {verifying ? '核验中...' : '确认核销'}
        </button>
      </div>

      {result && (
        <div className={cn(
          'rounded-2xl p-5 border-2 animate-fade-in',
          result.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              result.success ? 'bg-green-500' : 'bg-red-500'
            )}>
              {result.success ? (
                <Check className="text-white" size={22} />
              ) : (
                <X className="text-white" size={22} />
              )}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                'font-bold mb-1',
                result.success ? 'text-green-800' : 'text-red-800'
              )}>
                {result.success ? '核验通过' : '核验失败'}
              </h3>
              <p className={cn(
                'text-sm',
                result.success ? 'text-green-700' : 'text-red-700'
              )}>
                {result.message}
              </p>
              {result.success && result.ticket && (
                <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Ticket size={14} />
                    <span className="font-medium">{result.eventTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <User size={14} />
                    <span>持票人: {result.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <MapPin size={14} />
                    <span>{result.seatInfo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Shield size={14} />
                    <span>防伪码: {result.ticket.antiFakeCode}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {result.success && (
            <button
              onClick={handleReset}
              className="w-full mt-4 py-2.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition"
            >
              继续核销下一张
            </button>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 font-medium mb-2">演示票码示例：</p>
        <div className="space-y-1.5">
          <button
            onClick={() => setInputCode('ticket-1')}
            className="block w-full text-left text-xs text-primary-600 hover:underline"
          >
            → 测试票号1: ticket-1 (初始票)
          </button>
          <button
            onClick={() => setInputCode('ticket-2')}
            className="block w-full text-left text-xs text-primary-600 hover:underline"
          >
            → 测试票号2: ticket-2 (初始票)
          </button>
        </div>
      </div>
    </div>
  );
}
