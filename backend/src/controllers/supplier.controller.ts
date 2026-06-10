// import type { NextFunction, Request, Response } from 'express'
// import * as SupplierService from '@/services/supplier.service'

// export async function get(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await SupplierService.get(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function create(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await SupplierService.create(req.body)

//     res.status(201).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function edit(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await SupplierService.edit(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function remove(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await SupplierService.remove(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }
