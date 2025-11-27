# ia_engine/src/main.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

# Inicializa la aplicación FastAPI
app = FastAPI(
    title="Stable Music IA Engine",
    description="APIs para IA de Marketing y Optimización Logística (POD).",
    version="1.0.0"
)

# ----------------------------------------------------
# 1. IA de Marketing (Propensión y Segmentación)
# ----------------------------------------------------

# Modelo de datos para la solicitud de segmentación de usuarios
class UserData(BaseModel):
    user_id: str
    listening_history: List[str]
    demographics: dict
    
# Modelo para la respuesta de la IA de Marketing
class MarketingPrediction(BaseModel):
    user_id: str
    propensity_to_subscribe: float # Probabilidad de conversión (CLTV)
    ad_segment: str               # Segmento publicitario para anunciantes

@app.post("/marketing/predict_propensity", response_model=MarketingPrediction)
def predict_marketing(data: UserData):
    """
    Predice la propensión de un oyente a suscribirse y lo segmenta para publicidad.
    [span_0](start_span)(Utiliza el modelo de IA entrenado para reducir el CAC[span_0](end_span)).
    """
    # Lógica Placeholder: Aquí se cargarían y ejecutarían los modelos de PyTorch
    
    # Simulación de respuesta basada en IA
    if len(data.listening_history) > 100:
        propensity = 0.85
        segment = "High_Value_Vinyl_Buyer"
    else:
        propensity = 0.30
        segment = "General_Audience"
        
    return MarketingPrediction(
        user_id=data.user_id,
        propensity_to_subscribe=propensity,
        ad_segment=segment
    )

# ----------------------------------------------------
# 2. IA Logística (Optimización POD)
# ----------------------------------------------------

# Modelo de datos para la solicitud de optimización de pedido
class OrderOptimization(BaseModel):
    order_id: str
    destination_zip: str
    product_type: str # Siempre 'Vinyl POD'
    
# Modelo para la respuesta de la IA Logística
class LogisticsSolution(BaseModel):
    order_id: str
    selected_provider: str # Proveedor seleccionado (optimización de costes)
    [span_1](start_span)estimated_delivery_eta: str # ETA optimizada (reducción de riesgo logístico[span_1](end_span))

@app.post("/logistics/optimize_order", response_model=LogisticsSolution)
def optimize_logistics(order: OrderOptimization):
    """
    Optimiza el proveedor logístico y calcula el ETA para un pedido POD.
    [span_2](start_span)(Utiliza la IA de Logística para gestionar el fulfillment[span_2](end_span)).
    """
    # Lógica Placeholder: Aquí se ejecutarían los modelos de optimización de rutas
    
    # Simulación de respuesta basada en IA
    if order.destination_zip.startswith("9"):
        provider = "Provider_WestCoast_Optimized"
        eta = "2 days"
    else:
        provider = "Provider_Global_Standard"
        eta = "4-7 days"
        
    return LogisticsSolution(
        order_id=order.order_id,
        selected_provider=provider,
        estimated_delivery_eta=eta
    )
