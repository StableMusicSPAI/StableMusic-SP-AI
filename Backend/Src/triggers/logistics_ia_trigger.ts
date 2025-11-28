// backend/src/triggers/logistics_ia_trigger.ts (Adaptado para Firebase)

import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios'; // Se necesita para hacer la llamada al motor de IA externo
import { PodOrderDocument } from '../database/models';

const db = getFirestore();

// URL de la API del IA Engine (desplegada en Cloud Run o en otra Cloud Function Python/FastAPI)
const IA_LOGISTICS_API_URL = process.env.IA_LOGISTICS_API_URL || 'https://your-ia-engine-url/logistics/optimize_order';

/**
 * Cloud Function Trigger: Se activa al crear un nuevo documento en la colección 'pod_orders'.
 * Inicia el proceso de optimización logística mediante la IA.
 */
export const optimizePodOrder = functions.firestore
    .document('pod_orders/{orderId}')
    .onCreate(async (snap, context) => {
        const orderId = context.params.orderId;
        const orderData = snap.data() as PodOrderDocument;

        console.log(`[IA Trigger] Nuevo pedido POD detectado: ${orderId}`);

        // La dirección de envío se asume que contiene el código postal
        const destinationZip = (orderData.shipping_address as any).zip_code || 'N/A';
        
        // 1. Preparar la solicitud para el motor de IA (Python/FastAPI)
        const iaRequestPayload = {
            order_id: orderId,
            destination_zip: destinationZip,
            product_type: 'Vinyl POD'
        };

        try {
            // 2. Llamar a la API del IA Engine
            const iaResponse = await axios.post(IA_LOGISTICS_API_URL, iaRequestPayload);
            const iaSolution = iaResponse.data; // Esperamos { selected_provider, estimated_delivery_eta }

            // 3. Actualizar el documento del pedido en Firestore con la solución de la IA
            await db.collection('pod_orders').doc(orderId).update({
                provider_id: iaSolution.selected_provider,
                estimated_delivery_eta: iaSolution.estimated_delivery_eta,
                status: 'processing',
            });

            console.log(`[IA Trigger] Pedido ${orderId} optimizado. Proveedor: ${iaSolution.selected_provider}`);

        } catch (error) {
            console.error(`[IA Trigger] ERROR al llamar al motor de IA para el pedido ${orderId}:`, error);
            
            // Opcional: Marcar el pedido como 'ia_failed' para revisión manual
            await db.collection('pod_orders').doc(orderId).update({
                status: 'ia_optimization_failed',
                provider_id: 'manual_review',
            });
        }
        
        return null;
    });
