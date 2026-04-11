import { Request, Response } from "express";
import { prisma } from "../config/db";

export const addTeacher = async (req: Request, res: Response) => {
  try {
    const teacher = await prisma.teacher.create({
      data: req.body
    });
    res.status(201).json(teacher);
  } catch (error: any) {
    res.status(400).json({ message: "Error adding teacher", error: error.message });
  }
};

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany();
    res.json(teachers);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching teachers", error: error.message });
  }
};
