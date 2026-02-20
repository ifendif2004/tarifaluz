# ⚡ Tarifa Luz - Monitor de Precios kWh

Una aplicación web moderna y ligera para consultar el precio de la luz por horas en España en tiempo real, utilizando datos oficiales de la Red Eléctrica de España (REE).

## 🚀 Características

- **Visualización en Tiempo Real:** Gráfico interactivo con los precios de las 24 horas del día.
- **Modo Oscuro/Claro:** Soporte completo para temas, con detección automática de preferencia de sistema y persistencia mediante `localStorage`.
- **Filtros Geográficos:** Consulta precios para Península, Canarias, Baleares, Ceuta y Melilla.
- **Histórico:** Selector de fechas para consultar precios de días anteriores.
- **Diseño Responsivo:** Optimizado tanto para móviles como para escritorio (vista de panel único).
- **PWA Ready:** Incluye Service Worker y Manifiesto para instalación como aplicación web.
- **Accesibilidad Avanzada:** Cumple con altos estándares de contraste y jerarquía semántica (Lighthouse approved).

## 🛠️ Tecnologías

- **HTML5:** Estructura semántica.
- **CSS3:** Diseño personalizado con variables (Custom Properties) y Flexbox/Grid.
- **JavaScript (ES6+):** Lógica de negocio y manejo de asincronía (Async/Await).
- **Chart.js:** Visualización de datos mediante gráficos dinámicos.
- **API REE:** Consumo de datos desde la API pública de `apidatos.ree.es`.

## 📦 Instalación y Uso

1. Cler el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/tarifaluz.git
   ```
2. Abre el archivo `index.html` en tu navegador. 
   *(Se recomienda usar un servidor local como Live Server en VS Code para el correcto funcionamiento de todas las características).*

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---
*Datos proporcionados por la Red Eléctrica de España.*
