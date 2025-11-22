import { MissingCase } from "@/types/case";

export const sampleCases: MissingCase[] = [
  {
    id: "FH2024001",
    fullName: "Sarah Mitchell",
    age: 14,
    gender: "Female",
    relation: "Parent",
    lastSeenLocation: "Central Park, New York",
    lastSeenDate: "2024-01-15",
    lastSeenTime: "16:30",
    clothesDescription: "Blue denim jacket, white sneakers, black backpack",
    physicalMarks: "Small scar on left cheek",
    contactNumber: "+1-555-0123",
    email: "mitchell.family@email.com",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    reportedDate: "2024-01-15T18:00:00",
    status: "active",
    priority: "high",
    updates: [
      { date: "2024-01-15T18:00:00", description: "Case reported to authorities", type: "reported" },
      { date: "2024-01-16T10:30:00", description: "Community alert sent to 500+ volunteers", type: "alert" },
      { date: "2024-01-17T14:20:00", description: "Possible sighting near subway station", type: "sighting" }
    ]
  },
  {
    id: "FH2024002",
    fullName: "Michael Chen",
    age: 67,
    gender: "Male",
    relation: "Family Member",
    lastSeenLocation: "Downtown Hospital, Boston",
    lastSeenDate: "2024-01-10",
    lastSeenTime: "09:15",
    clothesDescription: "Gray cardigan, brown pants, walking cane",
    physicalMarks: "Wears glasses, has hearing aid",
    contactNumber: "+1-555-0456",
    email: "chen.family@email.com",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    reportedDate: "2024-01-10T12:00:00",
    status: "found",
    priority: "high",
    updates: [
      { date: "2024-01-10T12:00:00", description: "Case reported, senior citizen", type: "reported" },
      { date: "2024-01-10T15:30:00", description: "Community search organized", type: "alert" },
      { date: "2024-01-11T08:45:00", description: "Found safe at local community center", type: "found" }
    ]
  },
  {
    id: "FH2024003",
    fullName: "Emma Rodriguez",
    age: 16,
    gender: "Female",
    relation: "Guardian",
    lastSeenLocation: "Lincoln High School, Chicago",
    lastSeenDate: "2024-01-18",
    lastSeenTime: "15:45",
    clothesDescription: "Red hoodie, jeans, purple backpack",
    physicalMarks: "Butterfly tattoo on wrist",
    contactNumber: "+1-555-0789",
    email: "rodriguez.family@email.com",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    reportedDate: "2024-01-18T19:00:00",
    status: "active",
    priority: "high",
    updates: [
      { date: "2024-01-18T19:00:00", description: "Missing after school hours", type: "reported" },
      { date: "2024-01-19T08:00:00", description: "Alert shared across social media", type: "alert" }
    ]
  },
  {
    id: "FH2024004",
    fullName: "James Wilson",
    age: 42,
    gender: "Male",
    relation: "Friend",
    lastSeenLocation: "Mountain Trail, Colorado",
    lastSeenDate: "2024-01-05",
    lastSeenTime: "11:00",
    clothesDescription: "Green hiking jacket, brown boots, orange cap",
    physicalMarks: "Beard, tattoo on right arm",
    contactNumber: "+1-555-0234",
    email: "wilson.search@email.com",
    reportedDate: "2024-01-05T20:00:00",
    status: "cold",
    priority: "medium",
    updates: [
      { date: "2024-01-05T20:00:00", description: "Failed to return from hike", type: "reported" },
      { date: "2024-01-06T06:00:00", description: "Mountain rescue team deployed", type: "alert" },
      { date: "2024-01-12T10:00:00", description: "Search scaled down, case marked cold", type: "sighting" }
    ]
  },
  {
    id: "FH2024005",
    fullName: "Olivia Thompson",
    age: 8,
    gender: "Female",
    relation: "Parent",
    lastSeenLocation: "Riverside Mall, Seattle",
    lastSeenDate: "2024-01-20",
    lastSeenTime: "14:20",
    clothesDescription: "Pink dress, white shoes, carrying teddy bear",
    physicalMarks: "Curly blonde hair, gap in front teeth",
    contactNumber: "+1-555-0567",
    email: "thompson.family@email.com",
    photoUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop",
    reportedDate: "2024-01-20T15:00:00",
    status: "active",
    priority: "high",
    updates: [
      { date: "2024-01-20T15:00:00", description: "Child separated from parent at mall", type: "reported" },
      { date: "2024-01-20T15:30:00", description: "Mall security alerted, exits monitored", type: "alert" },
      { date: "2024-01-20T16:45:00", description: "Multiple sightings reported", type: "sighting" }
    ]
  },
  {
    id: "FH2024006",
    fullName: "David Kumar",
    age: 28,
    gender: "Male",
    relation: "Sibling",
    lastSeenLocation: "Tech Park, San Francisco",
    lastSeenDate: "2024-01-12",
    lastSeenTime: "18:00",
    clothesDescription: "Black suit, blue tie, messenger bag",
    physicalMarks: "Wears glasses, clean shaven",
    contactNumber: "+1-555-0890",
    email: "kumar.family@email.com",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    reportedDate: "2024-01-13T09:00:00",
    status: "active",
    priority: "medium",
    updates: [
      { date: "2024-01-13T09:00:00", description: "Did not return home from work", type: "reported" },
      { date: "2024-01-13T12:00:00", description: "Last seen leaving office building", type: "sighting" }
    ]
  }
];
