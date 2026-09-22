export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  healthNotes: string;
  role: string;
};

export type Membership = {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  classesPerWeek: number;
  totalClasses: number;
  usedClasses: number;
  bonusClasses: number;
  status: string;
};

export type Booking = {
  id: string;
  type: string;
  date: string;
  slotLabel: string;
  status: string;
  name: string;
  notes: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  customerName: string;
  invoiceUrl: string;
  createdAt: string;
};
