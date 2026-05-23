import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const markBulkAttendance = async (req: AuthRequest, res: Response) => {
  const { records } = req.body; // Expecting { records: [{ studentId, courseId, date, period, status }, ...] }
  const userId = req.userId;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'Invalid records provided.' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    // Resolve facultyId from userId
    const faculty = await prisma.faculty.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty profile not found for this user.' });
    }

    const facultyId = faculty.id;

    // Process in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        // Enforce fee status check (block attendance if unpaid and not permitted)
        const student = await tx.student.findUnique({
          where: { id: record.studentId },
          select: { name: true, feeStatus: true, feePermitted: true }
        });

        if (student && student.feeStatus !== 'Paid' && !student.feePermitted) {
          throw new Error(`Attendance block active for ${student.name}. Fees are unpaid and no HOD permission exists.`);
        }

        // Delete existing record for same student, date, and period to prevent duplicates
        // We use deleteMany to avoid 404 if it doesn't exist
        await tx.attendance.deleteMany({
          where: {
            studentId: record.studentId,
            date: new Date(record.date),
            period: record.period || null,
          }
        });
      }

      // Bulk create new records
      await tx.attendance.createMany({
        data: records.map((r: any) => ({
          studentId: r.studentId,
          facultyId: facultyId,
          courseId: r.courseId || null,
          date: new Date(r.date),
          period: r.period || null,
          status: r.status,
        }))
      });
    });

    res.status(201).json({ message: 'Attendance marked successfully.' });
  } catch (error: any) {
    console.error('Bulk Attendance Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
