# MoodFit: Plataforma de Entrenamiento Adaptativo Inteligente

MoodFit es una solución tecnológica avanzada que integra el bienestar físico con la salud emocional. A través de un sistema de rutinas dinámicas, la plataforma personaliza el entrenamiento basándose en el estado de ánimo actual del usuario, permitiendo que la actividad física actúe como una herramienta de regulación emocional.

## Características Principales

*   **Entrenamiento Basado en Estados de Ánimo:** Implementación de algoritmos para asignar rutinas específicas a 10 categorías emocionales distintas.
*   **Interfaz de Usuario Premium:** Sistema interactivo que incluye reproducción de video guía y audio contextual sincronizado.
*   **Cálculo Métrico de Intensidad:** Estimación precisa de quema calórica basada en el peso del usuario y la intensidad METs de cada rutina.
*   **Arquitectura Escalable:** Integración de base de datos en tiempo real para la gestión eficiente de recursos multimedia.
*   **Diseño Adaptable:** Interfaz optimizada para múltiples dispositivos mediante técnicas de diseño responsivo.

## Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Frontend Framework** | Astro |
| **Lógica de Interfaz** | React |
| **Estilos y Layout** | Tailwind CSS |
| **Backend as a Service** | Supabase (PostgreSQL & Auth) |
| **Lenguaje de Programación** | TypeScript |
| **Componentes de UI** | Lucide React |

## Estructura del Proyecto

*   `/public/`: Directorio de recursos estáticos (videos, audio y activos globales).
*   `/src/components/`: Componentes modulares desarrollados en React.
*   `/src/pages/`: Definición de rutas y vistas principales del sistema.
*   `/src/lib/`: Módulos de configuración y conexión con servicios externos.

## Configuración del Entorno de Desarrollo

1.  **Clonación del Proyecto:**
    ```bash
    git clone https://github.com/Jhoinersenati/MoodFit
    cd MoodFit
    ```

2.  **Instalación de Dependencias:**
    ```bash
    npm install
    ```

3.  **Configuración de Variables de Entorno:**
    Crear un archivo `.env` con las credenciales correspondientes:
    ```env
    PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Ejecución del Servidor Local:**
    ```bash
    npm run dev
    ```

## Gestión de Datos (Supabase)

La persistencia de datos se gestiona mediante una tabla de `rutinas` que almacena:
*   Metadatos del ejercicio e instrucciones técnicas.
*   Parámetros de duración y configuración de medios (Video/Audio).
*   Vínculos relacionales con los perfiles de usuario y entrenadores.

## Créditos y Propósito

Este proyecto ha sido desarrollado como culminación académica, enfocado en demostrar la viabilidad de integrar tecnología de vanguardia con el bienestar humano integral.

---

*"Optimización física a través del equilibrio emocional."*