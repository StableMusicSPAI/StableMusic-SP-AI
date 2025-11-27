// backend/src/server.ts

import fastify from 'fastify';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
// Importamos las rutas de nuestros módulos
import authRoutes from './api/auth';
import trackRoutes from './api/tracks';

// Cargar variables de entorno (para la conexión a la DB y secretos)
dotenv.config();

// Inicializar el cliente de PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Configuración del Servidor Fastify
const server = fastify({
    logger: true // Habilitar logs para un mejor debugging y observabilidad
});

// Middleware de Conexión a Base de Datos (para que las rutas tengan acceso al pool)
server.decorate('db', pool);
// Nota: En un proyecto real, se usaría un plugin para esto.

// ----------------------------------------------------
// 1. Registro de Rutas API (Sprint 1)
// ----------------------------------------------------

// Rutas de Autenticación (Login, Registro de Oyentes y Artistas)
server.register(authRoutes, { prefix: '/api/v1/auth' });

// Rutas de Tracks (Subida, Metadata, Inicio de Streaming)
server.register(trackRoutes, { prefix: '/api/v1/tracks' });

// ----------------------------------------------------
// 2. Función de Inicio del Servidor
// ----------------------------------------------------

const start = async () => {
    try {
        // Obtener el puerto de las variables de entorno o usar 3000 por defecto
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        
        // Verificar conexión a la base de datos
        await pool.query('SELECT 1');
        server.log.info('Conexión exitosa a PostgreSQL.');

        await server.listen({ port: port, host: '0.0.0.0' });
        server.log.info(`🚀 Servidor Stable Music iniciado en http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
