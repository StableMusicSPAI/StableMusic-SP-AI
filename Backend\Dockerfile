# Dockerfile para el servicio de Backend de Stable Music

# 1. Fase de Construcción (Build Stage)
# Usa la imagen base de Node.js con soporte para Alpine Linux (pequeña y segura)
FROM node:20-alpine AS builder

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración (para instalar dependencias)
COPY backend/package.json backend/package-lock.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el código fuente completo del backend
COPY backend/. .

# Compila el código TypeScript a JavaScript (necesario para TypeScript)
RUN npm run build 

# 2. Fase de Producción (Production Stage)
# Usa una imagen más ligera solo con Node.js Runtime para producción
FROM node:20-alpine AS final

# Establece el directorio de trabajo
WORKDIR /app

# Copia las dependencias de producción y el código compilado de la fase de construcción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 

# Expone el puerto por defecto de la aplicación (e.g., Fastify)
EXPOSE 3000

# Define el comando para iniciar el servidor de producción
CMD ["node", "dist/server.js"]
