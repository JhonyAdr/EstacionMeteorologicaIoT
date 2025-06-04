// Configuración de ThingSpeak
const CHANNEL_ID = '2949455';
const READ_API_KEY = 'T9BEBMPKVO4PMVU2';
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=100`;

// Configuración de las gráficas
let temperatureChart, humidityChart;
const maxDataPoints = 20;
let temperatureData = [];
let humidityData = [];
let timeLabels = [];

// Inicializar gráficas
function initializeCharts() {
    const temperatureCtx = document.getElementById('temperatureChart').getContext('2d');
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');

    temperatureChart = new Chart(temperatureCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: temperatureData,
                borderColor: '#2196F3',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    humidityChart = new Chart(humidityCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Humedad (%)',
                data: humidityData,
                borderColor: '#4CAF50',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Función para actualizar los datos en tiempo real
function updateCurrentData(data) {
    document.getElementById('temperature').textContent = `${data.temperature}°C`;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('pressure').textContent = `${data.pressure} hPa`;
    document.getElementById('rain-probability').textContent = `${data.rainProbability}%`;
    document.getElementById('cold-risk').textContent = `${data.coldRisk}%`;
}

// Función para actualizar las gráficas
function updateCharts(data) {
    const timestamp = new Date(data.created_at).toLocaleTimeString();
    
    temperatureData.push(data.temperature);
    humidityData.push(data.humidity);
    timeLabels.push(timestamp);

    if (temperatureData.length > maxDataPoints) {
        temperatureData.shift();
        humidityData.shift();
        timeLabels.shift();
    }

    temperatureChart.update();
    humidityChart.update();
}

// Función para calcular predicciones usando lógica difusa
function calculateFuzzyPredictions(temperature, humidity, pressure) {
    // Implementación simplificada de la lógica difusa
    let rainProbability = 0;
    let coldRisk = 0;

    // Cálculo de probabilidad de lluvia
    if (humidity > 70 && pressure < 1000) {
        rainProbability = 80;
    } else if (humidity > 50 && pressure < 1010) {
        rainProbability = 50;
    } else {
        rainProbability = 20;
    }

    // Cálculo de riesgo de frío
    if (temperature < 5) {
        coldRisk = 90;
    } else if (temperature < 10) {
        coldRisk = 60;
    } else if (temperature < 15) {
        coldRisk = 30;
    } else {
        coldRisk = 10;
    }

    return {
        rainProbability: Math.round(rainProbability),
        coldRisk: Math.round(coldRisk)
    };
}

// Función principal para obtener y procesar datos
async function fetchAndProcessData() {
    try {
        const response = await fetch(THINGSPEAK_URL);
        const data = await response.json();
        
        if (data.feeds && data.feeds.length > 0) {
            const latestFeed = data.feeds[data.feeds.length - 1];
            
            const processedData = {
                temperature: parseFloat(latestFeed.field1),
                pressure: parseFloat(latestFeed.field2),
                humidity: parseFloat(latestFeed.field3),
                created_at: latestFeed.created_at
            };

            const predictions = calculateFuzzyPredictions(
                processedData.temperature,
                processedData.humidity,
                processedData.pressure
            );

            processedData.rainProbability = predictions.rainProbability;
            processedData.coldRisk = predictions.coldRisk;

            updateCurrentData(processedData);
            updateCharts(processedData);
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    fetchAndProcessData();
    // Actualizar datos cada 30 segundos
    setInterval(fetchAndProcessData, 30000);
}); 