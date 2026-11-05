import { NextFunction, Request, Response } from 'express';
import SolicitudesModel from '../models/Solicitudes';
import mongoose from 'mongoose';
import SolicitudesService from '../services/SolicitudesService';

const createSolicitud = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activity_id, solicitudes, comments } = req.body;
        const user_id = (req as any).token?._id;

        const nuevaSolicitud = new SolicitudesModel({
            _id: new mongoose.Types.ObjectId(),
            user_id,
            activity_id,
            solicitudes,
            status: 'PENDIENTE',
            comments,
            deleted: false
        });
        
        const saved = await nuevaSolicitud.save();
        return res.status(201).json({ solicitud: saved });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getSolicitudById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const solicitud = await SolicitudesModel.findOne({ _id: id, deleted: false })
            .populate('user_id', 'name email')
            .populate('activity_id', 'name description');

        if (!solicitud) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        return res.status(200).json({ solicitud });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllSolicitudes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search as string;

        const filter: any = { deleted: false };

        if (search) {
            filter.comments = { $regex: search, $options: 'i' };
        }

        const totalDocuments = await SolicitudesModel.countDocuments(filter);
        const totalPages = Math.ceil(totalDocuments / limit) || 1;

        const data = await SolicitudesModel.find(filter)
            .populate('user_id', 'name email')
            .populate('activity_id', 'name description')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({
            data,
            totalDocuments,
            totalPages,
            currentPage: page,
            limit
        });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { status } = req.body; 

        const updated = await SolicitudesModel.findOneAndUpdate(
            { _id: id, deleted: false },
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        return res.status(200).json({ solicitud: updated });
    } catch (error) {
        next(error);
    }
};

const softDeleteSolicitud = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const tokenPayload = (req as any).token || (req as any).user;
    const userId = tokenPayload?._id;
    const userRole = tokenPayload?.role;

    try {
        const result = await SolicitudesService.softDeleteSolicitudService(id, userId, userRole);
        if (result) {
            return res.status(204).send(); 
        } else {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }
    } catch (error: any) {
      
        if (error.status === 403) {
            return res.status(403).json({ message: error.message });
        }
        next(error);
    }
};

const hardDeleteSolicitud = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const tokenPayload = (req as any).token || (req as any).user;
    const userId = tokenPayload?._id;
    const userRole = tokenPayload?.role;

    try {
        const result = await SolicitudesService.hardDeleteSolicitudService(id, userId, userRole);
        if (result) {
            return res.status(204).send();
        } else {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }
    } catch (error: any) {
        if (error.status === 403) {
            return res.status(403).json({ message: error.message });
        }
        next(error);
    }
};

export default {
    createSolicitud,
    getSolicitudById,
    updateStatus,
    softDeleteSolicitud,
    hardDeleteSolicitud,
    readAllSolicitudes,
};