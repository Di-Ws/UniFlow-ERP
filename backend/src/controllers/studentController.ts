import * as service from "../services/studentService";

export async function createStudent(
    req: any,
    res: any
) {
    const student =
        await service.createStudent(
            req.body
        );

    res.json(student);
}

export async function getStudents(
    req: any,
    res: any
) {
    const students =
        await service.getAllStudents();

    res.json(students);
}

export async function topper(
    req: any,
    res: any
) {
    const student =
        await service.getTopStudent();

    res.json(student);
}

export async function analytics(
    req: any,
    res: any
) {
    const result =
        await service.getAnalytics();

    res.json(result);
}