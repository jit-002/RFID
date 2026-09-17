import { AttendanceStatus, AttendanceRuleConfig, AttendanceRecord } from '../types';

export class AttendanceEngine {
  private config: AttendanceRuleConfig;

  constructor(config: AttendanceRuleConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: Partial<AttendanceRuleConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): AttendanceRuleConfig {
    return this.config;
  }

  /**
   * Evaluates check-in time against configured thresholds.
   * Physical verified check-in presence should NEVER be marked ABSENT.
   */
  public evaluateStatus(checkInDate: Date = new Date(), isVerifiedPresence = true): AttendanceStatus {
    const hours = checkInDate.getHours();
    const minutes = checkInDate.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const [startH, startM] = this.config.startTime.split(':').map(Number);
    const [lateH, lateM] = this.config.lateThreshold.split(':').map(Number);
    const [halfH, halfM] = this.config.halfDayThreshold.split(':').map(Number);

    const lateMinutes = lateH * 60 + lateM + this.config.gracePeriodMinutes;
    const halfDayMinutes = halfH * 60 + halfM;

    if (isVerifiedPresence) {
      if (currentMinutes > halfDayMinutes) {
        return 'HALF_DAY';
      } else if (currentMinutes > lateMinutes) {
        return 'LATE';
      }
      return 'PRESENT';
    }

    return 'ABSENT';
  }

  /**
   * Generates calendar days for a given month with attendance state.
   * - Saturday is a regular working day (only Sunday is a weekend holiday).
   * - If zero RFID scans are recorded campus-wide on an elapsed working day, it is marked as HOLIDAY.
   */
  public getMonthlyCalendarData(
    year: number,
    month: number,
    studentId: string,
    attendanceRecords: AttendanceRecord[] = []
  ) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay();
      // Only Sunday is weekend; Saturday is an instructional working day at Pranabananda Vidyamandir
      const isWeekend = dayOfWeek === 0;
      const isFuture = dateObj > today;
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Check campus-wide RFID activity for this date
      const campusScansOnDate = attendanceRecords.filter(a => a.date === dateString).length;

      // Check student-specific attendance record
      const studentRec = attendanceRecords.find(
        a => (a.personId === studentId || (a.attendanceId && a.attendanceId.includes(studentId))) && a.date === dateString
      );

      let status: AttendanceStatus = 'PRESENT';
      let checkInTime: string | undefined = undefined;
      let holidayReason: string | undefined = undefined;

      if (isWeekend) {
        status = 'HOLIDAY';
        holidayReason = 'Sunday (Weekly Holiday)';
      } else if (isFuture) {
        status = 'UNKNOWN' as any;
      } else if (studentRec) {
        // Direct verified scan found for this student
        status = studentRec.status;
        checkInTime = studentRec.timeDisplay;
      } else {
        // No attendance conducted or recorded on this day (not a fake holiday)
        status = 'NOT_RECORDED' as any;
        checkInTime = undefined;
        holidayReason = undefined;
      }

      days.push({
        day,
        dateString,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        isWeekend,
        isFuture,
        status,
        checkInTime,
        holidayReason
      });
    }

    return days;
  }
}
