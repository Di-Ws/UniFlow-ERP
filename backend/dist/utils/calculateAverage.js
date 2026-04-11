"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAverage = calculateAverage;
exports.subjectAverage = subjectAverage;
function calculateAverage(student) {
    return (student.math +
        student.science +
        student.english) / 3;
}
function subjectAverage(students) {
    if (students.length === 0) {
        return {
            math: 0,
            science: 0,
            english: 0
        };
    }
    const total = students.reduce((sum, s) => {
        sum.math += s.math;
        sum.science += s.science;
        sum.english += s.english;
        return sum;
    }, {
        math: 0,
        science: 0,
        english: 0
    });
    return {
        math: total.math / students.length,
        science: total.science / students.length,
        english: total.english / students.length
    };
}
