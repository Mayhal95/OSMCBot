import type { ChurchAttendanceRecord, ChurchAttendanceSummary } from './schema.js';

export function summarizeChurchAttendance(
  records: ChurchAttendanceRecord[],
): ChurchAttendanceSummary {
  let present = 0;
  let absent = 0;
  let excused = 0;
  let late = 0;

  for (const record of records) {
    switch (record.status.trim().toLowerCase()) {
      case 'present':
        present += 1;
        break;
      case 'absent':
        absent += 1;
        break;
      case 'excused':
        excused += 1;
        break;
      case 'late':
        late += 1;
        break;
    }
  }

  const attended = present + late;
  const counted = attended + absent;
  return {
    total: records.length,
    counted,
    attended,
    present,
    absent,
    excused,
    late,
    attendanceRate: counted ? Math.round((attended / counted) * 100) : null,
    recent: [...records]
      .reverse()
      .sort((left, right) => right.meetingDate.localeCompare(left.meetingDate))
      .slice(0, 3),
  };
}
