import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { X, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: Props) {
  const { login, register } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    birthday: '',
    city: ''
  });
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const ok = login(formData.username || '音乐爱好者', formData.password);
      if (ok) {
        onSuccess();
      } else {
        setError('登录失败，请检查账号密码');
      }
    } else {
      register({
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday,
        city: formData.city
      });
      onSuccess();
    }
  };

  const inputCls =
    'w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-10 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? '欢迎回来' : '创建新账号'}
          </h2>
          <p className="text-white/80 mt-1 text-sm">
            {mode === 'login' ? '登录您的星票务账号' : '加入星票务，畅享精彩演出'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition',
                  mode === m ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                )}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="用户名/手机号/邮箱"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={inputCls}
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="邮箱"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    placeholder="手机号"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="所在城市"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    placeholder="生日"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </>
            )}

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type="password"
                placeholder="密码（演示模式任意输入）"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition"
          >
            {mode === 'login' ? '立即登录' : '立即注册'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            演示模式：用户名「音乐爱好者」或「体育迷小王」任意密码登录
          </p>
        </form>
      </div>
    </div>
  );
}
