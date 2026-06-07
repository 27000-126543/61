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
  SeatStatus
} from '../types';
import {
  mockUsers,
  mockEvents,
  mockTickets,
  mockVolunteerJobs,
  mockVolunteerApplications,
  mockNotifications,
  mockSalesData,
  mockPriceSuggestions
} from '../data/mockData';

type AppState = {
  currentUser: User | null;
  users: User[];
  events: EventItem[];
  tickets: Ticket[];
  volunteerJobs: VolunteerJob[];
  volunteerApplications: VolunteerApplication[];
  notifications: Notification[];
  salesData: { [eventId: string]: SalesDataPoint[] };
  priceSuggestions: PriceSuggestion[];
  isLoggedIn: boolean;
  currentView: 'user' | 'organizer' | 'volunteer' | 'admin';

  login: (username: string, password: string) => boolean;
  register: (userData: Partial<User>) => boolean;
  logout: () => void;
  setCurrentView: (view: 'user' | 'organizer' | 'volunteer' | 'admin') => void;

  buyTicket: (eventId: string, seatId: string, zoneId: string) => Ticket | null;
  refundTicket: (ticketId: string) => boolean;
  transferTicket: (ticketId: string, toUserId: string) => boolean;

  applyVolunteer: (jobId: string) => boolean;
  checkInVolunteer: (applicationId: string) => boolean;
  checkInAudience: (ticketId: string) => boolean;

  updateSeatStatus: (eventId: string, seatId: string, status: SeatStatus) => void;

  createEvent: (event: Partial<EventItem>) => void;
  applyPriceSuggestion: (eventId: string, zoneId: string) => void;

  markNotificationRead: (notificationId: string) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  events: mockEvents,
  tickets: mockTickets,
  volunteerJobs: mockVolunteerJobs,
  volunteerApplications: mockVolunteerApplications,
  notifications: mockNotifications,
  salesData: mockSalesData,
  priceSuggestions: mockPriceSuggestions,
  isLoggedIn: true,
  currentView: 'user',

  login: (username: string, _password: string) => {
    const user = mockUsers.find(
      (u) => u.username === username || u.email === username || u.phone === username
    );
    if (user) {
      set({ currentUser: user, isLoggedIn: true });
      return true;
    }
    return false;
  },

  register: (userData: Partial<User>) => {
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
    set({ currentUser: null, isLoggedIn: false });
  },

  setCurrentView: (view) => {
    set({ currentView: view });
  },

  buyTicket: (eventId, seatId, zoneId) => {
    const { events, currentUser, tickets } = get();
    if (!currentUser) return null;

    const event = events.find((e) => e.id === eventId);
    if (!event) return null;

    const seat = event.seats.find((s) => s.id === seatId);
    const zone = event.zones.find((z) => z.id === zoneId);
    if (!seat || !zone) return null;

    if (seat.status !== 'available') return null;

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      userId: currentUser.id,
      eventId,
      seatId,
      seatInfo: {
        zone: zone.name,
        row: seat.row,
        number: seat.number
      },
      originalPrice: seat.price,
      paidPrice: seat.price,
      purchaseTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'valid',
      qrCode: `TICKET-${Date.now()}-${currentUser.id}-${eventId}`,
      antiFakeCode: Math.random().toString(36).substring(2, 12).toUpperCase(),
      transferChain: [currentUser.id]
    };

    set((state) => {
      const updatedEvents = state.events.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            seats: e.seats.map((s) => (s.id === seatId ? { ...s, status: 'sold' as SeatStatus } : s)),
            zones: e.zones.map((z) =>
              z.id === zoneId ? { ...z, availableSeats: z.availableSeats - 1 } : z
            ),
            soldCount: e.soldCount + 1
          };
        }
        return e;
      });
      return {
        events: updatedEvents,
        tickets: [...tickets, newTicket],
        currentUser: {
          ...currentUser,
          purchaseHistory: [...currentUser.purchaseHistory, eventId],
          yearlySpending: currentUser.yearlySpending + seat.price
        }
      };
    });

    return newTicket;
  },

  refundTicket: (ticketId) => {
    const { tickets, events, currentUser } = get();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !currentUser || ticket.userId !== currentUser.id) return false;
    if (ticket.status !== 'valid') return false;

    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId ? { ...t, status: 'refunded' } : t
      ),
      events: state.events.map((e) => {
        if (e.id === ticket.eventId) {
          return {
            ...e,
            seats: e.seats.map((s) =>
              s.id === ticket.seatId ? { ...s, status: 'available' as SeatStatus } : s
            ),
            soldCount: e.soldCount - 1
          };
        }
        return e;
      })
    }));
    return true;
  },

  transferTicket: (ticketId, toUserId) => {
    const { tickets, currentUser } = get();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !currentUser || ticket.userId !== currentUser.id) return false;
    if (ticket.status !== 'valid') return false;

    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              userId: toUserId,
              status: 'transferred',
              transferChain: [...t.transferChain, toUserId]
            }
          : t
      )
    }));
    return true;
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
      volunteerApplications: state.volunteerApplications.map((a) =>
        a.id === applicationId
          ? { ...a, checkedIn: true, checkInTime: new Date().toISOString().slice(0, 16).replace('T', ' '), status: 'completed', serviceHours: 6 } : a
      )
    }));
    return true;
  },

  checkInAudience: (ticketId) => {
    const { tickets, events } = get();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId ? { ...t, status: 'used' as const } : t
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
    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: eventData.title || '',
      category: eventData.category || 'concert',
      description: eventData.description || '',
      coverImage: eventData.coverImage || '',
      images: eventData.images || [],
      venue: eventData.venue || '',
      city: eventData.city || '',
      address: eventData.address || '',
      startTime: eventData.startTime || '',
      endTime: eventData.endTime || '',
      organizer: eventData.organizer || '',
      organizerId: eventData.organizerId || '',
      zones: eventData.zones || [],
      seats: eventData.seats || [],
      totalCapacity: eventData.totalCapacity || 0,
      soldCount: 0,
      checkedInCount: 0,
      isHot: false,
      tags: eventData.tags || [],
      dynamicPricingEnabled: false,
      priceRange: eventData.priceRange || { min: 0, max: 0 }
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },

  applyPriceSuggestion: (eventId, zoneId) => {
    const { priceSuggestions } = get();
    const suggestion = priceSuggestions.find(
      (s) => s.eventId === eventId && s.zoneId === zoneId
    );
    if (!suggestion) return;

    set((state) => ({
      events: state.events.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            zones: e.zones.map((z) =>
              z.id === zoneId
                ? { ...z, currentPrice: suggestion.suggestedPrice }
                : z
            )
          };
        }
        return e;
      })
    }));
  },

  markNotificationRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  }
}));
