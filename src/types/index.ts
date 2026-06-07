export type EventCategory = 'concert' | 'drama' | 'sports';
export type MemberLevel = 'normal' | 'silver' | 'gold' | 'diamond';
export type TicketStatus = 'valid' | 'used' | 'refunded' | 'transferred' | 'expired';
export type SeatStatus = 'available' | 'sold' | 'reserved' | 'checked_in';
export type VolunteerPosition = 'guide' | 'ticket_checker' | 'usher' | 'support';
export type VolunteerStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  memberLevel: MemberLevel;
  yearlySpending: number;
  preferences: EventCategory[];
  purchaseHistory: string[];
  birthday: string;
  city: string;
}

export interface SeatZone {
  id: string;
  name: string;
  color: string;
  basePrice: number;
  currentPrice: number;
  totalSeats: number;
  availableSeats: number;
  description: string;
  ticketType: 'early_bird' | 'regular' | 'vip' | 'box';
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  zoneId: string;
  status: SeatStatus;
  price: number;
}

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  coverImage: string;
  images: string[];
  venue: string;
  city: string;
  address: string;
  startTime: string;
  endTime: string;
  organizer: string;
  organizerId: string;
  zones: SeatZone[];
  seats: Seat[];
  totalCapacity: number;
  soldCount: number;
  checkedInCount: number;
  isHot: boolean;
  tags: string[];
  dynamicPricingEnabled: boolean;
  priceRange: { min: number; max: number };
  viewImage?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  seatId: string;
  seatInfo: {
    zone: string;
    row: string;
    number: number;
  };
  originalPrice: number;
  paidPrice: number;
  purchaseTime: string;
  status: TicketStatus;
  qrCode: string;
  antiFakeCode: string;
  transferChain: string[];
  refundRequested?: boolean;
  refundApproved?: boolean;
}

export interface RefundRule {
  daysBeforeEvent: number;
  feeRate: number;
  description: string;
}

export interface VolunteerJob {
  id: string;
  eventId: string;
  eventTitle: string;
  position: VolunteerPosition;
  positionName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  requiredCount: number;
  signedUpCount: number;
  description: string;
  requirements: string[];
}

export interface VolunteerApplication {
  id: string;
  userId: string;
  userName: string;
  jobId: string;
  status: VolunteerStatus;
  appliedAt: string;
  checkedIn: boolean;
  checkInTime?: string;
  serviceHours: number;
  totalHours: number;
}

export interface SalesDataPoint {
  date: string;
  sales: number;
  tickets: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'system' | 'event' | 'ticket' | 'member' | 'volunteer';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  averageAttendance: number;
  complaintRate: number;
  memberActiveRate: number;
  volunteerAttendanceRate: number;
}

export interface PriceSuggestion {
  eventId: string;
  zoneId: string;
  currentPrice: number;
  suggestedPrice: number;
  changePercent: number;
  reason: string;
  confidence: number;
}
