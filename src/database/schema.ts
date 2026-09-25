export const SHEETS = {
  members: 'Members',
  ranks: 'Ranks',
  notes: 'Member Notes',
  audit: 'Audit Log',
} as const;

export const MEMBER_HEADERS = [
  'Member ID',
  'Discord User ID',
  'Discord Username',
  'In-Game Name',
  'Rank',
  'Status',
  'Club Join Date',
  'Discord Server Joined At',
  'Registered At',
  'Registered By Discord ID',
  'Registered By Username',
  'Updated At',
  'Updated By Discord ID',
  'Updated By Username',
] as const;

export const RANK_HEADERS = ['Rank', 'Level', 'Discord Role ID', 'Active', 'Notes'] as const;

export const NOTE_HEADERS = [
  'Note ID',
  'Member ID',
  'Discord User ID',
  'Category',
  'Note',
  'Created At',
  'Author Discord ID',
  'Author Username',
] as const;

export const AUDIT_HEADERS = [
  'Event ID',
  'Timestamp',
  'Action',
  'Member ID',
  'Actor Discord ID',
  'Actor Username',
  'Field',
  'Previous Value',
  'New Value',
] as const;

export const MEMBER_STATUSES = [
  'Active',
  'Prospect',
  'Leave',
  'Suspended',
  'Retired',
  'Removed',
] as const;

export const NOTE_CATEGORIES = [
  'General',
  'Attendance',
  'Conduct',
  'Promotion',
  'Disciplinary',
] as const;

export interface MemberRecord {
  rowNumber: number;
  memberId: string;
  discordUserId: string;
  discordUsername: string;
  inGameName: string;
  rank: string;
  status: string;
  clubJoinDate: string;
  discordServerJoinedAt: string;
  registeredAt: string;
  registeredByDiscordId: string;
  registeredByUsername: string;
  updatedAt: string;
  updatedByDiscordId: string;
  updatedByUsername: string;
}

export interface MemberNote {
  noteId: string;
  memberId: string;
  discordUserId: string;
  category: string;
  note: string;
  createdAt: string;
  authorDiscordId: string;
  authorUsername: string;
}

export interface RankMapping {
  rank: string;
  level: number;
  discordRoleId: string;
  active: boolean;
  notes: string;
}
