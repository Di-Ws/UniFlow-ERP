import express from "express";
import studentRoutes from "./routes/studentRoutes";



const app =

    express();



app.use(

    express.json()

);



app.use(

    "/students",

    studentRoutes

);



export default app;