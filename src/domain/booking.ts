import { Appointment } from '../types';

export interface CollisionCheckResult {
  hasCollision: boolean;
  reason?: string;
  conflictingAppointment?: Appointment;
}

/**
 * Checks for booking collision:
 * 1. Technician collision: Technician is already assigned to an ongoing service in that timeslot.
 * 2. Room/Bed collision: The specified bed is already occupied in that timeslot.
 * Includes a 10-minute turnaround sanitation buffer.
 */
export function detectBookingCollision(
  newBooking: {
    id?: string;
    staffId: string;
    bedId: string;
    startTime: string; // YYYY-MM-DDTHH:mm
    endTime: string;
  },
  existingBookings: Appointment[]
): CollisionCheckResult {
  const newStart = new Date(newBooking.startTime).getTime();
  const newEnd = new Date(newBooking.endTime).getTime();

  if (isNaN(newStart) || isNaN(newEnd) || newEnd <= newStart) {
    return { hasCollision: true, reason: 'Thời gian bắt đầu hoặc kết thúc không hợp lệ.' };
  }

  // 10 minutes buffer in ms
  const BUFFER_MS = 10 * 60 * 1000;

  for (const existing of existingBookings) {
    // Ignore self if editing, and ignore cancelled bookings
    if (existing.id === newBooking.id || existing.status === 'cancelled') {
      continue;
    }

    const exStart = new Date(existing.startTime).getTime();
    const exEnd = new Date(existing.endTime).getTime() + BUFFER_MS;

    // Check time overlap: (newStart < exEnd) && (newEnd > exStart)
    const isOverlapping = newStart < exEnd && newEnd > exStart;

    if (isOverlapping) {
      if (existing.staffId === newBooking.staffId) {
        return {
          hasCollision: true,
          reason: `Kỹ thuật viên "${existing.staffName}" đã có lịch phục vụ từ ${existing.startTime.slice(11, 16)} đến ${existing.endTime.slice(11, 16)}.`,
          conflictingAppointment: existing,
        };
      }

      if (existing.bedId === newBooking.bedId) {
        return {
          hasCollision: true,
          reason: `Giường/Phòng "${existing.bedId}" đã được xếp lịch từ ${existing.startTime.slice(11, 16)} đến ${existing.endTime.slice(11, 16)} (kèm 10 phút dọn dẹp vệ sinh).`,
          conflictingAppointment: existing,
        };
      }
    }
  }

  return { hasCollision: false };
}

