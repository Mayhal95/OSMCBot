import { describe, expect, it } from 'vitest';

import { summarizeChurchAttendance } from '../../src/database/attendance.js';

describe('church attendance summaries', () => {
  it('counts present and late as attended while excluding excused meetings from the rate', () => {
    const summary = summarizeChurchAttendance([
      { meetingId: 'CHURCH-1', meetingDate: '2026-09-01', status: 'Present' },
      { meetingId: 'CHURCH-2', meetingDate: '2026-09-08', status: 'Late' },
      { meetingId: 'CHURCH-3', meetingDate: '2026-09-15', status: 'Absent' },
      { meetingId: 'CHURCH-4', meetingDate: '2026-09-22', status: 'Excused' },
    ]);

    expect(summary).toMatchObject({
      total: 4,
      counted: 3,
      attended: 2,
      present: 1,
      late: 1,
      absent: 1,
      excused: 1,
      attendanceRate: 67,
    });
  });

  it('returns the three newest meetings first', () => {
    const summary = summarizeChurchAttendance([
      { meetingId: 'CHURCH-1', meetingDate: '2026-09-01', status: 'Present' },
      { meetingId: 'CHURCH-3', meetingDate: '2026-09-22', status: 'Absent' },
      { meetingId: 'CHURCH-2', meetingDate: '2026-09-15', status: 'Present' },
      { meetingId: 'CHURCH-4', meetingDate: '2026-09-29', status: 'Late' },
    ]);

    expect(summary.recent.map((record) => record.meetingId)).toEqual([
      'CHURCH-4',
      'CHURCH-3',
      'CHURCH-2',
    ]);
  });
});
