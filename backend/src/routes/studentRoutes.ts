import express from "express";
import * as controller from "../controllers/studentController";
import { calculateResult, getClassAverage } from "../services/studentService";
import { prisma } from "../config/db";



const router =
    express.Router();



router.post(
    "/",
    controller.createStudent
);



router.get(
    "/",
    controller.getStudents
);



router.get(
    "/topper",
    controller.topper
);



router.get(
    "/analytics",
    controller.analytics
);


router.get(
    "/class-average", async(req,res)=> {
        const result = await getClassAverage();
        res.json(result);
    }
);

router.get(
    "/failed-students", async(req,res)=> {
        const students = await prisma.student.findMany();
        const failed = students.filter((s: any) => calculateResult(s).grade === 'F');
        res.json(failed);
    }

);

router.delete(
    "/:id", async(req,res)=> {
        try {
            const id =Number(req.params.id);
            const deletedStudent = await prisma.student.delete({
                where: {id}
            });
            res.json({
                message:"Student deleted Successfully",
                deletedStudent
            });  
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({
                    message: "Student not found"
                });
            } else {
                res.status(500).json({
                    message: "Error deleting student",
                    error: error.message
                });
            }
        }
    }
);


export default router;