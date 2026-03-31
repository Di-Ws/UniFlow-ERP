export function calculateAverage(student: any): number {

    return (

        student.math +

        student.science +

        student.english

    ) / 3;

}



export function subjectAverage(students: any[]) {

    if (students.length === 0) {

        return {

            math: 0,

            science: 0,

            english: 0

        };

    }

    const total = students.reduce(

        (sum, s) => {

            sum.math += s.math;

            sum.science += s.science;

            sum.english += s.english;

            return sum;

        },

        {

            math: 0,

            science: 0,

            english: 0

        }

    );



    return {

        math: total.math / students.length,

        science: total.science / students.length,

        english: total.english / students.length

    };

}