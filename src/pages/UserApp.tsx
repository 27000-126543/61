import { useState, useMemo } from 'react';
import { Search, Filter, Flame, Calendar, MapPin, ChevronRight, Music, Theater, Trophy, ArrowRight, Star, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatCurrency, getCategoryName, getCategoryColor, cn } from '@/utils';
import { EventCategory } from '@/types';
import EventDetail from './EventDetail';
import MemberCenter from './MemberCenter';
import MyTickets from './MyTickets';
import CheckInPage from './CheckInPage';
import { QrCode } from 'lucide-react';

type Tab = 'home' | 'tickets' | 'member' | 'checkin';

export default function UserApp() {
  const { events, currentUser, filters, setFilters, getFilteredEvents, getRecommendedEvents } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  const categories: { id: EventCategory | 'all'; name: string; icon: any }[] = [
    { id: 'all', name: '全部', icon: Sparkles },
    { id: 'concert', name: '演唱会', icon: Music },
    { id: 'drama', name: '话剧', icon: Theater },
    { id: 'sports', name: '体育', icon: Trophy }
  ];

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setFilters({ keyword: text });
  };

  const handleCategoryChange = (cat: EventCategory | 'all') => {
    setSelectedCategory(cat);
    setFilters({ category: cat });
  };

  const handlePriceChange = (maxPrice: number) => {
    setPriceRange([0, maxPrice]);
    setFilters({ minPrice: 0, maxPrice });
  };

  const filteredEvents = useMemo(() => getFilteredEvents(), [filters, events]);
  const recommendedEvents = useMemo(() => getRecommendedEvents(), [events, currentUser]);

  if (selectedEventId) {
    const event = events.find((e) => e.id === selectedEventId);
    if (event) {
      return <EventDetail event={event} onBack={() => setSelectedEventId(null)} />;
    }
  }

  if (activeTab === 'tickets') return <MyTickets />;
  if (activeTab === 'member') return <MemberCenter />;
  if (activeTab === 'checkin') return <CheckInPage onBack={() => setActiveTab('home')} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-28 lg:pb-6">
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-900 rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">
            你好，{currentUser?.username}
            {currentUser?.memberLevel === 'gold' && <Star className="inline w-4 h-4 ml-1 text-gold-400 fill-gold-400" />}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">发现精彩演出，畅享现场体验</h1>
          <div className="bg-white rounded-2xl p-2 flex gap-2 shadow-xl">
            <Search className="text-gray-400 ml-3 my-auto" size={20} />
            <input
              type="text"
              placeholder="搜索演出、场馆、艺人..."
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 py-2 outline-none text-gray-900 placeholder-gray-400 bg-transparent"
            />
            <button className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg transition">
              搜索
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition',
                selectedCategory === cat.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <Icon size={16} />
              {cat.name}
            </button>
          );
        })}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 ml-auto">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700">¥{priceRange[0]}-¥{priceRange[1]}</span>
          <input
            type="range"
            min="0"
            max="10000"
            value={priceRange[1]}
            onChange={(e) => handlePriceChange(parseInt(e.target.value))}
            className="w-24 accent-primary-500"
          />
        </div>
      </div>

      {!searchText && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              <h2 className="text-lg font-bold text-gray-900">猜你喜欢</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">智能推荐</span>
            </div>
            <button className="text-sm text-primary-600 flex items-center gap-1">
              更多 <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3 relative">
                  <img src={event.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className={cn('absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r', getCategoryColor(event.category))}>
                    {getCategoryName(event.category)}
                  </div>
                  {event.isHot && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium">
                      <Flame size={12} /> HOT
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-600 transition">
                  {event.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Calendar size={12} />
                  {event.startTime}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPin size={12} />
                  {event.city} · {event.venue.slice(0, 8)}
                </div>
                <p className="text-primary-600 font-bold">
                  {formatCurrency(event.priceRange.min)}<span className="text-gray-400 font-normal text-xs"> 起</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">全部演出 <span className="text-gray-400 font-normal text-sm">({filteredEvents.length}场)</span></h2>
        </div>
        <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="flex gap-4 p-4 bg-white rounded-2xl cursor-pointer hover:shadow-lg transition group"
            >
              <div className="w-40 md:w-48 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0">
                <img src={event.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium text-white bg-gradient-to-r', getCategoryColor(event.category))}>
                      {getCategoryName(event.category)}
                    </span>
                    {event.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{event.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {event.startTime}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {event.city} · {event.venue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">已售 {Math.round((event.soldCount / event.totalCapacity) * 100)}%</p>
                      <p className="text-primary-600 font-bold text-lg">{formatCurrency(event.priceRange.min)}<span className="text-gray-400 font-normal text-xs"> 起</span></p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-primary-500 transition" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
          {[
            { id: 'home' as Tab, label: '首页', icon: Flame },
            { id: 'tickets' as Tab, label: '票夹', icon: Calendar },
            { id: 'checkin' as Tab, label: '核销', icon: QrCode },
            { id: 'member' as Tab, label: '会员', icon: Star }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition',
                  activeTab === item.id ? 'text-primary-600' : 'text-gray-500'
                )}
              >
                <Icon size={22} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
