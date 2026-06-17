import { Request, Response, NextFunction } from 'express'
import { stylistsService } from './stylists.service'

const h = (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  try { await fn(req, res) } catch (err) { next(err) }
}

export const stylistsController = {
  // ── Public ────────────────────────────────────────────────────────────────

  list: h(async (req: Request, res: Response) => {
    const { specialty, search, page, limit } = req.query as Record<string, string>
    res.json(await stylistsService.list({ specialty, search, page: Number(page) || 1, limit: Number(limit) || 12 }))
  }),

  getById: h(async (req: Request, res: Response) => {
    res.json(await stylistsService.getById(req.params.id))
  }),

  getAvailability: h(async (req: Request, res: Response) => {
    res.json(await stylistsService.getAvailability(req.params.id))
  }),

  getSlots: h(async (req: Request, res: Response) => {
    const { date, duration } = req.query as Record<string, string>
    if (!date) return res.status(400).json({ message: 'date query param required (YYYY-MM-DD)' })
    const slots = await stylistsService.getAvailableSlots(req.params.id, date, Number(duration) || 60)
    res.json(slots)
  }),

  // ── Stylist portal (own profile) ──────────────────────────────────────────

  getMyProfile: h(async (req: Request, res: Response) => {
    res.json(await stylistsService.getMyProfile(req.user.sub))
  }),

  updateMyProfile: h(async (req: Request, res: Response) => {
    res.json(await stylistsService.updateMyProfile(req.user.sub, req.body))
  }),

  setMyAvailability: h(async (req: Request, res: Response) => {
    res.json(await stylistsService.setMyAvailability(req.user.sub, req.body.slots))
  }),

  setMyServices: h(async (req: Request, res: Response) => {
    res.json(await stylistsService.setMyServices(req.user.sub, req.body.services))
  }),

  // ── Admin ─────────────────────────────────────────────────────────────────

  adminList: h(async (_req: Request, res: Response) => {
    res.json(await stylistsService.adminList())
  }),

  createProfile: h(async (req: Request, res: Response) => {
    res.status(201).json(await stylistsService.createProfile(req.body.userId))
  }),

  toggleAvailability: h(async (req: Request, res: Response) => {
    res.json(await stylistsService.toggleAvailability(req.params.id))
  }),
}
