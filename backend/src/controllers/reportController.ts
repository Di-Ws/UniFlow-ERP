import { Request, Response } from "express";
import { prisma } from "../config/db";

export const addReport = async (req: Request, res: Response) => {
  try {
    const report = await prisma.academicReport.create({
      data: req.body
    });
    res.status(201).json(report);
  } catch (error: any) {
    res.status(400).json({ message: "Error adding report", error: error.message });
  }
};

export const getReportBystudentId = async (req: Request, res: Response) => {
  try {
    const reports = await prisma.academicReport.findMany({
      where: { studentId: Number(req.params.studentId) }
    });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};
