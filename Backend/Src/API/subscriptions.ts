// backend/src/api/subscriptions.ts (Adaptado para Firebase Cloud Functions y Stripe)

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { PodOrderDocument } from '../database/models'; // Importamos la interfaz

const db = getFirestore();
// Inicializa Stripe (clave de API debe estar en las variables de entorno de Cloud Functions)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2020-08-27', // Usar una versión estable
});

// ----------------------------------------------------
// 1. Endpoint: Crear Suscripción (Checkout)
// ----------------------------------------------------

/**
 * @route POST /api/v1/subscriptions/create_checkout_session
 * Crea una sesión de checkout de Stripe para una nueva suscripción.
 */
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
    // 1. Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'El usuario debe iniciar sesión.');
    }
    const uid = context.auth.uid;
    const { price_id } = data; // ID del precio de Stripe (e.g., plan mensual)

    try {
        // 2. Crear la sesión de Checkout
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: price_id, quantity: 1 }],
            client_reference_id: uid, // Vincula la sesión a nuestro UID de Firebase
            success_url: 'https://stablemusic.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://stablemusic.com/cancel',
        });

        return { sessionId: session.id };

    } catch (error) {
        console.error('Error al crear la sesión de Stripe:', error);
        throw new functions.https.HttpsError('internal', 'No se pudo crear la sesión de pago.', error);
    }
});

// ----------------------------------------------------
// 2. Endpoint: Webhook de Stripe (Actualización del Suscriptor)
// ----------------------------------------------------

/**
 * @route POST /api/v1/subscriptions/stripe_webhook
 * Maneja eventos de Stripe (e.g., pago exitoso de la suscripción).
 */
export const stripeWebhook = functions.https.onRequest(async (request, response) => {
    // Lógica para verificar la firma del Webhook (crucial para la seguridad)
    // ... (Omitido por brevedad)

    const event = request.body;
    
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        const subscriptionId = session.subscription as string;

        if (uid) {
            // Actualizar el documento del usuario en Firestore
            await db.collection('users').doc(uid).update({
                subscription_plan_id: subscriptionId,
                is_premium: true, // Nuevo campo para control rápido
            });
            console.log(`Usuario ${uid} actualizado a suscriptor premium.`);
        }
    }
    
    // Devolver una respuesta 200 a Stripe
    response.send({ received: true });
});

// ----------------------------------------------------
// 3. Endpoint: Pedido de Vinilo POD (La Característica Única)
// ----------------------------------------------------

/**
 * @route POST /api/v1/subscriptions/order_pod_vinyl
 * Permite a los suscriptores pedir un Vinilo POD a coste real.
 */
export const orderPodVinyl = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'El usuario debe iniciar sesión.');
    }
    const uid = context.auth.uid;
    const { track_id, shipping_address } = data;
    
    // 1. Verificar que el usuario es Premium
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    if (!userData || !userData.is_premium) {
        throw new functions.https.HttpsError('permission-denied', 'Esta función solo está disponible para suscriptores Premium.');
    }

    // 2. Crear el Pedido POD en Firestore
    const orderData: PodOrderDocument = {
        user_uid: uid,
        track_id: track_id,
        status: 'pending',
        cost_euro: -18.00, // Precio único a coste real (Diferenciación de Costes)
        shipping_address: shipping_address,
        tracking_number: null,
        provider_id: 'pending_ia_optimization', // La IA Logística lo actualizará después
        ordered_at: admin.firestore.Timestamp.now(),
    };

    await db.collection('pod_orders').add(orderData);
    
    // 3. (Trigger IA Logística) – Se puede usar un Cloud Function Trigger
    // al crear un documento en la colección 'pod_orders' para iniciar el proceso de IA.
    
    return { success: true, message: `Pedido POD registrado con coste: ${orderData.cost_euro}€` };
});
