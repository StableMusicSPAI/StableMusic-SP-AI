# api/index.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
import random

# Inicialización de FastAPI. Vercel buscará la variable 'app'.
app = FastAPI(title="StableMusicSPAI API - Generación de Música por IA")

# =========================================================================
# 1. CONFIGURACIÓN CORS (CRUCIAL PARA LA COMUNICACIÓN CON GITHUB PAGES)
# =========================================================================

# El asterisco (*) permite llamadas desde CUALQUIER dominio,
# lo cual es necesario para tu Front-end gratuito de GitHub Pages.
origins = [
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, etc.
    allow_headers=["*"],
)

# =========================================================================
# 2. ENDPOINTS (LÓGICA DEL SERVIDOR)
# =========================================================================

# Endpoint de prueba (para verificar que la API está viva)
@app.get("/")
def home():
    """Muestra un mensaje de bienvenida."""
    return {"message": "API de StableMusicSPAI está operativa. Lista para generar música."}

# Endpoint principal para la generación de música
@app.post("/generate_music")
async def generate_music(prompt: dict):
    """
    Simula la generación de una pista musical por IA, esperando un 'prompt'.
    
    Espera un JSON como: {"prompt": "un ritmo techno veraniego de Ibiza"}
    """
    
    # 1. Validación simple de la entrada
    if "prompt" not in prompt or not prompt["prompt"]:
        raise HTTPException(status_code=400, detail="Se requiere el campo 'prompt'.")
    
    prompt_text = prompt["prompt"]
    print(f"Recibida solicitud para generar música con prompt: {prompt_text}")
    
    # 2. SIMULACIÓN DE PROCESAMIENTO DE IA:
    # Esto simula un tiempo de espera para la generación.
    # Usamos un tiempo corto para evitar exceder el límite de 10 segundos de Vercel.
    time.sleep(random.randint(2, 5)) 
    
    # 3. Simulamos los datos de salida
    track_id = str(random.randint(10000, 99999))
    
    # Nota: Esta es una URL de prueba. En el futuro, apuntará al audio real generado.
    mock_audio_url = "https://ejemplo.com/audio/spai_track_" + track_id + ".mp3"

    # 4. Retorna la respuesta
    return {
        "status": "success",
        "track_id": track_id,
        "prompt_used": prompt_text,
        "audio_url": mock_audio_url,
        "message": "Pista musical simulada generada correctamente por StableMusicSPAI."
    }

# FIN DEL CÓDIGO
