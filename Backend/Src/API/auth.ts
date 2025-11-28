// backend/src/api/auth.ts
 (Adaptado para Firebase)

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'; // Para acceder a Firestore
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Inicialización de la aplicación de Firebase (asume que ya está configurada)
// Nota: En Cloud Functions, admin.initializeApp() se llama automáticamente.

// Referencias a los servicios
const auth = getAuth();
const db = getFirestore();

interface RegisterBody {
    email: string;
    password: string;
    is_artist: boolean; // Flag para diferenciar Oyente de Artista
}

/**
 * Endpoint de registro de usuarios (Oyentes y Artistas) usando Cloud Functions
 * @method POST /api/v1/auth/register
 */
export const register = functions.https.onRequest(async (request, response) => {
    // Solo permitir POST requests
    if (request.method !== 'POST') {
        response.status(405).send({ message: 'Método no permitido.' });
        return;
    }
    
    const { email, password, is_artist } = request.body as RegisterBody;
    
    try {
        // 1. Creación del Usuario en Firebase Authentication
        const userCredential = await auth.createUser({
            email: email,
            password: password,
            displayName: is_artist ? 'Artista' : 'Oyente'
        });

        const uid = userCredential.uid;
        const role = is_artist ? 'artist' : 'listener';
        
        // 2. Creación del Perfil del Usuario en Firestore
        await db.collection('users').doc(uid).set({
            email: email,
            role: role,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            // Custom Claim para definir el rol en el Token
            custom_claims: { role: role } 
        });

        // 3. Asignar el Rol Custom Claim
        await auth.setCustomUserClaims(uid, { role: role });
        
        response.status(201).send({ 
            uid: uid, 
            role: role,
            message: `Registro exitoso como ${role} en Firebase.` 
        });

    } catch (error) {
        console.error('Error durante el registro en Firebase:', error);
        // Manejo de errores específicos de Firebase Authentication
        response.status(400).send({ message: (error as Error).message });
    }
});
