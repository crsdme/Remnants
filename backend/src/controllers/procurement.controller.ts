// import type { NextFunction, Request, Response } from 'express'
// import * as ProcurementService from '@/services/procurement.service'

// export async function get(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProcurementService.get(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function getItems(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProcurementService.getItems(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function create(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProcurementService.create(req.body, req.user)

//     res.status(201).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function edit(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProcurementService.edit(req.body, req.user)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function remove(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProcurementService.remove(req.body, req.user)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function scanBarcode(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProcurementService.scanBarcode(req.body)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }

// export async function pay(req: Request, res: Response, next: NextFunction) {
//   try {
//     const serviceResponse = await ProcurementService.payProcurement(req.body, req.user)

//     res.status(200).json(serviceResponse)
//   }
//   catch (err) {
//     next(err)
//   }
// }
