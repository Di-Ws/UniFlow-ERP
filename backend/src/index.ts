import app from "./app";

// Handle global unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle global uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
});

const PORT = process.env.PORT || 5000;



app.listen(

    PORT,

    () => {

        console.log(

            `Server running on port ${PORT}`

        );

    }
/**/
);
