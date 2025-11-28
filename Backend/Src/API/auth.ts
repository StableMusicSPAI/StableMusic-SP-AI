// backend/src/api/auth.ts

import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { Pool } from 'pg'; // Importamos el tipo Pool para la DB

// ----------------------------------------------------
// 1. Tipos de Datos (Schemas)
// ----------------------------------------------------

interface RegisterBody {
    email: string;
    password: string;
    is_artist: boolean; // Flag para diferenciar Oyente de Artista
}

// ----------------------------------------------------
// 2. Definición del Plugin de Rutas
// ----------------------------------------------------

export default async function authRoutes(server: FastifyInstance, options: FastifyPluginOptions) {
    // Definimos la interfaz de nuestro servidor para incluir la conexión a la DB
    // Nota: Esto asume que 'db' fue decorado en server.ts
    interface CustomFastifyInstance extends FastifyInstance {
        db: Pool;
    }
    const customServer = server as CustomFastifyInstance;
    
    /**
     * @route POST /api/v1/auth/register
     * Permite el registro de nuevos Oyentes y Artistas.
     */
    customServer.post('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
        const { email, password, is_artist } = request.body;

        try {
            // Lógica de Validación: Verificar si el email ya existe
            const userCheck = await customServer.db.query('SELECT user_id FROM users WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                return reply.status(409).send({ message: 'El correo electrónico ya está registrado.' });
            }

            // Lógica de Seguridad: Hashear la contraseña (usar librerías como bcrypt en producción)
            const hashedPassword = `HASHED_${password}`; // Placeholder

            // Insertar el nuevo usuario
            const role = is_artist ? 'artist' : 'listener';
            const result = await customServer.db.query(
                'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, role',
                [email, hashedPassword, role]
            );

            // Devolver un token de sesión (JWT) – Pendiente de implementar
            reply.status(201).send({ 
                user_id: result.rows[0].user_id,
                role: result.rows[0].role,
                message: `Registro exitoso como ${role}.` 
            });

        } catch (error) {
            server.log.error('Error durante el registro:', error);
            reply.status(500).send({ message: 'Error interno del servidor.' });
        }
    });

    /**
     * @route POST /api/v1/auth/login
     * Permite el inicio de sesión de usuarios y artistas.
     */
    customServer.post('/login', async (request: FastifyRequest<{ Body: Omit<RegisterBody, 'is_artist'> }>, reply: FastifyReply) => {
        const { email, password } = request.body;
        
        // Lógica: Buscar el usuario y verificar la contraseña
        // ... (Implementación de Login y Generación de JWT)

        reply.status(200).send({ token: "JWT_TOKEN_HERE", message: 'Inicio de sesión exitoso.' });
    });
}
