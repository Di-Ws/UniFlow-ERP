import { Request,
Response,
NextFunction
} from "express";

import jwt from "jsonwebtoken";

const JWT_SECRET = "secret123";

export const verifyToken =
(
  req: any,
  res: Response,
  next: NextFunction
) => {

  const authHeader =
    req.headers.authorization;

  if(!authHeader){

    return res.status(401).json({
      message: "No token"
    });

  }

  const token =
    authHeader.split(" ")[1];

  try{

    const decoded: any =
      jwt.verify(
        token,
        JWT_SECRET
      );

    req.userId =
      decoded.id;

    next();

  }
  catch{

    res.status(401).json({
      message: "Invalid token"
    });

  }

};