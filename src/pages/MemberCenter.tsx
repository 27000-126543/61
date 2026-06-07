import { useAppStore } from '@/store/appStore';
import { memberLevelConfig } from '@/data/mockData';
import { Crown, Gift, Ticket, Star, TrendingUp, ChevronRight, Sparkles, Calendar } from 'lucide-react';
import { formatCurrency, cn } from '@/utils';

export default function MemberCenter() {
  const { currentUser, tickets, events } = useAppStore();

  if (!currentUser) return null;

  const levelConfig = memberLevelConfig[currentUser.memberLevel];
  const levels = Object.entries(memberLevelConfig);
  const currentLevelIndex = levels.findIndex(([k]) => k === currentUser.memberLevel);

  const nextLevel = levels[currentLevelIndex + 1];
  const nextLevelSpending = nextLevel ? nextLevel[1].minSpending : Infinity;
  const progressToNext = Math.min(100, (currentUser.yearlySpending / (nextLevel ? nextLevel[1].minSpending : 1)) * 100);
  const amountToNext = Math.max(0, nextLevelSpending - currentUser.yearlySpending);

  const myTickets = tickets.filter((t) => t.userId === currentUser.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div
        className="rounded-3xl p-6 text-white mb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${levelConfig.color} 0%, ${levelConfig.color}dd 100%)` }}
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-5 bottom-0 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <img src={currentUser.avatar} alt="" className="w-16 h-16 rounded-full bg-white/20 ring-4 ring-white/30" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{currentUser.username}</h2>
                <Crown size={18} className="text-gold-300" />
              </div>
              <p className="text-white/80">{levelConfig.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-white/70 text-xs mb-1">年度消费</p>
              <p className="text-lg font-bold">{formatCurrency(currentUser.yearlySpending)}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-1">购票数量</p>
              <p className="text-lg font-bold">{myTickets.length} 张</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-1">会员年限</p>
              <p className="text-lg font-bold">1 年</p>
            </div>
          </div>

          {nextLevel && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">
                  距离 <span className="font-bold">{nextLevel[1].name}</span> 还差 <span className="font-bold">{formatCurrency(amountToNext)}</span>
                </span>
                <span className="text-sm font-medium">{Math.round(progressToNext)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary-500" size={20} />
            <h3 className="font-bold text-gray-900">我的权益</h3>
          </div>
          <ul className="space-y-3">
            {levelConfig.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="text-primary-500" size={20} />
            <h3 className="font-bold text-gray-900">会员等级权益对比</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-normal">权益</th>
                  {levels.map(([key, cfg]) => (
                    <th key={key} className={cn('text-center py-2 px-2 font-normal', key === currentUser.memberLevel ? 'text-primary-600' : 'text-gray-500')}>
                      <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: cfg.color }} />
                      {cfg.name.slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['购票折扣', '优先购票', '生日赠票', '免退票手续费', '专属客服'].map((item) => (
                  <tr key={item} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-700">{item}</td>
                    {levels.map(([key]) => {
                      const has =
                        (item === '购票折扣' && key !== 'normal') ||
                        (item === '优先购票' && key !== 'normal') ||
                        (item === '生日赠票' && (key === 'gold' || key === 'diamond')) ||
                        (item === '免退票手续费' && (key === 'gold' || key === 'diamond')) ||
                        (item === '专属客服' && key === 'diamond');
                      return (
                        <td key={key} className="text-center py-2.5 px-2">
                          {has ? <span className="text-green-500">✓</span> : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary-500" size={20} />
            <h3 className="font-bold text-gray-900">近期观影记录</h3>
          </div>
          <button className="text-sm text-primary-600 flex items-center gap-1">
            查看全部 <ChevronRight size={14} />
          </button>
        </div>
        {myTickets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">暂无观影记录</p>
        ) : (
          <div className="space-y-3">
            {myTickets.slice(0, 3).map((t) => {
              const ev = events.find((e) => e.id === t.eventId);
              if (!ev) return null;
              return (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <img src={ev.coverImage} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">{ev.title}</p>
                    <p className="text-xs text-gray-500">{ev.startTime} · {t.seatInfo.zone}</p>
                  </div>
                  <span className="text-primary-600 font-medium">{formatCurrency(t.paidPrice)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
