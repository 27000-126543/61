import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Calendar, MapPin, BarChart3, Eye, DollarSign, Users, Ticket, Settings, Check, X, Bell, Sparkles } from 'lucide-react';
import { formatCurrency, cn, formatDate } from '@/utils';
import CreateEventModal from './CreateEventModal';

export default function OrganizerApp() {
  const { events, salesData, priceSuggestions, applyPriceSuggestion } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'pricing' | 'settings'>('dashboard');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);

  const myEvents = events;

  const totalRevenue = myEvents.reduce((sum, e) => {
    const zoneRevenue = e.zones.reduce((zs, z) => zs + (z.totalSeats - z.availableSeats) * z.currentPrice, 0);
    return sum + zoneRevenue;
  }, 0);

  const totalTickets = myEvents.reduce((sum, e) => sum + e.soldCount, 0);
  const totalCapacity = myEvents.reduce((sum, e) => sum + e.totalCapacity, 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalTickets / totalCapacity) * 100) : 0;

  const heatmapData = (event: typeof events[0]) =>
    event.zones.map((z) => ({
      name: z.name,
      sold: z.totalSeats - z.availableSeats,
      available: z.availableSeats,
      utilization: Math.round(((z.totalSeats - z.availableSeats) / z.totalSeats) * 100)
    }));

  const PIE_COLORS = ['#d946ef', '#f59e0b', '#3b82f6', '#22c55e'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">主办方管理中心</h1>
          <p className="text-gray-500">管理演出、查看数据、智能定价</p>
        </div>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-medium hover:shadow-lg transition"
        >
          <Plus size={18} /> 发布新演出
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'dashboard' as const, label: '数据看板', icon: BarChart3 },
          { id: 'events' as const, label: '演出管理', icon: Calendar },
          { id: 'pricing' as const, label: '智能调价', icon: TrendingUp },
          { id: 'settings' as const, label: '设置', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition',
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: '总营收', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'from-green-500 to-emerald-600', trend: '+12.5%' },
              { label: '已售票数', value: `${totalTickets} 张`, icon: Ticket, color: 'from-primary-500 to-purple-600', trend: '+8.2%' },
              { label: '平均上座率', value: `${avgOccupancy}%`, icon: Users, color: 'from-amber-500 to-orange-600', trend: '+3.1%' },
              { label: '在办演出', value: `${myEvents.length} 场`, icon: Calendar, color: 'from-blue-500 to-cyan-600', trend: '+2' }
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', s.color)}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', s.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>
                      {s.trend.startsWith('+') ? <TrendingUp size={12} className="inline mr-0.5" /> : <TrendingDown size={12} className="inline mr-0.5" />}
                      {s.trend}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">销售趋势</h3>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
                  <option>近7天</option>
                  <option>近30天</option>
                  <option>近3个月</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={salesData['event-001'] || []}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#d946ef" strokeWidth={2} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">品类销售占比</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '演唱会', value: 45 },
                      { name: '体育赛事', value: 30 },
                      { name: '话剧演出', value: 25 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[0, 1, 2].map((i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-2 mt-4">
                {[
                  { name: '演唱会', value: 45, color: PIE_COLORS[0] },
                  { name: '体育赛事', value: 30, color: PIE_COLORS[1] },
                  { name: '话剧演出', value: 25, color: PIE_COLORS[2] }
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {myEvents.slice(0, 2).map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img src={event.coverImage} alt="" className="w-20 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{event.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {event.startTime}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> {event.venue}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">售票进度</span>
                    <span className="text-sm font-medium text-gray-900">
                      {event.soldCount}/{event.totalCapacity} ({Math.round((event.soldCount / event.totalCapacity) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"
                      style={{ width: `${(event.soldCount / event.totalCapacity) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">各区域销售热力</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={heatmapData(event)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tick={{ fontSize: 10 }} />
                      <YAxis stroke="#9ca3af" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="utilization" name="上座率%" radius={[4, 4, 0, 0]}>
                        {heatmapData(event).map((entry, i) => (
                          <Cell key={i} fill={entry.utilization > 80 ? '#ef4444' : entry.utilization > 50 ? '#f59e0b' : '#22c55e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">全部演出</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">演出</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">场馆</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">售票</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">营收</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={event.coverImage} alt="" className="w-12 h-10 rounded object-cover" />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{event.title}</p>
                          <p className="text-xs text-gray-500">
                            {event.category === 'concert' ? '演唱会' : event.category === 'drama' ? '话剧' : '体育'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.startTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.venue}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500" style={{ width: `${(event.soldCount / event.totalCapacity) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{Math.round((event.soldCount / event.totalCapacity) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(event.zones.reduce((s, z) => s + (z.totalSeats - z.availableSeats) * z.currentPrice, 0))}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">售票中</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                          <Settings size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-primary-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">AI 智能调价建议</h3>
                <p className="text-sm text-gray-600 mt-1">
                  系统基于历史数据、预售进度、市场需求自动生成调价建议，涨跌幅限制在±20%以内
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {priceSuggestions.map((suggestion) => {
              const event = events.find((e) => e.id === suggestion.eventId);
              const zone = event?.zones.find((z) => z.id === suggestion.zoneId);
              const key = `${suggestion.eventId}-${suggestion.zoneId}`;
              const applied = appliedSuggestions.includes(key);

              if (!event || !zone) return null;

              return (
                <div key={key} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        suggestion.changePercent > 0 ? 'bg-red-100' : 'bg-green-100'
                      )}>
                        {suggestion.changePercent > 0 ? (
                          <TrendingUp className="text-red-500" size={24} />
                        ) : (
                          <TrendingDown className="text-green-500" size={24} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                          <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: zone.color }} />
                          {zone.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{suggestion.reason}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            置信度 {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">当前价</p>
                          <p className="text-lg font-bold text-gray-500 line-through">{formatCurrency(suggestion.currentPrice)}</p>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div>
                          <p className="text-xs text-gray-500">建议价</p>
                          <p className={cn('text-lg font-bold', suggestion.changePercent > 0 ? 'text-red-500' : 'text-green-500')}>
                            {formatCurrency(suggestion.suggestedPrice)}
                          </p>
                        </div>
                        <div className={cn(
                          'px-2 py-1 rounded-lg text-sm font-medium',
                          suggestion.changePercent > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        )}>
                          {suggestion.changePercent > 0 ? '+' : ''}{suggestion.changePercent}%
                        </div>
                      </div>
                      {applied ? (
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
                          <Check size={16} /> 已应用
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setAppliedSuggestions([...appliedSuggestions, key]);
                              applyPriceSuggestion(suggestion.eventId, suggestion.zoneId);
                            }}
                            className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition"
                          >
                            一键应用
                          </button>
                          <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                            <X size={16} className="inline mr-1" /> 忽略
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">主办方设置</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">主办方名称</label>
              <input defaultValue="巨室文化娱乐有限公司" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话</label>
              <input defaultValue="400-888-8888" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">动态调价开关</label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
                <span className="text-sm text-gray-600">开启后系统将自动生成调价建议</span>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition">
              保存设置
            </button>
          </div>
        </div>
      )}

      {showCreateEvent && <CreateEventModal onClose={() => setShowCreateEvent(false)} />}
    </div>
  );
}
