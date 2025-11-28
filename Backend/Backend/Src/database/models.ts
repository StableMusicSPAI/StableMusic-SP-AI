// backend/src/database/models.ts (Adaptado para Firestore)

import { Timestamp } from 'firebase-admin/firestore';

// ----------------------------------------------------
// 1. Colección: users (Documento ID = UID de Firebase Auth)
// ----------------------------------------------------
export interface UserDocument {
    email: string;
    role: 'listener' | 'artist'; // Oyente o Artista
    created_at: Timestamp;
    subscription_plan_id: string | null; // ID del plan actual
    
    // Solo para el rol 'artist'
    artist_name?: string;
    is_ai_artist?: boolean; // CLAVE para Artistas IA (AIA)
    royalty_account_id?: string; // Cuenta para pagos de royalties
}

// ----------------------------------------------------
// 2. Colección: tracks (Documento ID = Generado por Firestore)
// ----------------------------------------------------
export interface TrackDocument {
    artist_uid: string; // UID del artista creador (Referencia a 'users')
    title: string;
    genre: string;
    duration_ms: number;
    storage_path: string; // Ruta al archivo de audio en Cloud Storage
    
    is_ai_generated: boolean; // Flag para aplicar la tasa de royalty AN vs AIA
    royalty_rate: number; // Porcentaje de regalías (definido en el plan de negocio)
    
    created_at: Timestamp;
    total_streams: number;
}

// ----------------------------------------------------
// 3. Colección: pod_orders (Print on Demand Logístico)
// ----------------------------------------------------
export interface PodOrderDocument {
    user_uid: string; // Oyente que hizo el pedido
    track_id: string; // ID de la pista del Vinilo
    
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    cost_euro: number; // Debería ser -18€ para suscriptores
    shipping_address: object;
    
    // Asignación por la IA Logística (Cloud Function)
    tracking_number: string | null;
    provider_id: string; 
    
    ordered_at: Timestamp;
}

// ----------------------------------------------------
// 4. Colección: royalties (Pagos a Artistas)
// ----------------------------------------------------
export interface RoyaltyPaymentDocument {
    artist_uid: string;
    period_start: Timestamp;
    period_end: Timestamp;
    
    amount_euro: number;
    source: 'streaming' | 'pod_sale';
    processed_at: Timestamp;
}
