import { useAppStore } from '@/store/appStore';
import { User, Building2, Users, Shield, Bell } from 'lucide-react';
import { cn } from '@/utils';

export default function RoleSwitcher() {
  const { currentView, setCurrentView, currentUser, notifications } = useAppStore();

  const roles = [
    { id: 'user' as const, label: '用户端', icon: User },
    { id: 'organizer' as const, label: '主办方', icon: Building2 },
    { id: 'volunteer' as const, label: '志愿者', icon: Users },
    { id: 'admin' as const, label: '管理员', icon: Shield }
  ];

  const unreadCount = notifications.filter((n) => !n.read && n.userId === currentUser?.id).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">星</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">星票务</h1>
            <p className="text-xs text-gray-500">大型综合演艺赛事管理平台</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setCurrentView(role.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  currentView === role.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{role.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <img
              src={currentUser?.avatar}
              alt=""
              className="w-8 h-8 rounded-full bg-gray-200"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{currentUser?.username}</p>
              <p className="text-xs text-gray-500">{currentUser?.memberLevel === 'normal' ? '普通会员' : currentUser?.memberLevel === 'silver' ? '银卡会员' : currentUser?.memberLevel === 'gold' ? '金卡会员' : '钻石会员'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
