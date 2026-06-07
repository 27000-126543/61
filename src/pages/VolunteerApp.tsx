import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { VolunteerPosition, VolunteerStatus } from '@/types';
import { Users, Calendar, Clock, MapPin, CheckCircle, FileText, Award, Map, Clock3, UserCheck, QrCode, ChevronRight, Star, Check, X } from 'lucide-react';
import { cn } from '@/utils';

export default function VolunteerApp() {
  const { volunteerJobs, volunteerApplications, applyVolunteer, checkInVolunteer, currentUser, events } = useAppStore();
  const [activeTab, setActiveTab] = useState<'jobs' | 'my' | 'training' | 'stats'>('jobs');
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const positionMap: Record<VolunteerPosition, { name: string; icon: any; color: string }> = {
    guide: { name: '场馆引导', icon: Map, color: 'text-blue-500 bg-blue-50' },
    ticket_checker: { name: '检票员', icon: UserCheck, color: 'text-green-500 bg-green-50' },
    usher: { name: '座位引导', icon: Users, color: 'text-purple-500 bg-purple-50' },
    support: { name: '后勤支持', icon: FileText, color: 'text-amber-500 bg-amber-50' }
  };

  const myApplications = volunteerApplications.filter((a) => a.userId === currentUser?.id);

  const handleApply = (jobId: string) => {
    const ok = applyVolunteer(jobId);
    if (ok) setAppliedJobs([...appliedJobs, jobId]);
  };

  const totalServiceHours = myApplications.reduce((sum, a) => sum + a.serviceHours, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 left-1/3 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center ring-4 ring-white/30">
            <Users size={32} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">志愿者中心</h1>
            <p className="text-white/80">服务他人，传递精彩</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{myApplications.length}</p>
              <p className="text-xs text-white/70">服务次数</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalServiceHours}</p>
              <p className="text-xs text-white/70">服务时长</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Star className="fill-gold-400 text-gold-400" size={18} />
                <span className="text-2xl font-bold">4.9</span>
              </div>
              <p className="text-xs text-white/70">服务评分</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'jobs' as const, label: '可报名岗位', icon: Users },
          { id: 'my' as const, label: '我的申请', icon: FileText },
          { id: 'training' as const, label: '培训通知', icon: Award },
          { id: 'stats' as const, label: '服务统计', icon: Clock3 }
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

      {activeTab === 'jobs' && (
        <div className="grid md:grid-cols-2 gap-5">
          {volunteerJobs.map((job) => {
            const pos = positionMap[job.position];
            const Icon = pos.icon;
            const applied = myApplications.find((a) => a.jobId === job.id) || appliedJobs.includes(job.id);
            const event = events.find((e) => e.id === job.eventId);

            return (
              <div key={job.id} className="bg-white rounded-2xl p-5 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', pos.color)}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{job.positionName}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{job.eventTitle}</p>
                    </div>
                  </div>
                  {event && event.city && (
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{event.city}</span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{job.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    <span>{job.startTime} - {job.endTime}（约{job.endTime.split(':')[0] - job.startTime.split(':')[0]}小时）</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      已报名 <span className="font-medium text-gray-700">{job.signedUpCount}</span>/{job.requiredCount}
                    </span>
                  </div>
                  {applied ? (
                    <span className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
                      <Check size={14} /> 已报名
                    </span>
                  ) : job.signedUpCount >= job.requiredCount ? (
                    <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium">
                      已满员
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition flex items-center gap-1"
                    >
                      立即报名 <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'my' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Users size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无申请记录，快去报名感兴趣的岗位吧~</p>
            </div>
          ) : (
            myApplications.map((app) => {
              const job = volunteerJobs.find((j) => j.id === app.jobId);
              if (!job) return null;
              const pos = positionMap[job.position];
              const statusMap: Record<VolunteerStatus, { text: string; color: string }> = {
                pending: { text: '待审核', color: 'bg-amber-100 text-amber-700' },
                approved: { text: '已通过', color: 'bg-green-100 text-green-700' },
                rejected: { text: '未通过', color: 'bg-red-100 text-red-700' },
                completed: { text: '已完成', color: 'bg-blue-100 text-blue-700' }
              };
              const status = statusMap[app.status];

              return (
                <div key={app.id} className="bg-white rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', pos.color)}>
                        <pos.icon size={18} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{job.positionName}</h3>
                        <p className="text-sm text-gray-500">{job.eventTitle}</p>
                      </div>
                    </div>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', status.color)}>
                      {status.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {job.date}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {job.startTime}-{job.endTime}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                  </div>
                  {app.status === 'approved' && !app.checkedIn && (
                    <button
                      onClick={() => checkInVolunteer(app.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <QrCode size={18} /> 扫码签到
                    </button>
                  )}
                  {app.checkedIn && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <span className="text-sm text-green-700 flex items-center gap-1.5">
                        <CheckCircle size={16} /> 已签到 · 签到时间 {app.checkInTime}
                      </span>
                      <span className="text-sm text-green-700 font-medium">服务时长 {app.serviceHours}h</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-4">
          {[
            { title: '大型演唱会志愿者岗前培训', time: '2026-07-10 14:00', type: '线上培训', duration: '1.5小时' },
            { title: '检票系统操作流程培训', time: '2026-07-12 10:00', type: '线下培训', duration: '2小时' },
            { title: '观众服务与应急处理', time: '2026-07-14 15:00', type: '线上培训', duration: '1小时' }
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Award className="text-primary-600" size={22} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{t.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {t.time}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{t.type}</span>
                  <span>时长 {t.duration}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition">
                查看详情
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="text-blue-600" size={22} />
            </div>
            <p className="text-gray-500 text-sm mb-1">累计服务场次</p>
            <p className="text-3xl font-bold text-gray-900">{myApplications.length}</p>
            <p className="text-xs text-green-600 mt-2">+2 本月</p>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Clock3 className="text-green-600" size={22} />
            </div>
            <p className="text-gray-500 text-sm mb-1">累计服务时长</p>
            <p className="text-3xl font-bold text-gray-900">{totalServiceHours}<span className="text-lg font-normal text-gray-500 ml-1">小时</span></p>
            <p className="text-xs text-green-600 mt-2">+6 本周</p>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Star className="text-amber-600 fill-amber-500" size={22} />
            </div>
            <p className="text-gray-500 text-sm mb-1">服务评级</p>
            <p className="text-3xl font-bold text-gray-900">4.9<span className="text-lg font-normal text-gray-500 ml-1">/5.0</span></p>
            <div className="flex mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>

          <div className="md:col-span-3 bg-white rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">服务历史记录</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">活动</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">岗位</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">日期</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">服务时长</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myApplications.map((app) => {
                    const job = volunteerJobs.find((j) => j.id === app.jobId);
                    if (!job) return null;
                    return (
                      <tr key={app.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.eventTitle}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{job.positionName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{job.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{app.serviceHours || 6}小时</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            app.checkedIn ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          )}>
                            {app.checkedIn ? '已完成' : '待服务'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
