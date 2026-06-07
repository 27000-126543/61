import { create } from 'zustand';
import {
  User,
  EventItem,
  Ticket,
  VolunteerJob,
  VolunteerApplication,
  Notification,
  SalesDataPoint,
  PriceSuggestion,
  Seat,
  SeatStatus,
  EventCategory,
  MemberLevel,
  TicketStatus
} from '../types';
import {
  mockUsers,
  mockEvents,
  mockTickets,
  mockVolunteerJobs,
  mockVolunteerApplications,
  mockNotifications,
  memberLevelConfig,
  refundRules
} from '../data/mockData';
import { getDaysUntil, cn } from '../utils';

function generateQRCode(ticketId: string, userId: string, eventId: string, timestamp: number) {
  return `XT-${ticketId.slice(-6).toUpperCase()}-${userId.slice(-4).toUpperCase()}-${eventId.slice(-4).toUpperCase()}-${timestamp.toString(36).toUpperCase()}`;
}

function generateAntiFakeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function calculateMemberLevel(spending: number): MemberLevel {
  if (spending >= 20000) return 'diamond';
  if (spending >= 5000) return 'gold';
  if (spending >= 2000) return 'silver';
  return 'normal';
}

function getMemberDiscount(level: MemberLevel): number {
  const discounts = { normal: 1, silver: 0.95, gold: 0.9, diamond: 0.85 };
  return discounts[level];
}

export interface SearchFilters {
  category: EventCategory | 'all';
  minPrice: number;
  maxPrice: number;
  startDate: string;
  endDate: string;
  keyword: string;
  city: string;
}

export interface PaymentInfo {
  method: 'wechat' | 'alipay' | 'card';
  cardNumber?: string;
}

type AppState = {
  currentUser: User | null;
  users: User[];
  events: EventItem[];
  tickets: Ticket[];
  volunteerJobs: VolunteerJob[];
  volunteerApplications: VolunteerApplication[];
  notifications: Notification[];
  isLoggedIn: boolean;
  currentView: 'user' | 'organizer' | 'volunteer' | 'admin';

  pendingSeats: Seat[];
  pendingEventId: string | null;

  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  getFilteredEvents: () => EventItem[];
  getRecommendedEvents: () => EventItem[];

  login: (username: string, password: string) => boolean;
  register: (userData: Partial<User>) => boolean;
  logout: () => void;
  setCurrentView: (view: 'user' | 'organizer' | 'volunteer' | 'admin') => void;

  selectSeats: (eventId: string, seats: Seat[]) => void;
  clearPendingSeats: () => void;

  processPayment: (paymentInfo: PaymentInfo) => Ticket[] | null;
  verifyAndCheckIn: (qrCodeOrTicketId: string) => { success: boolean; message: string; ticket?: Ticket; event?: EventItem };

  calculateRefundFee: (ticketId: string) => { fee: number; refundAmount: number; feeRate: number; description: string };
  requestRefund: (ticketId: string, reason: string) => { success: boolean; refundAmount: number; message: string };

  transferTicket: (ticketId: string, toUserId: string) => { success: boolean; message: string };

  getSalesData: (eventId: string) => SalesDataPoint[];
  generatePriceSuggestions: () => PriceSuggestion[];

  recalcUserMemberLevel: (userId: string) => void;

  applyVolunteer: (jobId: string) => boolean;
  checkInVolunteer: (applicationId: string) => boolean;

  updateSeatStatus: (eventId: string, seatId: string, status: SeatStatus) => void;

  createEvent: (event: Partial<EventItem>) => void;
  applyPriceSuggestion: (eventId: string, zoneId: string) => { success: boolean; newPrice: number };

  markNotificationRead: (notificationId: string) => void;
  addNotification: (userId: string, type: Notification['type'], title: string, content: string) => void;

  buyTicket: (eventId: string, seatId: string, zoneId: string) => Ticket | null;
  checkInAudience: (ticketId: string) => boolean;
  refundTicket: (ticketId: string) => boolean;
  priceSuggestions: PriceSuggestion[];
  salesData: { [eventId: string]: SalesDataPoint[] };

  getAdminStats: () => {
    totalRevenue: number;
    totalTickets: number;
    totalCapacity: number;
    avgAttendance: number;
    complaintRate: number;
    memberActiveRate: number;
    volunteerRate: number;
    weeklyForecast: { date: string; revenue: number; predicted: number }[];
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  events: mockEvents,
  tickets: mockTickets,
  volunteerJobs: mockVolunteerJobs,
  volunteerApplications: mockVolunteerApplications,
  notifications: mockNotifications,
  isLoggedIn: true,
  currentView: 'user',

  pendingSeats: [],
  pendingEventId: null,

  filters: {
    category: 'all',
    minPrice: 0,
    maxPrice: 10000,
    startDate: '',
    endDate: '',
    keyword: '',
    city: '全部'
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  getFilteredEvents: () => {
    const { events, filters } = get();
    return events.filter((e) => {
      if (filters.category !== 'all' && e.category !== filters.category) return false;
      if (filters.city !== '全部' && e.city !== filters.city) return false;
      if (e.priceRange.max < filters.minPrice || e.priceRange.min > filters.maxPrice) return false;
      if (filters.startDate && e.startTime < filters.startDate) return false;
      if (filters.endDate && e.startTime > filters.endDate + ' 23:59') return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (
          !e.title.toLowerCase().includes(kw) &&
          !e.venue.toLowerCase().includes(kw) &&
          !e.organizer.toLowerCase().includes(kw) &&
          !e.tags.some((t) => t.toLowerCase().includes(kw))
        ) return false;
      }
      return true;
    });
  },

  getRecommendedEvents: () => {
    const { events, currentUser, tickets } = get();
    const scored = events.map((e) => {
      let score = 0;
      if (e.isHot) score += 50;
      if (currentUser?.preferences.includes(e.category)) score += 40;
      const purchasedCount = tickets.filter((t) => t.eventId === e.id && t.userId === currentUser?.id).length;
      if (purchasedCount > 0) score += 20;
      const soldRate = e.soldCount / e.totalCapacity;
      score += soldRate * 30;
      return { event: e, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 4).map((s) => s.event);
  },

  login: (username, _password) => {
    const { users } = get();
    const user = users.find(
      (u) => u.username === username || u.email === username || u.phone === username
    );
    if (user) {
      set({ currentUser: user, isLoggedIn: true });
      return true;
    }
    return false;
  },

  register: (userData) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: userData.username || '新用户',
      email: userData.email || '',
      phone: userData.phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      memberLevel: 'normal',
      yearlySpending: 0,
      preferences: [],
      purchaseHistory: [],
      birthday: userData.birthday || '',
      city: userData.city || ''
    };
    set((state) => ({
      users: [...state.users, newUser],
      currentUser: newUser,
      isLoggedIn: true
    }));
    return true;
  },

  logout: () => {
    set({ currentUser: null, isLoggedIn: false, pendingSeats: [], pendingEventId: null });
  },

  setCurrentView: (view) => {
    set({ currentView: view });
  },

  selectSeats: (eventId, seats) => {
    set({ pendingSeats: seats, pendingEventId: eventId });
  },

  clearPendingSeats: () => {
    set({ pendingSeats: [], pendingEventId: null });
  },

  processPayment: (paymentInfo) => {
    const { pendingSeats, pendingEventId, events, currentUser, tickets } = get();
    if (!currentUser || !pendingEventId || pendingSeats.length === 0) return null;

    const event = events.find((e) => e.id === pendingEventId);
    if (!event) return null;

    const discount = getMemberDiscount(currentUser.memberLevel);
    const newTickets: Ticket[] = [];
    const now = Date.now();
    const nowStr = new Date(now).toISOString().slice(0, 16).replace('T', ' ');

    let totalSpending = 0;

    pendingSeats.forEach((seat, idx) => {
      const zone = event.zones.find((z) => z.id === seat.zoneId);
      if (!zone) return;

      const originalPrice = seat.price;
      const paidPrice = Math.round(seat.price * discount);
      totalSpending += paidPrice;

      const ticketId = `ticket-${now}-${idx}`;
      const qrCode = generateQRCode(ticketId, currentUser.id, pendingEventId, now + idx);
      const antiFakeCode = generateAntiFakeCode();

      newTickets.push({
        id: ticketId,
        userId: currentUser.id,
        eventId: pendingEventId,
        seatId: seat.id,
        seatInfo: { zone: zone.name, row: seat.row, number: seat.number },
        originalPrice,
        paidPrice,
        purchaseTime: nowStr,
        status: 'valid',
        qrCode,
        antiFakeCode,
        transferChain: [currentUser.id]
      });
    });

    if (newTickets.length === 0) return null;

    set((state) => {
      const updatedEvents = state.events.map((e) => {
        if (e.id === pendingEventId) {
          const updatedSeats = e.seats.map((s) => {
            const found = pendingSeats.find((ps) => ps.id === s.id);
            return found ? { ...s, status: 'sold' as SeatStatus } : s;
          });
          const updatedZones = e.zones.map((z) => {
            const zoneSeatsSold = pendingSeats.filter((s) => s.zoneId === z.id).length;
            return zoneSeatsSold > 0 ? { ...z, availableSeats: Math.max(0, z.availableSeats - zoneSeatsSold) } : z;
          });
          return {
            ...e,
            seats: updatedSeats,
            zones: updatedZones,
            soldCount: e.soldCount + pendingSeats.length,
            priceRange: {
              min: Math.min(...updatedZones.map((z) => z.currentPrice)),
              max: Math.max(...updatedZones.map((z) => z.currentPrice))
            }
          };
        }
        return e;
      });

      const newYearlySpending = state.currentUser ? state.currentUser.yearlySpending + totalSpending : totalSpending;
      const newLevel = calculateMemberLevel(newYearlySpending);
      const leveledUp = state.currentUser && newLevel !== state.currentUser.memberLevel;

      const newNotifs: Notification[] = [
        {
          id: `notif-${now}`,
          userId: currentUser.id,
          type: 'ticket',
          title: '购票成功',
          content: `您已成功购买「${event.title}」${newTickets.length}张门票，电子票已发放至您的票夹。`,
          read: false,
          createdAt: nowStr
        }
      ];

      if (leveledUp) {
        newNotifs.push({
          id: `notif-${now + 1}`,
          userId: currentUser.id,
          type: 'member',
          title: '🎉 恭喜升级！',
          content: `您已成功升级为${memberLevelConfig[newLevel].name}，立即享受更多专属权益！`,
          read: false,
          createdAt: nowStr
        });
      }

      return {
        events: updatedEvents,
        tickets: [...state.tickets, ...newTickets],
        currentUser: state.currentUser ? {
          ...state.currentUser,
          purchaseHistory: state.currentUser.purchaseHistory.includes(pendingEventId)
            ? state.currentUser.purchaseHistory
            : [...state.currentUser.purchaseHistory, pendingEventId],
          yearlySpending: newYearlySpending,
          memberLevel: newLevel
        } : state.currentUser,
        pendingSeats: [],
        pendingEventId: null,
        notifications: [...newNotifs, ...state.notifications]
      };
    });

    return newTickets;
  },

  verifyAndCheckIn: (qrCodeOrTicketId) => {
    const { tickets, events } = get();
    const ticket = tickets.find(
      (t) => t.id === qrCodeOrTicketId || t.qrCode === qrCodeOrTicketId
    );

    if (!ticket) {
      return { success: false, message: '票码无效，请核对后重试' };
    }

    if (ticket.status === 'used') {
      return { success: false, message: '该票已核销使用，请勿重复入场' };
    }

    if (ticket.status === 'refunded') {
      return { success: false, message: '该票已退票，无法入场' };
    }

    if (ticket.status === 'transferred') {
      return { success: false, message: '该票已转赠，原票已失效' };
    }

    if (ticket.status !== 'valid') {
      return { success: false, message: '该票状态异常' };
    }

    const event = events.find((e) => e.id === ticket.eventId);
    if (!event) {
      return { success: false, message: '演出信息不存在' };
    }

    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticket.id ? { ...t, status: 'used' as TicketStatus } : t
      ),
      events: state.events.map((e) => {
        if (e.id === ticket.eventId) {
          return {
            ...e,
            seats: e.seats.map((s) =>
              s.id === ticket.seatId ? { ...s, status: 'checked_in' as SeatStatus } : s
            ),
            checkedInCount: e.checkedInCount + 1
          };
        }
        return e;
      })
    }));

    return {
      success: true,
      message: '核验通过，欢迎入场！',
      ticket: { ...ticket, status: 'used' },
      event
    };
  },

  calculateRefundFee: (ticketId) => {
    const { tickets, events, currentUser } = get();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return { fee: 0, refundAmount: 0, feeRate: 0, description: '' };

    const event = events.find((e) => e.id === ticket.eventId);
    if (!event) return { fee: 0, refundAmount: 0, feeRate: 0, description: '' };

    const daysUntil = getDaysUntil(event.startTime);

    let rule = refundRules[refundRules.length - 1];
    for (const r of refundRules) {
      if (daysUntil >= r.daysBeforeEvent) {
        rule = r;
        break;
      }
    }

    let feeRate = rule.feeRate;
    if (currentUser?.memberLevel === 'gold' || currentUser?.memberLevel === 'diamond') {
      feeRate = 0;
    }

    const fee = Math.round(ticket.paidPrice * feeRate);
    const refundAmount = ticket.paidPrice - fee;

    return { fee, refundAmount, feeRate, description: rule.description };
  },

  requestRefund: (ticketId, reason) => {
    const { tickets, events, currentUser } = get();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !currentUser || ticket.userId !== currentUser.id) {
      return { success: false, refundAmount: 0, message: '退票申请无效' };
    }
    if (ticket.status !== 'valid') {
      return { success: false, refundAmount: 0, message: '该票不可退票' };
    }

    const { refundAmount, fee } = get().calculateRefundFee(ticketId);

    set((state) => {
      const event = state.events.find((e) => e.id === ticket.eventId);
      const zoneId = event?.seats.find((s) => s.id === ticket.seatId)?.zoneId;

      const newYearlySpending = Math.max(0, (state.currentUser?.yearlySpending || 0) - refundAmount);
      const newLevel = calculateMemberLevel(newYearlySpending);

      return {
        tickets: state.tickets.map((t) =>
          t.id === ticketId ? { ...t, status: 'refunded' as TicketStatus, refundRequested: true, refundApproved: true } : t
        ),
        events: state.events.map((e) => {
          if (e.id === ticket.eventId) {
            return {
              ...e,
              seats: e.seats.map((s) =>
                s.id === ticket.seatId ? { ...s, status: 'available' as SeatStatus } : s
              ),
              zones: e.zones.map((z) =>
                z.id === zoneId ? { ...z, availableSeats: z.availableSeats + 1 } : z
              ),
              soldCount: Math.max(0, e.soldCount - 1)
            };
          }
          return e;
        }),
        currentUser: state.currentUser ? {
          ...state.currentUser,
          yearlySpending: newYearlySpending,
          memberLevel: newLevel
        } : state.currentUser,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            userId: currentUser.id,
            type: 'ticket',
            title: '退票成功',
            content: `您的「${event?.title}」退票申请已通过，退款${refundAmount}元${fee > 0 ? `（扣除手续费${fee}元）` : ''}将原路返回。`,
            read: false,
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
          },
          ...state.notifications
        ]
      };
    });

    return { success: true, refundAmount, message: '退票申请已通过' };
  },

  transferTicket: (ticketId, toUserId) => {
    const { tickets, users, currentUser, events } = get();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !currentUser) return { success: false, message: '参数错误' };

    if (ticket.userId !== currentUser.id) {
      return { success: false, message: '只能转赠自己的票' };
    }
    if (ticket.status !== 'valid') {
      return { success: false, message: '该票不可转赠' };
    }
    if (toUserId === currentUser.id) {
      return { success: false, message: '不能转赠给自己' };
    }

    const toUser = users.find((u) => u.id === toUserId);
    if (!toUser) return { success: false, message: '接收用户不存在' };

    const event = events.find((e) => e.id === ticket.eventId);

    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              userId: toUserId,
              status: 'valid' as TicketStatus,
              transferChain: [...t.transferChain, toUserId]
            }
          : t
      ),
      notifications: [
        {
          id: `notif-${Date.now()}-1`,
          userId: currentUser.id,
          type: 'ticket',
          title: '转赠成功',
          content: `您已成功将「${event?.title}」的电子票转赠给「${toUser.username}」，原票已自动失效。`,
          read: false,
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        },
        {
          id: `notif-${Date.now()}-2`,
          userId: toUserId,
          type: 'ticket',
          title: '收到转赠票',
          content: `「${currentUser.username}」向您转赠了「${event?.title}」的电子票，请查收！`,
          read: false,
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        },
        ...state.notifications
      ]
    }));

    return { success: true, message: '转赠成功！接收方可在票夹查收' };
  },

  recalcUserMemberLevel: (userId) => {
    set((state) => ({
      users: state.users.map((u) => {
        if (u.id === userId) {
          return { ...u, memberLevel: calculateMemberLevel(u.yearlySpending) };
        }
        return u;
      })
    }));
  },

  getSalesData: (eventId) => {
    const { tickets, events } = get();
    const event = events.find((e) => e.id === eventId);
    if (!event) return [];

    const eventTickets = tickets.filter((t) => t.eventId === eventId);
    const grouped: { [key: string]: { sales: number; count: number } } = {};

    eventTickets.forEach((t) => {
      const date = t.purchaseTime.slice(5, 10);
      if (!grouped[date]) grouped[date] = { sales: 0, count: 0 };
      grouped[date].sales += t.paidPrice;
      grouped[date].count += 1;
    });

    const dates = Object.keys(grouped).sort();
    if (dates.length === 0) {
      return [
        { date: '06-01', sales: 45000, tickets: 42 },
        { date: '06-03', sales: 89000, tickets: 85 },
        { date: '06-05', sales: 128000, tickets: 120 },
        { date: '06-07', sales: 67000, tickets: 63 }
      ];
    }

    return dates.map((d) => ({
      date: d,
      sales: grouped[d].sales,
      tickets: grouped[d].count
    }));
  },

  generatePriceSuggestions: () => {
    const { events } = get();
    const suggestions: PriceSuggestion[] = [];

    events.forEach((event) => {
      if (!event.dynamicPricingEnabled) return;

      event.zones.forEach((zone) => {
        const sellRate = (zone.totalSeats - zone.availableSeats) / zone.totalSeats;
        let suggestedPrice = zone.currentPrice;
        let changePercent = 0;
        let reason = '';
        let confidence = 0.7;

        const daysUntil = getDaysUntil(event.startTime);

        if (sellRate >= 0.8) {
          changePercent = Math.min(20, Math.round(sellRate * 20));
          reason = `销售火爆，已售出${Math.round(sellRate * 100)}%，建议涨价`;
          confidence = 0.9;
        } else if (sellRate <= 0.3 && daysUntil <= 14) {
          changePercent = -10;
          reason = `临近开演仅${daysUntil}天，售出仅${Math.round(sellRate * 100)}%，建议降价促销`;
          confidence = 0.75;
        } else if (sellRate <= 0.15 && daysUntil <= 7) {
          changePercent = -20;
          reason = `距开演不足7天，售出仅${Math.round(sellRate * 100)}%，强烈建议降价`;
          confidence = 0.85;
        } else if (daysUntil <= 3 && sellRate < 0.5) {
          changePercent = -15;
          reason = '开演在即，库存较多，建议适度降价吸引';
          confidence = 0.7;
        }

        if (changePercent !== 0) {
          suggestedPrice = Math.round(zone.basePrice * (1 + changePercent / 100));
          if (suggestedPrice !== zone.currentPrice) {
            suggestions.push({
              eventId: event.id,
              zoneId: zone.id,
              currentPrice: zone.currentPrice,
              suggestedPrice,
              changePercent,
              reason,
              confidence
            });
          }
        }
      });
    });

    return suggestions;
  },

  applyVolunteer: (jobId) => {
    const { currentUser, volunteerJobs, volunteerApplications } = get();
    if (!currentUser) return false;

    const job = volunteerJobs.find((j) => j.id === jobId);
    if (!job || job.signedUpCount >= job.requiredCount) return false;

    const existing = volunteerApplications.find(
      (a) => a.userId === currentUser.id && a.jobId === jobId
    );
    if (existing) return false;

    const newApp: VolunteerApplication = {
      id: `app-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.username,
      jobId,
      status: 'pending',
      appliedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      checkedIn: false,
      serviceHours: 0,
      totalHours: 0
    };

    set((state) => ({
      volunteerApplications: [...state.volunteerApplications, newApp],
      volunteerJobs: state.volunteerJobs.map((j) =>
        j.id === jobId ? { ...j, signedUpCount: j.signedUpCount + 1 } : j
      )
    }));
    return true;
  },

  checkInVolunteer: (applicationId) => {
    set((state) => ({
      volunteerApplications: state.volunteerApplications.map((a) => {
        if (a.id === applicationId) {
          const job = state.volunteerJobs.find((j) => j.id === a.jobId);
          const startH = parseInt(job?.startTime.split(':')[0] || '9');
          const endH = parseInt(job?.endTime.split(':')[0] || '18');
          const hours = endH - startH;
          return {
            ...a,
            checkedIn: true,
            checkInTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
            status: 'completed',
            serviceHours: hours,
            totalHours: a.totalHours + hours
          };
        }
        return a;
      })
    }));
    return true;
  },

  updateSeatStatus: (eventId, seatId, status) => {
    set((state) => ({
      events: state.events.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            seats: e.seats.map((s) => (s.id === seatId ? { ...s, status } : s))
          };
        }
        return e;
      })
    }));
  },

  createEvent: (eventData) => {
    const zones = eventData.zones || [];
    const seats: Seat[] = [];
    zones.forEach((zone: any, zi: number) => {
      const prefix = String.fromCharCode(65 + zi);
      const rows = Math.ceil(Math.sqrt(zone.seats || 100));
      const cols = Math.ceil((zone.seats || 100) / rows);
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols && seats.length - zi * 100 < (zone.seats || 100); c++) {
          seats.push({
            id: `seat-${zone.id || `nz${zi}`}-${r}-${c}`,
            row: prefix + r,
            number: c,
            zoneId: zone.id || `nz${zi}`,
            status: 'available',
            price: zone.price || 0
          });
        }
      }
    });

    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: eventData.title || '',
      category: (eventData.category as EventCategory) || 'concert',
      description: eventData.description || '',
      coverImage: eventData.coverImage || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(eventData.title || '演出')}&image_size=landscape_16_9`,
      images: eventData.images || [],
      venue: eventData.venue || '',
      city: eventData.city || '',
      address: eventData.address || '',
      startTime: eventData.startTime || '',
      endTime: eventData.endTime || '',
      organizer: eventData.organizer || '主办方',
      organizerId: eventData.organizerId || 'org-default',
      zones: zones.map((z: any, i: number) => ({
        id: z.id || `zone-new-${i}`,
        name: z.name,
        color: z.color,
        basePrice: z.price,
        currentPrice: z.price,
        totalSeats: z.seats,
        availableSeats: z.seats,
        description: z.description || '',
        ticketType: z.ticketType || 'regular'
      })),
      seats,
      totalCapacity: zones.reduce((s: number, z: any) => s + (z.seats || 0), 0),
      soldCount: 0,
      checkedInCount: 0,
      isHot: false,
      tags: eventData.tags || [],
      dynamicPricingEnabled: true,
      priceRange: zones.length > 0 ? {
        min: Math.min(...zones.map((z: any) => z.price)),
        max: Math.max(...zones.map((z: any) => z.price))
      } : { min: 0, max: 0 }
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },

  applyPriceSuggestion: (eventId, zoneId) => {
    const suggestions = get().generatePriceSuggestions();
    const suggestion = suggestions.find((s) => s.eventId === eventId && s.zoneId === zoneId);
    if (!suggestion) return { success: false, newPrice: 0 };

    set((state) => ({
      events: state.events.map((e) => {
        if (e.id === eventId) {
          const updatedZones = e.zones.map((z) =>
            z.id === zoneId
              ? { ...z, currentPrice: suggestion.suggestedPrice }
              : z
          );
          return {
            ...e,
            zones: updatedZones,
            priceRange: {
              min: Math.min(...updatedZones.map((z) => z.currentPrice)),
              max: Math.max(...updatedZones.map((z) => z.currentPrice))
            }
          };
        }
        return e;
      })
    }));

    return { success: true, newPrice: suggestion.suggestedPrice };
  },

  markNotificationRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  },

  addNotification: (userId, type, title, content) => {
    set((state) => ({
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId,
          type,
          title,
          content,
          read: false,
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        },
        ...state.notifications
      ]
    }));
  },

  priceSuggestions: get().generatePriceSuggestions(),
  salesData: {},

  buyTicket: (eventId, seatId, zoneId) => {
    const { events, currentUser } = get();
    if (!currentUser) return null;
    const event = events.find((e) => e.id === eventId);
    const seat = event?.seats.find((s) => s.id === seatId);
    if (!seat) return null;
    get().selectSeats(eventId, [seat]);
    const result = get().processPayment({ method: 'card' });
    return result && result.length > 0 ? result[0] : null;
  },

  checkInAudience: (ticketId) => {
    const result = get().verifyAndCheckIn(ticketId);
    return result.success;
  },

  refundTicket: (ticketId) => {
    const result = get().requestRefund(ticketId, '兼容性调用');
    return result.success;
  },

  getAdminStats: () => {
    const { events, tickets, users, volunteerApplications } = get();

    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalCapacity = 0;
    let totalCheckedIn = 0;

    events.forEach((e) => {
      e.zones.forEach((z) => {
        totalRevenue += (z.totalSeats - z.availableSeats) * z.currentPrice;
      });
      totalTicketsSold += e.soldCount;
      totalCapacity += e.totalCapacity;
      totalCheckedIn += e.checkedInCount;
    });

    const realRevenue = tickets.reduce((s, t) => s + (t.status !== 'refunded' ? t.paidPrice : 0), 0);
    if (realRevenue > 0) totalRevenue = realRevenue;

    const avgAttendance = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

    const activeUsers = users.filter((u) => u.purchaseHistory.length > 0).length;
    const memberActiveRate = users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0;

    const volunteerTotal = volunteerApplications.length;
    const volunteerCheckedIn = volunteerApplications.filter((a) => a.checkedIn).length;
    const volunteerRate = volunteerTotal > 0 ? Math.round((volunteerCheckedIn / volunteerTotal) * 100) : 0;

    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const base = totalRevenue / 30;
    const weeklyForecast = days.map((d, i) => ({
      date: d,
      revenue: i < 4 ? Math.round(base * (0.6 + Math.random() * 0.8)) : 0,
      predicted: Math.round(base * (0.8 + i * 0.15 + Math.random() * 0.3))
    }));

    return {
      totalRevenue,
      totalTickets: totalTicketsSold,
      totalCapacity,
      avgAttendance,
      complaintRate: 0.8,
      memberActiveRate,
      volunteerRate,
      weeklyForecast
    };
  }
}));
