export type UserRole = 'student' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IStudentProfile {
  _id: string;
  userId: string;
  studentId: string;
  faculty: string;
  department: string;
  program: string;
  semester: string;
  academicYear: string;
  phone: string;
  bio?: string;
  emergencyContact?: string;
  avatar?: string;
}

export type EventStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected' 
  | 'published' 
  | 'cancelled' 
  | 'completed';

export type EventType = 'offline' | 'online' | 'hybrid';

export interface ISpeaker {
  name: string;
  designation: string;
  organization: string;
  photo?: string;
  bio?: string;
}

export interface IAgendaItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface IEvent {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  category: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerRole?: string;
  clubId?: string;
  clubName?: string;
  department?: string;
  eventType: EventType;
  venue: string;
  building?: string;
  room?: string;
  mapUrl?: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  isWaitlistEnabled: boolean;
  registrationFee: number;
  isFeeRequired: boolean;
  status: EventStatus;
  rejectionReason?: string;
  speakers: ISpeaker[];
  agenda: IAgendaItem[];
  requirements?: string[];
  rules?: string[];
  faq?: { question: string; answer: string }[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 
  | 'registered' 
  | 'waitlisted' 
  | 'cancelled' 
  | 'attended' 
  | 'no_show';

export type PaymentStatus = 'free' | 'paid' | 'pending';

export interface IEventRegistration {
  _id: string;
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  eventVenue: string;
  eventCoverImage?: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  department: string;
  phone: string;
  registrationCode: string;
  qrPayloadToken: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  trxId?: string;
  amountPaid?: number;
  tshirtSize?: string;
  foodPreference?: string;
  registeredAt: string;
  cancelledAt?: string;
  attendedAt?: string;
}

export interface IAttendance {
  _id: string;
  eventId: string;
  registrationId: string;
  userId: string;
  studentId: string;
  studentName: string;
  department: string;
  checkedInAt: string;
  checkedInBy: string;
  verificationMethod: 'qr_scan' | 'manual';
}

export interface ICertificate {
  _id: string;
  certificateNumber: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  studentName: string;
  studentId: string;
  department: string;
  issueDate: string;
  organizerName: string;
  qrVerificationUrl: string;
}

export interface IClub {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo: string;
  coverImage?: string;
  department?: string;
  establishedYear: number;
  presidentName: string;
  presidentEmail: string;
  contactEmail: string;
  memberCount: number;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  status: 'active' | 'inactive';
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'registration' | 'reminder' | 'approval' | 'announcement' | 'certificate' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IFeedback {
  _id: string;
  eventId: string;
  userId: string;
  userName: string;
  studentId: string;
  rating: number;
  organizationRating: number;
  speakerRating: number;
  venueRating: number;
  comment: string;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
