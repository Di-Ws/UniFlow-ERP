"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = exports.addEvent = void 0;
const db_1 = require("../config/db");
const addEvent = async (req, res) => {
    try {
        const event = await db_1.prisma.event.create({
            data: {
                ...req.body,
                eventDate: new RegExp(/^\d{4}-\d{2}-\d{2}$/).test(req.body.eventDate)
                    ? new Date(req.body.eventDate)
                    : req.body.eventDate
            }
        });
        res.status(201).json(event);
    }
    catch (error) {
        res.status(400).json({ message: "Error adding event", error: error.message });
    }
};
exports.addEvent = addEvent;
const getEvents = async (req, res) => {
    try {
        const events = await db_1.prisma.event.findMany({
            orderBy: { eventDate: 'asc' }
        });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};
exports.getEvents = getEvents;
