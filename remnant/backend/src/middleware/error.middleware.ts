// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Вывод ошибки в консоль для отладки
  console.error(err);

  // Если заголовки уже отправлены, передаём ошибку следующему обработчику
  if (res.headersSent) {
    return next(err);
  }

  // Определяем статус ответа. Если у ошибки указан статус (например, err.statusCode), используем его,
  // иначе по умолчанию 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Формируем объект ошибки для ответа
  const errorResponse = {
    message: err.message || "Internal Server Error",
    // В режиме разработки можно возвращать стек вызовов ошибки для удобства отладки.
    // В production-режиме лучше его скрывать.
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};
