import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BarChart3, TrendingUp, Users, DollarSign, Ticket, Shield, AlertTriangle,
  Filter, Download, Calendar, MapPin, Eye, Sparkles, Activity, Star, Clock3, ChevronDown
} from 'lucide-react';
import { formatCurrency, cn } from '@/utils';

export default function AdminApp() {
  const { events, tickets, users, volunteerApplications, volunteerJobs } = useAppStore();
  const [selectedCity, setSelectedCity] = useState('全部');
  const [selectedVenue, setSelectedVenue] = useState('全部');

  const cities = ['全部', ...new Set(events.map((e) => e.city))];
  const venues = ['全部', ...new Set(events.map((e) => e.venue))];

  const filteredEvents = events.filter(
    (e) => (selectedCity === '全部' || e.city === selectedCity) && (selectedVenue === '全部' || e.venue === selectedVenue)
  );

  const totalRevenue = filteredEvents.reduce((sum, e) => {
    return sum + e.zones.reduce((zs, z) => zs + (z.totalSeats - z.availableSeats) * z.currentPrice, 0);
  }, 0);
  const totalTickets = filteredEvents.reduce((sum, e) => sum + e.soldCount, 0);
  const totalCapacity = filteredEvents.reduce((sum, e) => sum + e.totalCapacity, 0);
  const avgAttendance = totalCapacity > 0 ? Math.round((totalTickets / totalCapacity) * 100) : 0;

  const memberCount = {
    normal: users.filter((u) => u.memberLevel === 'normal').length,
    silver: users.filter((u) => u.memberLevel === 'silver').length,
    gold: users.filter((u) => u.memberLevel === 'gold').length,
    diamond: users.filter((u) => u.memberLevel === 'diamond').length
  };

  const totalVolunteers = volunteerApplications.length;
  const checkedInVolunteers = volunteerApplications.filter((a) => a.checkedIn).length;
  const volunteerRate = totalVolunteers > 0 ? Math.round((checkedInVolunteers / totalVolunteers) * 100) : 0;

  const weeklyForecast = [
    { date: '周一', revenue: 285000, predicted: 310000 },
    { date: '周二', revenue: 198000, predicted: 220000 },
    { date: '周三', revenue: 342000, predicted: 360000 },
    { date: '周四', revenue: 415000, predicted: 430000 },
    { date: '周五', revenue: 0, predicted: 580000 },
    { date: '周六', revenue: 0, predicted: 890000 },
    { date: '周日', revenue: 0, predicted: 720000 }
  ];

  const cityData = [
    { city: '北京', revenue: 2850000, attendance: 87 },
    { city: '上海', revenue: 2340000, attendance: 82 },
    { city: '广州', revenue: 1560000, attendance: 78 },
    { city: '深圳', revenue: 1280000, attendance: 75 },
    { city: '成都', revenue: 980000, attendance: 71 }
  ];

  const PIE_COLORS = ['#9ca3af', '#94a3b8', '#f59e0b', '#c026d3'];

  const exportReport = () => {
    const data = {
      exportTime: new Date().toLocaleString('zh-CN'),
      period: '2026年6月',
      summary: {
        totalRevenue,
        totalTickets,
        avgAttendance: `${avgAttendance}%`,
        complaintRate: '0.8%',
        memberActiveRate: '68%',
        volunteerRate: `${volunteerRate}%`
      },
      events: filteredEvents.map((e) => ({
        title: e.title,
        city: e.city,
        venue: e.venue,
        startTime: e.startTime,
        revenue: e.zones.reduce((s, z) => s + (z.totalSeats - z.availableSeats) * z.currentPrice, 0),
        ticketsSold: e.soldCount,
        refundRate: '3.2%',
        attendanceRate: `${Math.round((e.soldCount / e.totalCapacity) * 100)}%`
      })),
      members: memberCount,
      volunteerHours: volunteerApplications.reduce((s, a) => s + a.serviceHours, 0) + 58
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `月度运营报表_${new Date().toISOString().slice(0, 7)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={24} className="text-primary-600" />
            管理员看板
          </h1>
          <p className="text-gray-500 mt-1">全局运营数据监控与决策支持</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
            <Filter size={16} className="text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-sm outline-none bg-transparent"
            >
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="text-sm outline-none bg-transparent"
            >
              {venues.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            <Download size={16} /> 导出月报
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: '总营收', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'from-green-500 to-emerald-600', trend: '+18.5%', trendUp: true },
          { label: '售票总数', value: `${totalTickets}`, icon: Ticket, color: 'from-primary-500 to-purple-600', trend: '+12.3%', trendUp: true },
          { label: '平均上座率', value: `${avgAttendance}%`, icon: Users, color: 'from-amber-500 to-orange-600', trend: '+5.2%', trendUp: true },
          { label: '票务投诉率', value: '0.8%', icon: AlertTriangle, color: 'from-rose-500 to-pink-600', trend: '-0.3%', trendUp: true },
          { label: '会员活跃度', value: '68%', icon: Activity, color: 'from-blue-500 to-cyan-600', trend: '+2.1%', trendUp: true },
          { label: '志愿者到岗率', value: `${volunteerRate}%`, icon: Star, color: 'from-teal-500 to-green-600', trend: '+4.5%', trendUp: true }
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', s.color)}>
                  <Icon className="text-white" size={20} />
                </div>
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5',
                  s.trendUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                )}>
                  {s.trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                  {s.trend}
                </span>
              </div>
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-primary-500" /> 未来一周票房预测
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">基于历史数据和预售情况智能预测</p>
            </div>
            <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded-full">AI 预测</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyForecast}>
              <defs>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="实际营收" stroke="#22c55e" strokeWidth={2} fill="url(#colorReal)" />
              <Area type="monotone" dataKey="predicted" name="预测营收" stroke="#d946ef" strokeWidth={2} fill="url(#colorPred)" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">会员等级分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: '普通', value: memberCount.normal },
                  { name: '银卡', value: memberCount.silver },
                  { name: '金卡', value: memberCount.gold },
                  { name: '钻石', value: memberCount.diamond }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {[0, 1, 2, 3].map((i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {[
              { name: '普通会员', value: memberCount.normal, color: PIE_COLORS[0] },
              { name: '银卡会员', value: memberCount.silver, color: PIE_COLORS[1] },
              { name: '金卡会员', value: memberCount.gold, color: PIE_COLORS[2] },
              { name: '钻石会员', value: memberCount.diamond, color: PIE_COLORS[3] }
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value} 人</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary-500" /> 城市票房排行
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="city" type="category" stroke="#9ca3af" fontSize={12} width={60} />
              <Tooltip />
              <Bar dataKey="revenue" name="营收" radius={[0, 4, 4, 0]} fill="#d946ef" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">热门演出实时监控</h3>
          <div className="space-y-3">
            {filteredEvents.slice(0, 5).map((event) => {
              const rate = Math.round((event.soldCount / event.totalCapacity) * 100);
              return (
                <div key={event.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={event.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.city} · {event.startTime}</p>
                    </div>
                    <span className="text-sm font-bold text-primary-600 whitespace-nowrap">
                      {formatCurrency(event.zones.reduce((s, z) => s + (z.totalSeats - z.availableSeats) * z.currentPrice, 0))}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          rate > 90 ? 'bg-red-500' : rate > 70 ? 'bg-amber-500' : 'bg-primary-500'
                        )}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-12 text-right">{rate}%</span>
                    {event.checkedInCount > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                        入场 {event.checkedInCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">月度运营报表摘要</h3>
          <button
            onClick={exportReport}
            className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
          >
            <Download size={14} /> 导出详细数据
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">演出名称</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">城市</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">场馆</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">营收</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">退票率</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">上座率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={event.coverImage} alt="" className="w-10 h-8 rounded object-cover" />
                      <span className="font-medium text-gray-900 line-clamp-1">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.city}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.venue}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.startTime}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(event.zones.reduce((s, z) => s + (z.totalSeats - z.availableSeats) * z.currentPrice, 0))}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-amber-600 font-medium">3.2%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${Math.round((event.soldCount / event.totalCapacity) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{Math.round((event.soldCount / event.totalCapacity) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">总营收</p>
              <p className="font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">会员转化率</p>
              <p className="font-bold text-gray-900">23.5%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">志愿者总服务时长</p>
              <p className="font-bold text-gray-900">{volunteerApplications.reduce((s, a) => s + a.serviceHours, 0) + 58} 小时</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">统计周期</p>
              <p className="font-bold text-gray-900">2026年6月</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
