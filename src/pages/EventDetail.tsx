import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Share2, Heart, ChevronDown, ChevronUp, ZoomIn, Info, Check, X } from 'lucide-react';
import { EventItem, Seat, SeatStatus } from '@/types';
import { formatCurrency, cn } from '@/utils';
import { useAppStore } from '@/store/appStore';
import SeatMap from './SeatMap';
import PaymentPage from './PaymentPage';

interface Props {
  event: EventItem;
  onBack: () => void;
}

export default function EventDetail({ event, onBack }: Props) {
  const { buyTicket, currentUser, selectSeats } = useAppStore();
  const [selectedZone, setSelectedZone] = useState<string | null>(event.zones[0]?.id || null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [showView, setShowView] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status !== 'available') return;
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= 4) return prev;
      return [...prev, seat];
    });
  };

  const handleConfirmSeats = () => {
    if (selectedSeats.length === 0) return;
    selectSeats(event.id, selectedSeats);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedSeats([]);
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 3000);
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const currentZone = event.zones.find((z) => z.id === selectedZone);

  if (showPayment) {
    return <PaymentPage onBack={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} />;
  }

  if (showSeatMap && currentZone) {
    return (
      <SeatMap
        event={event}
        zone={currentZone}
        selectedSeats={selectedSeats}
        onSelectSeat={handleSeatSelect}
        onBack={() => setShowSeatMap(false)}
        onShowView={() => setShowView(true)}
        onConfirm={handleConfirmSeats}
      />
    );
  }

  if (purchaseSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="text-white" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">购票成功！</h2>
        <p className="text-gray-500">您的电子票已生成，可在票夹中查看</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-32">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">演出详情</h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setLiked(!liked)} className={cn('p-2 rounded-xl transition', liked ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100')}>
            <Heart size={20} className={liked ? 'fill-current' : ''} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="aspect-video rounded-3xl overflow-hidden mb-6 relative">
        <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-3">
            {event.category === 'concert' ? '演唱会' : event.category === 'drama' ? '话剧演出' : '体育赛事'}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h2>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <span className="flex items-center gap-1.5"><Calendar size={16} /> {event.startTime}</span>
            <span className="flex items-center gap-1.5"><Clock size={16} /> 时长约{Math.ceil((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 3600000)}小时</span>
            <span className="flex items-center gap-1.5"><MapPin size={16} /> {event.city} · {event.venue}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">演出介绍</h3>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {event.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">#{tag}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">场馆信息</h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="text-primary-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{event.venue}</p>
                <p className="text-sm text-gray-500 mt-1">{event.address}</p>
              </div>
            </div>
          </div>

          {event.viewImage && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">座位视角预览</h3>
              <div className="aspect-video rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => setShowView(true)}>
                <img src={event.viewImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                  <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">选择票价区域</h3>
            <div className="space-y-3 mb-6">
              {event.zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition',
                    selectedZone === zone.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                      <span className="font-medium text-gray-900">{zone.name}</span>
                      {zone.ticketType === 'early_bird' && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">早鸟</span>
                      )}
                      {zone.ticketType === 'vip' && (
                        <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-600 rounded-full">VIP</span>
                      )}
                      {zone.ticketType === 'box' && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">包厢</span>
                      )}
                    </div>
                    <span className="font-bold text-primary-600">{formatCurrency(zone.currentPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{zone.description}</span>
                    <span className={zone.availableSeats < zone.totalSeats * 0.1 ? 'text-red-500' : 'text-gray-500'}>
                      剩余 {zone.availableSeats} 张
                    </span>
                  </div>
                  {zone.currentPrice !== zone.basePrice && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Info size={12} className="text-orange-500" />
                      <span className="text-orange-500">
                        {zone.currentPrice > zone.basePrice ? '动态调价 +' : '动态调价 -'}
                        {Math.abs(Math.round(((zone.currentPrice - zone.basePrice) / zone.basePrice) * 100))}%
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSeatMap(true)}
              disabled={!selectedZone}
              className={cn(
                'w-full py-3.5 rounded-xl font-medium transition',
                selectedZone
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              进入选座
            </button>

            {selectedSeats.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">已选 {selectedSeats.length} 张</span>
                  <button onClick={() => setSelectedSeats([])} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-0.5">
                    <X size={14} /> 清空
                  </button>
                </div>
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-700">{seat.row}排 {seat.number}座</span>
                      <span className="font-medium text-gray-900">{formatCurrency(seat.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500">合计</span>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(totalPrice)}</span>
                </div>
                <button
                  onClick={handleConfirmSeats}
                  disabled={selectedSeats.length === 0}
                  className={cn(
                    'w-full py-3.5 font-medium rounded-xl transition',
                    selectedSeats.length > 0
                      ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:shadow-lg hover:shadow-primary-500/30'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {selectedSeats.length > 0 ? `确认支付 ${selectedSeats.length} 张票` : '请先选座'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showView && event.viewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowView(false)}>
          <button onClick={() => setShowView(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-xl">
            <X size={24} />
          </button>
          <img src={event.viewImage} alt="" className="max-w-5xl max-h-[90vh] rounded-2xl" />
        </div>
      )}
    </div>
  );
}
