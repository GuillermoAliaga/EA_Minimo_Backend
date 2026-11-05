import mongoose, { Document, Schema } from 'mongoose';

export type SolicitudesType = 'RESERVA' | 'PETICION';
export type SolicitudesStatus = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

export interface ISolicitudes {
    user_id: mongoose.Types.ObjectId | string;
    activity_id: mongoose.Types.ObjectId | string;
    solicitudes: SolicitudesType;
    status: SolicitudesStatus;
    comments?: string;
    deleted: boolean;
}

export interface ISolicitudesModel extends ISolicitudes, Document {
    createdAt: Date;
    deletedAt?: Date;
}

const SolicitudesSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        activity_id: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
        solicitudes: { type: String, enum: ['RESERVA', 'PETICION'], required: true },
        status: { type: String, enum: ['PENDIENTE', 'ACEPTADA', 'RECHAZADA'], default: 'PENDIENTE' },
        comments: { type: String },
        deleted: { type: Boolean, default: false }
    },
    { timestamps: true,
     versionKey: false
    }
);

export default mongoose.model<ISolicitudesModel>('Solicitudes', SolicitudesSchema);