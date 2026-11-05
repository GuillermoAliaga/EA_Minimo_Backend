import SolicitudesModel from '../models/Solicitudes';

export const getAllSolicitudesPaginated = async (query: any, userRole: string) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search as string;
    const showDeleted = query.showDeleted === 'true';

    const filter: any = {};

    if (showDeleted) {
        if (userRole !== 'ADMIN') {
            throw { status: 403, message: 'No eres admin, si fueses admin podrías ver los eliminados basicamente aqui es donde se ve el soft delete' };
        }
        filter.deleted = true;
    } else {
        filter.deleted = false; 
    }

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

    return {
        data,
        totalDocuments,
        totalPages,
        currentPage: page,
        limit
    };
};

export const softDeleteSolicitudService = async (id: string, userId: string, userRole: string) => {
    const solicitud = await SolicitudesModel.findOne({ _id: id, deleted: false });
    if (!solicitud) return null;

    const isOwner = solicitud.user_id.toString() === userId?.toString();
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
        throw { status: 403, message: 'No autorizado para eliminar esta solicitud' };
    }

    solicitud.deleted = true;
    solicitud.deletedAt = new Date();
    await solicitud.save();

    return solicitud;
};

export const hardDeleteSolicitudService = async (id: string ,userId: string, userRole: string) => {
    const solicitud = await SolicitudesModel.findById(id);
    if (!solicitud) return null;

    const isOwner = solicitud.user_id.toString() === userId?.toString();
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
        throw { status: 403, message: 'No autorizado para eliminar físicamente esta solicitud' };
    }

    await SolicitudesModel.findByIdAndDelete(id);
    return true;
};

export const createSolicitudService = async (data: { user_id: string; activity_id: string; solicitudes: string; comments?: string }) => {
    const nuevaSolicitud = new SolicitudesModel({
        user_id: data.user_id,
        activity_id: data.activity_id,
        solicitudes: data.solicitudes,
        status: 'PENDIENTE', 
        comments: data.comments,
        deleted: false
    });

    return await nuevaSolicitud.save();
};
export const updateStatusService = async (id: string, status: string) => {
    const updated = await SolicitudesModel.findOneAndUpdate(
        { _id: id, deleted: false },
        { $set: { status } },
        { new: true, runValidators: true }
    );
    return updated;
};

export default {
    getAllSolicitudesPaginated,
    softDeleteSolicitudService,
    hardDeleteSolicitudService,
    createSolicitudService,
    updateStatusService
};