export interface MissingCase {
  id: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  relation: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  lastSeenTime: string;
  clothesDescription: string;
  physicalMarks: string;
  contactNumber: string;
  email: string;
  photoUrl?: string;
  reportedDate: string;
  status: "active" | "found" | "cold";
  priority: "high" | "medium" | "low";
  updates: TimelineUpdate[];
  rewardAmount?: number;
  socialMediaLinks?: string;
  healthNotes?: string;
  lastOnlineActivity?: string;
  recoveredBelongings?: string;
  knownRoutes?: string;
  communityContacts?: string;
  cctvFootageInfo?: string;
  qrCodeLink?: string;
}

export interface TimelineUpdate {
  date: string;
  description: string;
  type: "reported" | "sighting" | "alert" | "found";
}

export interface Volunteer {
  name: string;
  area: string;
  phone: string;
  role: string;
}
