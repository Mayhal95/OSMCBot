import { describe, expect, it } from 'vitest';

import {
  CHURCH_ATTENDANCE_HEADERS,
  CHURCH_ATTENDANCE_STATUSES,
  CHURCH_MEETING_HEADERS,
  SHEETS,
} from '../../src/database/schema.js';

describe('church database schema', () => {
  it('uses dedicated meeting and attendance tabs', () => {
    expect(SHEETS.churchMeetings).toBe('Church Meetings');
    expect(SHEETS.churchAttendance).toBe('Church Attendance');
  });

  it('links attendance rows back to a meeting and member identity', () => {
    expect(CHURCH_MEETING_HEADERS).toContain('Meeting ID');
    expect(CHURCH_MEETING_HEADERS).toContain('Attendee Count');
    expect(CHURCH_ATTENDANCE_HEADERS).toEqual(
      expect.arrayContaining([
        'Meeting ID',
        'Discord User ID',
        'Member ID',
        'In-Game Name',
        'Rank',
        'Attendance Status',
      ]),
    );
  });

  it('supports staff attendance corrections', () => {
    expect(CHURCH_ATTENDANCE_STATUSES).toEqual(['Present', 'Absent', 'Excused', 'Late']);
  });
});
