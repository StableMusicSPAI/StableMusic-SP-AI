// backend/src/api/tracks.ts (Adaptado para Firebase Cloud Functions)

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { TrackDocument } from '../database/models'; // Importamos la interfaz de datos

const db = getFirestore();
const storage = getStorage();
const BUCKET_NAME = 'stablemusicspai-b8dff.appspot.com'; // Nombre de tu bucket

// ----------------------------------------------------
// Middleware para verificar el Rol de Artista
// ----------------------------------------------------

// Función para verificar si el usuario autenticado tiene el rol de 'artist'
const isArtist = async (request: functions.https.Request, response: functions.Response, next: () => void) => {
    // La autenticación ya está manejada por Firebase Auth
    const idToken = request.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        response.status(401).send({ message: 'No se proporcionó token de autenticación.' });
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Verifica el Custom Claim 'role' establecido durante el registro
        if (decodedToken.role !== 'artist') {
            response.status(403).send({ message: 'Acceso denegado. Se requiere rol de Artista.' });
            return;
        }
        // Adjunta el UID del artista al request para usarlo en la función principal
        (request as any).artistUid = decodedToken.uid; 
        next();
    } catch (error) {
        response.status(401).send({ message: 'Token inválido o expirado.' });
    }
};


// ----------------------------------------------------
// 1. Endpoint: Subir Metadatos de una Pista
// ----------------------------------------------------

/**
 * @route POST /api/v1/tracks/upload_metadata
 * Registra la metadata de una pista y obtiene una URL firmada para subir el archivo de audio.
 */
export const uploadMetadata = functions.https.onRequest(async (request, response) => {
    await isArtist(request, response, async () => {
        if (request.method !== 'POST') {
            response.status(405).send({ message: 'Método no permitido.' });
            return;
        }

        const artistUid = (request as any).artistUid;
        const { title, duration_ms, is_ai_generated, royalty_rate } = request.body;

        try {
            // 1. Crear el documento Track en Firestore
            const newTrackRef = db.collection('tracks').doc();
            const trackId = newTrackRef.id;
            
            // 2. Definir la ruta del archivo de audio en Cloud Storage
            const storagePath = `tracks/${artistUid}/${trackId}.mp3`;
            
            const trackData: TrackDocument = {
                artist_uid: artistUid,
                title,
                duration_ms: parseInt(duration_ms),
                storage_path: storagePath,
                is_ai_generated: !!is_ai_generated, // Para diferenciar AN de AIA (clave para el modelo de negocio)
                royalty_rate: parseFloat(royalty_rate) || 0.05,
                created_at: admin.firestore.Timestamp.now(),
                total_streams: 0
            };
            
            await newTrackRef.set(trackData);

            // 3. Generar una URL firmada para la subida directa del archivo de audio por el cliente
            const [uploadUrl] = await storage.bucket(BUCKET_NAME).file(storagePath).getSignedUrl({
                action: 'write',
                expires: Date.now() + 15 * 60 * 1000, // 15 minutos
                contentType: 'audio/mpeg',
            });
            
            response.status(201).send({ 
                track_id: trackId,
                upload_url: uploadUrl,
                message: 'Metadatos registrados. Utilice la URL firmada para subir el archivo de audio.'
            });

        } catch (error) {
            console.error('Error al registrar metadatos:', error);
            response.status(500).send({ message: 'Error al procesar la subida de metadatos.' });
        }
    });
});


// ----------------------------------------------------
// 2. Endpoint: Obtener URL de Streaming
// ----------------------------------------------------

/**
 * @route GET /api/v1/tracks/stream?trackId=...
 * Proporciona una URL de acceso temporal para reproducir la pista.
 */
export const getStreamUrl = functions.https.onRequest(async (request, response) => {
    const trackId = request.query.trackId as string;
    
    if (!trackId) {
        response.status(400).send({ message: 'ID de pista requerido.' });
        return;
    }

    try {
        const trackDoc = await db.collection('tracks').doc(trackId).get();
        if (!trackDoc.exists) {
            response.status(404).send({ message: 'Pista no encontrada.' });
            return;
        }

        const trackData = trackDoc.data() as TrackDocument;

        // Generar una URL de lectura firmada (acceso temporal)
        const [streamUrl] = await storage.bucket(BUCKET_NAME).file(trackData.storage_path).getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hora de validez
        });
        
        response.status(200).send({ 
            stream_url: streamUrl,
            metadata: { title: trackData.title, artist_uid: trackData.artist_uid }
        });

        // NOTA: La actualización del contador de reproducciones (total_streams) y el registro
        // de datos para calcular royalties se haría idealmente con una Cloud Function
        // que se active por un evento de log o un webhook del reproductor.

    } catch (error) {
        console.error('Error al obtener URL de streaming:', error);
        response.status(500).send({ message: 'Error interno del servidor.' });
    }
});
