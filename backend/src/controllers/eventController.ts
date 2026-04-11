import { Request, Response } from "express";
import { prisma } from "../config/db";

export const addEvent = async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.create({
      data: {
        ...req.body,
        eventDate: new RegExp(/^\d{4}-\d{2}-\d{2}$/).test(req.body.eventDate) 
          ? new Date(req.body.eventDate) 
          : req.body.eventDate
      }
    });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ message: "Error adding event", error: error.message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' }
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};
