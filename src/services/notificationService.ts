import { ParentNotification, AttendanceRecord, Student } from '../types';

export class NotificationService {
  private notifications: ParentNotification[] = [];

  constructor(initialNotifications: ParentNotification[] = []) {
    this.notifications = initialNotifications;
  }

  public getNotifications(): ParentNotification[] {
    return [...this.notifications];
  }

  /**
   * Generates a parent notification when a student's attendance is verified
   */
  public createParentAttendanceNotice(
    student: Student,
    record: AttendanceRecord,
    channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH' = 'WHATSAPP'
  ): ParentNotification {
    const statusText = record.status === 'PRESENT' ? 'PRESENT' : record.status === 'LATE' ? 'LATE' : record.status;
    const message = `SmartAttend Alert: Dear ${student.parentName}, your child ${student.name} was marked ${statusText} at ${record.timeDisplay} on ${record.date}. Verification: ${record.verificationMethod.replace(/_/g, ' ')}. Location: ${record.location}.`;

    const newNotification: ParentNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      recipientPhone: student.parentPhone,
      channel,
      message,
      status: 'DELIVERED',
      timestamp: new Date().toISOString(),
      attendanceId: record.id,
      retryCount: 0
    };

    this.notifications.unshift(newNotification);
    return newNotification;
  }

  /**
   * Retry failed notification
   */
  public retryNotification(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.status = 'DELIVERED';
      notif.retryCount += 1;
      return true;
    }
    return false;
  }
}
