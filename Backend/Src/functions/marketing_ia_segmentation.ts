// backend/src/functions/marketing_ia_segmentation.ts

import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios'; 

const db = getFirestore();

// URL de la API del IA Engine para Marketing
const IA_MARKETING_API_URL = process.env.IA_MARKETING_API_URL || 'https://your-ia-engine-url/marketing/predict_propensity';

// ----------------------------------------------------
// 1. Tipos de Datos
// ----------------------------------------------------

// Datos que se envían al motor de IA para la predicción
interface MarketingDataPayload {
    user_id: string;
    listening_history: string[]; // IDs de tracks escuchados
    demographics: object; // Datos básicos del usuario (ej. edad, país)
}

// Datos que devuelve el motor de IA
interface MarketingPredictionResponse {
    user_id: string;
    propensity_to_subscribe: number; // 0.0 a 1.0 (CLTV)
    ad_segment: string;               // Segmento: 'High_Value_Buyer', 'Standard_Lead', etc.
}

// ----------------------------------------------------
// 2. Función de Segmentación Programada
// ----------------------------------------------------

/**
 * Cloud Function programada para segmentar a los usuarios gratuitos y calcular su propensión.
 * Ejecución: Una vez al día (configurable).
 */
export const runDailySegmentation = functions.pubsub.schedule('0 4 * * *').timeZone('Europe/Madrid')
    .onRun(async (context) => {
        console.log('[IA Marketing] Iniciando proceso de segmentación diaria...');
        
        // 1. Obtener a todos los usuarios que NO son suscriptores premium
        const freeUsersSnapshot = await db.collection('users')
            .where('is_premium', '!=', true)
            .limit(1000) // Procesar en lotes para evitar time-outs
            .get();

        const segmentationPromises: Promise<any>[] = [];

        freeUsersSnapshot.forEach(doc => {
            const userData = doc.data();
            const uid = doc.id;
            
            // Lógica Placeholder: Obtener el historial de escucha (idealmente de otra colección 'listen_events')
            const mockHistory = ['track_a', 'track_b']; 
            
            const payload: MarketingDataPayload = {
                user_id: uid,
                listening_history: mockHistory,
                demographics: { country: userData.country || 'ES' }
            };

            // 2. Ejecutar la llamada a la IA de Marketing para cada usuario
            const promise = axios.post(IA_MARKETING_API_URL, payload)
                .then(async (response) => {
                    const prediction: MarketingPredictionResponse = response.data;
                    
                    // 3. Actualizar el perfil del usuario en Firestore con la predicción de la IA
                    await db.collection('users').doc(uid).update({
                        propensity_score: prediction.propensity_to_subscribe,
                        ad_segment: prediction.ad_segment,
                        segmentation_date: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`[IA Marketing] Usuario ${uid} segmentado como: ${prediction.ad_segment}`);
                })
                .catch(error => {
                    console.error(`Error al segmentar usuario ${uid}:`, error.message);
                });
            
            segmentationPromises.push(promise);
        });

        await Promise.allSettled(segmentationPromises);
        console.log('[IA Marketing] Proceso de segmentación diaria finalizado.');
        return null;
    });
