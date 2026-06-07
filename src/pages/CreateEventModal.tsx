import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { X, Plus, Calendar, MapPin, Clock, DollarSign, Users, Music, Theater, Trophy } from 'lucide-react';
import { EventCategory } from '@/types';

interface Props {
  onClose: () => void;
}

export default function CreateEventModal({ onClose }: Props) {
  const { createEvent } = useAppStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'concert' as EventCategory,
    description: '',
    venue: '',
    city: '',
    address: '',
    startTime: '',
    endTime: ''
  });
  const [zones, setZones] = useState([
    { name: 'VIP区', color: '#ef4444', price: 880, seats: 50, ticketType: 'vip' as const },
    { name: 'A区', color: '#f59e0b', price: 480, seats: 200, ticketType: 'regular' as const },
    { name: 'B区', color: '#3b82f6', price: 280, seats: 300, ticketType: 'early_bird' as const }
  ]);

  const categories = [
    { id: 'concert' as EventCategory, name: '演唱会', icon: Music },
    { id: 'drama' as EventCategory, name: '话剧演出', icon: Theater },
    { id: 'sports' as EventCategory, name: '体育赛事', icon: Trophy }
  ];

  const handleSubmit = () => {
    const eventZones = zones.map((z, i) => ({
      id: `zone-new-${i}`,
      name: z.name,
      color: z.color,
      basePrice: z.price,
      currentPrice: z.price,
      totalSeats: z.seats,
      availableSeats: z.seats,
      description: '',
      ticketType: z.ticketType
    }));
    createEvent({
      ...formData,
      zones: eventZones,
      seats: [],
      totalCapacity: zones.reduce((s, z) => s + z.seats, 0),
      coverImage: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(formData.title || '演出海报')}&image_size=landscape_16_9`,
      priceRange: {
        min: Math.min(...zones.map((z) => z.price)),
        max: Math.max(...zones.map((z) => z.price))
      }
    });
    onClose();
  };

  const addZone = () => {
    setZones([...zones, { name: `新区${zones.length + 1}`, color: '#22c55e', price: 180, seats: 100, ticketType: 'regular' }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">发布新演出</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step >= s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {s}
              </div>
              <span className={step >= s ? 'text-gray-900 font-medium text-sm' : 'text-gray-400 text-sm'}>
                {s === 1 ? '基本信息' : '票价分区'}
              </span>
              {s < 2 && <div className={cn('flex-1 h-0.5', step >= 2 ? 'bg-primary-500' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">演出类型</label>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition',
                          formData.category === cat.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Icon size={24} className={formData.category === cat.id ? 'text-primary-600' : 'text-gray-500'} />
                        <span className={formData.category === cat.id ? 'text-primary-600 font-medium text-sm' : 'text-gray-600 text-sm'}>
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">演出名称</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：周杰伦2026嘉年华演唱会"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">演出介绍</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <MapPin size={14} /> 城市
                  </label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <MapPin size={14} /> 场馆名称
                  </label>
                  <input
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">详细地址</label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Calendar size={14} /> 开始时间
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value.replace('T', ' ') })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Clock size={14} /> 结束时间
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value.replace('T', ' ') })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.title || !formData.venue}
                className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                下一步
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">票价分区设置</h3>
                <button
                  onClick={addZone}
                  className="flex items-center gap-1 text-sm text-primary-600 font-medium"
                >
                  <Plus size={16} /> 添加分区
                </button>
              </div>
              <div className="space-y-3">
                {zones.map((zone, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-1">
                        <input
                          type="color"
                          value={zone.color}
                          onChange={(e) => {
                            const newZones = [...zones];
                            newZones[i].color = e.target.value;
                            setZones(newZones);
                          }}
                          className="w-full h-10 rounded-lg cursor-pointer border-0"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...zones];
                            newZones[i].name = e.target.value;
                            setZones(newZones);
                          }}
                          placeholder="分区名称"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm outline-none focus:border-primary-500" />
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            value={zone.price}
                            onChange={(e) => {
                              const newZones = [...zones];
                              newZones[i].price = parseInt(e.target.value) || 0;
                              setZones(newZones);
                            }}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm outline-none focus:border-primary-500" />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            value={zone.seats}
                            onChange={(e) => {
                              const newZones = [...zones];
                              newZones[i].seats = parseInt(e.target.value) || 0;
                              setZones(newZones);
                            }}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm outline-none focus:border-primary-500" />
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => zones.length > 1 && setZones(zones.filter((_, idx) => idx !== i))}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          disabled={zones.length <= 1}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  返回上一步
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-medium rounded-xl hover:shadow-lg transition"
                >
                  发布演出
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
