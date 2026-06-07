import {
  EventItem,
  User,
  Ticket,
  VolunteerJob,
  VolunteerApplication,
  Notification,
  SalesDataPoint,
  PriceSuggestion
} from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-001',
    username: '音乐爱好者',
    email: 'music@example.com',
    phone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=music',
    memberLevel: 'gold',
    yearlySpending: 15800,
    preferences: ['concert', 'drama'],
    purchaseHistory: ['event-001', 'event-003'],
    birthday: '1995-06-15',
    city: '北京'
  },
  {
    id: 'user-002',
    username: '体育迷小王',
    email: 'sports@example.com',
    phone: '13800138002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sports',
    memberLevel: 'silver',
    yearlySpending: 5200,
    preferences: ['sports'],
    purchaseHistory: ['event-002'],
    birthday: '1998-03-20',
    city: '上海'
  }
];

const generateSeats = (): any[] => {
  const seats: any[] = [];
  const zones = [
    { id: 'zone-vip', prefix: 'A', rows: 5, cols: 20, price: 1280 },
    { id: 'zone-a', prefix: 'B', rows: 8, cols: 25, price: 680 },
    { id: 'zone-b', prefix: 'C', rows: 10, cols: 30, price: 380 },
    { id: 'zone-c', prefix: 'D', rows: 12, cols: 35, price: 180 }
  ];

  zones.forEach((zone) => {
    for (let r = 1; r <= zone.rows; r++) {
      for (let c = 1; c <= zone.cols; c++) {
        const random = Math.random();
        seats.push({
          id: `seat-${zone.prefix}-${r}-${c}`,
          row: zone.prefix + r,
          number: c,
          zoneId: zone.id,
          status: random < 0.3 ? 'sold' : random < 0.35 ? 'reserved' : 'available',
          price: zone.price
        });
      }
    }
  });
  return seats;
};

export const mockEvents: EventItem[] = [
  {
    id: 'event-001',
    title: '周杰伦2026嘉年华世界巡回演唱会·北京站',
    category: 'concert',
    description: '华语乐坛天王周杰伦时隔五年再度开启世界巡回演唱会，经典曲目全新编曲，沉浸式舞台效果，带你重温青春记忆。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=周杰伦演唱会舞台灯光效果炫酷紫色调&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=大型演唱会现场观众欢呼&image_size=landscape_16_9',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=演唱会舞台特效烟火&image_size=landscape_16_9'
    ],
    venue: '国家体育场（鸟巢）',
    city: '北京',
    address: '北京市朝阳区国家体育场南路1号',
    startTime: '2026-07-15 19:30',
    endTime: '2026-07-15 22:30',
    organizer: '巨室音乐',
    organizerId: 'org-001',
    zones: [
      {
        id: 'zone-vip',
        name: '内场VIP区',
        color: '#ef4444',
        basePrice: 1280,
        currentPrice: 1280,
        totalSeats: 100,
        availableSeats: 12,
        description: '最靠近舞台的内场区域，与偶像近距离接触',
        ticketType: 'vip'
      },
      {
        id: 'zone-a',
        name: 'A区看台',
        color: '#f59e0b',
        basePrice: 680,
        currentPrice: 748,
        totalSeats: 200,
        availableSeats: 45,
        description: '最佳观赏视角，视野开阔',
        ticketType: 'regular'
      },
      {
        id: 'zone-b',
        name: 'B区看台',
        color: '#3b82f6',
        basePrice: 380,
        currentPrice: 380,
        totalSeats: 300,
        availableSeats: 120,
        description: '性价比之选',
        ticketType: 'regular'
      },
      {
        id: 'zone-c',
        name: 'C区看台',
        color: '#22c55e',
        basePrice: 180,
        currentPrice: 180,
        totalSeats: 420,
        availableSeats: 280,
        description: '早鸟优惠票，限量发售',
        ticketType: 'early_bird'
      }
    ],
    seats: generateSeats(),
    totalCapacity: 1020,
    soldCount: 563,
    checkedInCount: 0,
    isHot: true,
    tags: ['热门', '华语流行', '天王'],
    dynamicPricingEnabled: true,
    priceRange: { min: 180, max: 1280 },
    viewImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=体育场座位视角示意图3D渲染&image_size=landscape_4_3'
  },
  {
    id: 'event-002',
    title: 'CBA总决赛 北京首钢VS广东宏远',
    category: 'sports',
    description: '年度巅峰对决，CBA总冠军争夺战，顶级篮球盛宴！',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CBA篮球比赛现场激烈对抗蓝色橙色调&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=篮球馆全景灯光&image_size=landscape_16_9'
    ],
    venue: '五棵松凯迪拉克中心',
    city: '北京',
    address: '北京市海淀区复兴路69号',
    startTime: '2026-06-20 19:35',
    endTime: '2026-06-20 22:00',
    organizer: 'CBA联盟',
    organizerId: 'org-002',
    zones: [
      {
        id: 'zone-vip',
        name: 'VIP场边区',
        color: '#ef4444',
        basePrice: 2880,
        currentPrice: 2880,
        totalSeats: 50,
        availableSeats: 8,
        description: '场边第一排，球员就在身边',
        ticketType: 'vip'
      },
      {
        id: 'zone-a',
        name: '包厢',
        color: '#a855f7',
        basePrice: 8888,
        currentPrice: 8888,
        totalSeats: 20,
        availableSeats: 5,
        description: '独立包厢，专属服务，可容纳10人',
        ticketType: 'box'
      },
      {
        id: 'zone-b',
        name: '下层看台',
        color: '#3b82f6',
        basePrice: 880,
        currentPrice: 968,
        totalSeats: 400,
        availableSeats: 89,
        description: '近距离观赛',
        ticketType: 'regular'
      },
      {
        id: 'zone-c',
        name: '上层看台',
        color: '#22c55e',
        basePrice: 380,
        currentPrice: 380,
        totalSeats: 800,
        availableSeats: 356,
        description: '全景视角',
        ticketType: 'regular'
      }
    ],
    seats: generateSeats(),
    totalCapacity: 1270,
    soldCount: 812,
    checkedInCount: 0,
    isHot: true,
    tags: ['体育', '篮球', '总决赛'],
    dynamicPricingEnabled: true,
    priceRange: { min: 380, max: 8888 }
  },
  {
    id: 'event-003',
    title: '话剧《雷雨》经典复排版',
    category: 'drama',
    description: '曹禺经典名作，国家话剧院全明星阵容演绎，揭露封建家庭的罪恶。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=话剧雷雨舞台布景复古民国风格戏剧灯光&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=话剧演员表演舞台剧照&image_size=landscape_16_9'
    ],
    venue: '国家大剧院',
    city: '北京',
    address: '北京市西城区西长安街2号',
    startTime: '2026-07-01 19:30',
    endTime: '2026-07-01 22:00',
    organizer: '国家话剧院',
    organizerId: 'org-003',
    zones: [
      {
        id: 'zone-vip',
        name: 'VIP池座',
        color: '#ef4444',
        basePrice: 880,
        currentPrice: 880,
        totalSeats: 80,
        availableSeats: 23,
        description: '前排池座，最佳观赏体验',
        ticketType: 'vip'
      },
      {
        id: 'zone-a',
        name: '一层楼座',
        color: '#f59e0b',
        basePrice: 480,
        currentPrice: 480,
        totalSeats: 150,
        availableSeats: 67,
        description: '一楼正厅',
        ticketType: 'regular'
      },
      {
        id: 'zone-b',
        name: '二层楼座',
        color: '#3b82f6',
        basePrice: 280,
        currentPrice: 252,
        totalSeats: 200,
        availableSeats: 145,
        description: '限时早鸟优惠',
        ticketType: 'early_bird'
      }
    ],
    seats: generateSeats(),
    totalCapacity: 430,
    soldCount: 195,
    checkedInCount: 0,
    isHot: false,
    tags: ['话剧', '经典', '文艺'],
    dynamicPricingEnabled: false,
    priceRange: { min: 280, max: 880 }
  },
  {
    id: 'event-004',
    title: '五月天「回到那一天」演唱会',
    category: 'concert',
    description: '五月天成军25周年特别巡演，带你一起回到那些年的青春时光。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=五月天演唱会蓝色海洋灯海特效&image_size=landscape_16_9',
    images: [],
    venue: '梅赛德斯奔驰文化中心',
    city: '上海',
    address: '上海市浦东新区世博大道1200号',
    startTime: '2026-08-08 19:30',
    endTime: '2026-08-08 22:30',
    organizer: '相信音乐',
    organizerId: 'org-001',
    zones: [
      {
        id: 'zone-vip',
        name: '摇滚区',
        color: '#ef4444',
        basePrice: 1580,
        currentPrice: 1580,
        totalSeats: 500,
        availableSeats: 0,
        description: '站立摇滚区，零距离互动',
        ticketType: 'vip'
      },
      {
        id: 'zone-a',
        name: '看台内场',
        color: '#f59e0b',
        basePrice: 880,
        currentPrice: 880,
        totalSeats: 300,
        availableSeats: 12,
        description: '内场看台',
        ticketType: 'regular'
      },
      {
        id: 'zone-b',
        name: '上层看台',
        color: '#3b82f6',
        basePrice: 380,
        currentPrice: 380,
        totalSeats: 600,
        availableSeats: 234,
        description: '山顶票',
        ticketType: 'regular'
      }
    ],
    seats: generateSeats(),
    totalCapacity: 1400,
    soldCount: 1154,
    checkedInCount: 0,
    isHot: true,
    tags: ['热门', '摇滚', '青春'],
    dynamicPricingEnabled: true,
    priceRange: { min: 380, max: 1580 }
  },
  {
    id: 'event-005',
    title: '中超联赛 上海申花VS北京国安',
    category: 'sports',
    description: '京沪德比，老牌劲旅的宿命对决！',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=足球比赛绿茵场激烈对抗蓝色绿色调&image_size=landscape_16_9',
    images: [],
    venue: '上海体育场',
    city: '上海',
    address: '上海市徐汇区天钥桥路666号',
    startTime: '2026-06-25 19:35',
    endTime: '2026-06-25 21:45',
    organizer: '中超公司',
    organizerId: 'org-002',
    zones: [
      {
        id: 'zone-vip',
        name: 'VIP主看台',
        color: '#ef4444',
        basePrice: 680,
        currentPrice: 680,
        totalSeats: 200,
        availableSeats: 45,
        description: '主队VIP区',
        ticketType: 'vip'
      },
      {
        id: 'zone-a',
        name: '南看台（球迷区）',
        color: '#22c55e',
        basePrice: 120,
        currentPrice: 120,
        totalSeats: 1000,
        availableSeats: 156,
        description: '死忠球迷专属区域',
        ticketType: 'regular'
      },
      {
        id: 'zone-b',
        name: '北看台',
        color: '#3b82f6',
        basePrice: 280,
        currentPrice: 280,
        totalSeats: 800,
        availableSeats: 423,
        description: '普通观众区',
        ticketType: 'regular'
      }
    ],
    seats: generateSeats(),
    totalCapacity: 2000,
    soldCount: 1376,
    checkedInCount: 0,
    isHot: true,
    tags: ['足球', '中超', '德比'],
    dynamicPricingEnabled: true,
    priceRange: { min: 120, max: 680 }
  },
  {
    id: 'event-006',
    title: '百老汇音乐剧《猫》中文版',
    category: 'drama',
    description: '世界经典音乐剧首度中文版演绎，华丽服装与动人旋律。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=音乐剧猫舞台华丽服装猫造型灯光梦幻&image_size=landscape_16_9',
    images: [],
    venue: '上海文化广场',
    city: '上海',
    address: '上海市黄浦区永嘉路36号',
    startTime: '2026-07-20 19:30',
    endTime: '2026-07-20 22:00',
    organizer: '聚橙音乐剧',
    organizerId: 'org-003',
    zones: [
      {
        id: 'zone-vip',
        name: 'VIP',
        color: '#ef4444',
        basePrice: 1080,
        currentPrice: 1080,
        totalSeats: 60,
        availableSeats: 18,
        description: '前6排',
        ticketType: 'vip'
      },
      {
        id: 'zone-a',
        name: 'A区',
        color: '#f59e0b',
        basePrice: 580,
        currentPrice: 580,
        totalSeats: 200,
        availableSeats: 78,
        description: '中区',
        ticketType: 'regular'
      },
      {
        id: 'zone-b',
        name: 'B区',
        color: '#3b82f6',
        basePrice: 280,
        currentPrice: 280,
        totalSeats: 300,
        availableSeats: 189,
        description: '后区/二楼',
        ticketType: 'regular'
      }
    ],
    seats: generateSeats(),
    totalCapacity: 560,
    soldCount: 275,
    checkedInCount: 0,
    isHot: false,
    tags: ['音乐剧', '百老汇', '中文版'],
    dynamicPricingEnabled: false,
    priceRange: { min: 280, max: 1080 }
  }
];

export const mockTickets: Ticket[] = [
  {
    id: 'ticket-001',
    userId: 'user-001',
    eventId: 'event-001',
    seatId: 'seat-A-2-15',
    seatInfo: { zone: '内场VIP区', row: 'A2', number: 15 },
    originalPrice: 1280,
    paidPrice: 1280,
    purchaseTime: '2026-05-20 14:30',
    status: 'valid',
    qrCode: 'TICKET-001-USER001-EVENT001-2026',
    antiFakeCode: 'AF8X3K9P2M',
    transferChain: ['user-001']
  },
  {
    id: 'ticket-002',
    userId: 'user-001',
    eventId: 'event-003',
    seatId: 'seat-A-1-8',
    seatInfo: { zone: 'VIP池座', row: 'A1', number: 8 },
    originalPrice: 880,
    paidPrice: 880,
    purchaseTime: '2026-06-01 10:15',
    status: 'valid',
    qrCode: 'TICKET-002-USER001-EVENT003-2026',
    antiFakeCode: 'B2Q7Z4L8N1',
    transferChain: ['user-001']
  },
  {
    id: 'ticket-003',
    userId: 'user-002',
    eventId: 'event-002',
    seatId: 'seat-C-5-20',
    seatInfo: { zone: '下层看台', row: 'C5', number: 20 },
    originalPrice: 880,
    paidPrice: 880,
    purchaseTime: '2026-06-10 09:00',
    status: 'valid',
    qrCode: 'TICKET-003-USER002-EVENT002-2026',
    antiFakeCode: 'M5R9T2Y6W3',
    transferChain: ['user-002']
  }
];

export const mockVolunteerJobs: VolunteerJob[] = [
  {
    id: 'job-001',
    eventId: 'event-001',
    eventTitle: '周杰伦2026嘉年华演唱会',
    position: 'guide',
    positionName: '场馆引导员',
    date: '2026-07-15',
    startTime: '16:00',
    endTime: '23:00',
    location: '国家体育场',
    requiredCount: 30,
    signedUpCount: 18,
    description: '负责引导观众入场、指引座位区域、解答观众问题',
    requirements: ['熟悉场馆布局', '良好沟通能力', '着装整齐']
  },
  {
    id: 'job-002',
    eventId: 'event-001',
    eventTitle: '周杰伦2026嘉年华演唱会',
    position: 'ticket_checker',
    positionName: '检票员',
    date: '2026-07-15',
    startTime: '17:00',
    endTime: '21:00',
    location: '国家体育场各入口',
    requiredCount: 20,
    signedUpCount: 12,
    description: '负责电子票扫码核验、入场秩序维护',
    requirements: ['熟悉验票系统', '认真负责', '工作细心']
  },
  {
    id: 'job-003',
    eventId: 'event-002',
    eventTitle: 'CBA总决赛',
    position: 'usher',
    positionName: '座位引导员',
    date: '2026-06-20',
    startTime: '18:00',
    endTime: '22:30',
    location: '五棵松凯迪拉克中心',
    requiredCount: 15,
    signedUpCount: 8,
    description: '引导观众找到座位、维护看台秩序',
    requirements: ['了解篮球馆布局', '服务意识强']
  },
  {
    id: 'job-004',
    eventId: 'event-003',
    eventTitle: '话剧《雷雨》',
    position: 'support',
    positionName: '后勤支持',
    date: '2026-07-01',
    startTime: '14:00',
    endTime: '22:30',
    location: '国家大剧院',
    requiredCount: 8,
    signedUpCount: 5,
    description: '协助场务工作、物资管理、观众服务',
    requirements: ['吃苦耐劳', '有团队合作精神']
  }
];

export const mockVolunteerApplications: VolunteerApplication[] = [
  {
    id: 'app-001',
    userId: 'user-001',
    userName: '音乐爱好者',
    jobId: 'job-001',
    status: 'approved',
    appliedAt: '2026-06-01 10:30',
    checkedIn: false,
    serviceHours: 0,
    totalHours: 12
  },
  {
    id: 'app-002',
    userId: 'user-002',
    userName: '体育迷小王',
    jobId: 'job-003',
    status: 'pending',
    appliedAt: '2026-06-12 15:20',
    checkedIn: false,
    serviceHours: 0,
    totalHours: 4.5
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-001',
    type: 'ticket',
    title: '购票成功',
    content: '您已成功购买「周杰伦2026嘉年华演唱会」门票，请提前到场观演。',
    read: false,
    createdAt: '2026-05-20 14:32'
  },
  {
    id: 'notif-002',
    userId: 'user-001',
    type: 'member',
    title: '会员升级提醒',
    content: '您距离钻石会员还差4200元，继续加油！',
    read: false,
    createdAt: '2026-06-05 09:00'
  },
  {
    id: 'notif-003',
    userId: 'user-001',
    type: 'volunteer',
    title: '志愿者申请通过',
    content: '您申请的周杰伦演唱会场馆引导员岗位已通过审核，请准时参加培训。',
    read: true,
    createdAt: '2026-06-03 16:45'
  },
  {
    id: 'notif-004',
    userId: 'user-001',
    type: 'event',
    title: '推荐演出',
    content: '根据您的喜好，为您推荐五月天「回到那一天」演唱会！',
    read: true,
    createdAt: '2026-06-10 11:20'
  }
];

export const mockSalesData: { [eventId: string]: SalesDataPoint[] } = {
  'event-001': [
    { date: '05-15', sales: 128000, tickets: 120 },
    { date: '05-20', sales: 89600, tickets: 85 },
    { date: '05-25', sales: 156400, tickets: 148 },
    { date: '05-30', sales: 98200, tickets: 93 },
    { date: '06-01', sales: 234000, tickets: 221 },
    { date: '06-05', sales: 67800, tickets: 64 },
    { date: '06-10', sales: 45200, tickets: 42 }
  ]
};

export const mockPriceSuggestions: PriceSuggestion[] = [
  {
    eventId: 'event-001',
    zoneId: 'zone-a',
    currentPrice: 680,
    suggestedPrice: 748,
    changePercent: 10,
    reason: '预售火爆，剩余座位不足25%，建议适度涨价',
    confidence: 0.92
  },
  {
    eventId: 'event-002',
    zoneId: 'zone-b',
    currentPrice: 880,
    suggestedPrice: 968,
    changePercent: 10,
    reason: '临近比赛，关注度持续攀升',
    confidence: 0.88
  },
  {
    eventId: 'event-003',
    zoneId: 'zone-b',
    currentPrice: 280,
    suggestedPrice: 252,
    changePercent: -10,
    reason: '销售进度缓慢，建议降价促销',
    confidence: 0.75
  }
];

export const memberLevelConfig = {
  normal: { minSpending: 0, maxSpending: 1999, name: '普通会员', color: '#9ca3af', benefits: ['基础购票服务', '活动通知'] },
  silver: { minSpending: 2000, maxSpending: 4999, name: '银卡会员', color: '#94a3b8', benefits: ['购票享95折', '优先购票24小时', '生日优惠券'] },
  gold: { minSpending: 5000, maxSpending: 19999, name: '金卡会员', color: '#f59e0b', benefits: ['购票享9折', '优先购票72小时', '生日赠票1张', '免退票手续费（每年3次）'] },
  diamond: { minSpending: 20000, maxSpending: Infinity, name: '钻石会员', color: '#c026d3', benefits: ['购票享85折', '优先购票提前7天', '生日赠票2张', '无限次免退票手续费', '专属客服', 'VIP活动邀请'] }
};

export const refundRules = [
  { daysBeforeEvent: 30, feeRate: 0, description: '开演前30天以上：全额退款' },
  { daysBeforeEvent: 15, feeRate: 0.05, description: '开演前15-29天：5%手续费' },
  { daysBeforeEvent: 7, feeRate: 0.1, description: '开演前7-14天：10%手续费' },
  { daysBeforeEvent: 3, feeRate: 0.2, description: '开演前3-6天：20%手续费' },
  { daysBeforeEvent: 0, feeRate: 0.5, description: '开演前0-2天：50%手续费' }
];
