import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getStrategicSummary = async (req: AuthRequest, res: Response) => {
  try {
    let { departmentName } = req.query; // e.g., "ECE"

    if (!departmentName) {
      // Try to find the department managed by this HOD
      const dept = await prisma.department.findFirst({
        where: { hodId: req.userId }
      });
      if (dept) {
        departmentName = dept.name;
      } else {
        return res.status(400).json({ message: "Department name is required" });
      }
    }

    // 1. Syllabus Mapping & Curriculum Readiness (Using Self-Relation)
    const courses = await prisma.course.findMany({
      where: { 
        department: { 
          name: { contains: departmentName as string }
        } 
      },
      include: {
        // @ts-ignore
        prerequisites: true,
        faculty: true
      }
    });
    
    // Resource Allocation & Workload Audit
    const unassignedCourses = courses.filter(c => c.faculty.length === 0);
    const facultyWorkload: Record<number, { name: string, count: number }> = {};
    
    courses.forEach(c => {
      c.faculty.forEach(f => {
        if (!facultyWorkload[f.id]) facultyWorkload[f.id] = { name: f.name, count: 0 };
        facultyWorkload[f.id].count++;
      });
    });

    const overloadedFaculty = Object.values(facultyWorkload).filter(f => f.count > 3);

    // Semester Mapping & Credit Audit
    const semesterData: Record<number, { count: number, credits: number }> = {};
    for (let i = 1; i <= 8; i++) semesterData[i] = { count: 0, credits: 0 };
    
    courses.forEach(c => {
      // @ts-ignore
      if (c.semester >= 1 && c.semester <= 8) {
        // @ts-ignore
        semesterData[c.semester].count++;
        // @ts-ignore
        semesterData[c.semester].credits += c.credits;
      }
    });

    // An orphaned course is one that has no prerequisites defined (and is not a Semester 1 course)
    // @ts-ignore
    const orphanedCourses = courses.filter(c => c.semester > 1 && c.prerequisites.length === 0);
    const readinessScore = courses.length > 0 
      ? ((courses.length - orphanedCourses.length) / courses.length) * 100 
      : 0;

    // 2. Bottleneck Identification (At-Risk Students)
    // ... (rest of queries remain same)

    // 2. Bottleneck Identification (At-Risk Students)
    const atRiskStudents = await prisma.student.findMany({
      where: {
        department: { 
          name: {
            contains: departmentName as string,
          }
        },
        OR: [
          { attendanceRate: { lt: 75 } },
          { academicReports: { some: { marks: { lt: 40 } } } }
        ]
      },
      include: {
        academicReports: true,
        user: true
      }
    });

    // 3. Approval Logic Audit (Pending students missing crucial info)
    const incompleteRegistrations = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        status: 'PENDING',
        student: {
          department: {
            name: {
              contains: departmentName as string,
            }
          },
          OR: [
            { guardianName: null },
            { guardianPhone: null },
            { nextOfKinName: null }
          ]
        }
      },
      include: { student: true }
    });

    // 4. Virtual Classroom Validation (ECE Exclusivity check)
    const invalidClassrooms = await (prisma as any).virtualClassroom.findMany({
      where: {
        departmentName: {
          contains: departmentName as string,
        },
        meetingLink: { not: { contains: 'university.edu' } } // Example validation rule
      }
    });

    // Consolidate Action Items
    const actions: any[] = [];
    
    if (readinessScore < 100) {
      actions.push({
        priority: 'High',
        task: 'Curriculum Update',
        details: `${100 - Math.round(readinessScore)}% of courses missing prerequisite mapping.`
      });
    }

    if (atRiskStudents.length > 0) {
      actions.push({
        priority: 'Urgent',
        task: 'Attendance Intervention',
        details: `${atRiskStudents.length} students falling below 75% threshold.`
      });
    }

    if (unassignedCourses.length > 0) {
      actions.push({
        priority: 'Urgent',
        task: 'Staffing Audit',
        details: `${unassignedCourses.length} courses are currently unassigned to any faculty.`
      });
    }

    if (overloadedFaculty.length > 0) {
      actions.push({
        priority: 'High',
        task: 'Workload Audit',
        details: `${overloadedFaculty.length} faculty members exceed the 3-course workload limit.`
      });
    }

    res.json({
      department: departmentName,
      curriculumReadiness: Math.round(readinessScore),
      atRiskCount: atRiskStudents.length,
      actionRequired: actions,
      validationMetrics: {
        totalCourses: courses.length,
        unassignedCourses: unassignedCourses.length,
        pendingApprovals: incompleteRegistrations.length,
        classroomIntegrity: invalidClassrooms.length === 0 ? 'Verified' : 'Issues Found',
        semesterBreakdown: semesterData
      }
    });

  } catch (error: any) {
    console.error("Strategic Analytics Error:", error);
    res.status(500).json({ 
      message: `Strategic analytics failed: ${error.message}`, 
      error: error.message 
    });
  }
};
