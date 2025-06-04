# Estación Meteorológica IoT

Este proyecto es una interfaz web responsiva para visualizar datos de una estación meteorológica IoT que utiliza ThingSpeak como plataforma de almacenamiento y procesamiento de datos.

## Características

- Visualización en tiempo real de datos meteorológicos
- Gráficas interactivas de temperatura y humedad
- Predicciones basadas en lógica difusa
- Diseño responsivo para todos los dispositivos
- Actualización automática cada 30 segundos

## Tecnologías Utilizadas

- HTML5
- CSS3 (con variables CSS y Grid Layout)
- JavaScript (ES6+)
- Chart.js para visualización de datos
- ThingSpeak API

## Configuración

1. Clona este repositorio
2. Abre `index.html` en tu navegador web
3. Los datos se actualizarán automáticamente cada 30 segundos

## Estructura del Proyecto

```
.
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
└── README.md          # Documentación
```

## ThingSpeak

El proyecto utiliza el canal ThingSpeak con las siguientes configuraciones:
- Channel ID: 2949455
- Read API Key: T9BEBMPKVO4PMVU2

## Predicciones

El sistema utiliza una implementación simplificada de lógica difusa para predecir:
- Probabilidad de lluvia
- Riesgo de temperaturas frías

Las predicciones se basan en:
- Temperatura actual
- Humedad relativa
- Presión atmosférica

## Contribuir

Si deseas contribuir al proyecto:
1. Haz un Fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request 