// Configuración de ThingSpeak
const CHANNEL_ID = '2949455';
const READ_API_KEY = 'T9BEBMPKVO4PMVU2';
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=100`;

// Configuración de las gráficas
let temperatureChart, humidityChart, pressureChart;
const maxDataPoints = 20;
let temperatureData = [];
let humidityData = [];
let pressureData = [];
let timeLabels = [];
let lastUpdateTime = null;

// Función para formatear la hora con segundos
function formatTime(date) {
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Función para actualizar todos los gráficos
function updateAllCharts() {
    // Actualizar datos en los gráficos
    temperatureChart.data.labels = timeLabels;
    temperatureChart.data.datasets[0].data = temperatureData;
    temperatureChart.update('none');

    humidityChart.data.labels = timeLabels;
    humidityChart.data.datasets[0].data = humidityData;
    humidityChart.update('none');

    pressureChart.data.labels = timeLabels;
    pressureChart.data.datasets[0].data = pressureData;
    pressureChart.update('none');
}

// Inicializar gráficas
function initializeCharts() {
    const temperatureCtx = document.getElementById('temperatureChart').getContext('2d');
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');
    const pressureCtx = document.getElementById('pressureChart').getContext('2d');

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(2);
                        }
                        return label;
                    }
                }
            }
        }
    };

    temperatureChart = new Chart(temperatureCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: temperatureData,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointStyle: 'circle'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    beginAtZero: false,
                    min: 0,
                    max: 40,
                    ticks: {
                        stepSize: 5
                    }
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
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointStyle: 'circle'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });

    pressureChart = new Chart(pressureCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Presión (hPa)',
                data: pressureData,
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointStyle: 'circle'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    beginAtZero: false,
                    min: 900,
                    max: 1050,
                    ticks: {
                        stepSize: 25
                    }
                }
            }
        }
    });
}

// Función para actualizar los datos en tiempo real
function updateCurrentData(data) {
    document.getElementById('temperature').textContent = `${data.temperature.toFixed(2)}°C`;
    document.getElementById('humidity').textContent = `${data.humidity.toFixed(2)}%`;
    document.getElementById('pressure').textContent = `${data.pressure.toFixed(2)} hPa`;
    document.getElementById('rain-probability').textContent = `${data.rainProbability}%`;
    document.getElementById('cold-risk').textContent = `${data.coldRisk}%`;
}

// Función para actualizar las gráficas
function updateCharts(data) {
    const timestamp = formatTime(new Date(data.created_at));
    
    // Verificar si es un nuevo dato
    if (lastUpdateTime !== data.created_at) {
        lastUpdateTime = data.created_at;
        
        // Agregar nuevos datos
        temperatureData.push(data.temperature);
        humidityData.push(data.humidity);
        pressureData.push(data.pressure);
        timeLabels.push(timestamp);

        // Mantener solo los últimos maxDataPoints
        if (temperatureData.length > maxDataPoints) {
            temperatureData = temperatureData.slice(-maxDataPoints);
            humidityData = humidityData.slice(-maxDataPoints);
            pressureData = pressureData.slice(-maxDataPoints);
            timeLabels = timeLabels.slice(-maxDataPoints);
        }

        // Actualizar todos los gráficos
        updateAllCharts();
    }
}

// Función para cargar el historial inicial
async function loadInitialHistory() {
    try {
        const response = await fetch(THINGSPEAK_URL);
        const data = await response.json();
        
        if (data.feeds && data.feeds.length > 0) {
            // Limpiar arrays existentes
            temperatureData = [];
            humidityData = [];
            pressureData = [];
            timeLabels = [];

            // Cargar los últimos maxDataPoints registros
            const recentFeeds = data.feeds.slice(-maxDataPoints);
            
            recentFeeds.forEach(feed => {
                // Asegurarse de que los campos se lean en el orden correcto según la API
                const temp = parseFloat(feed.field1);  // Temperatura
                const pres = parseFloat(feed.field2);  // Presión
                const hum = parseFloat(feed.field3);   // Humedad
                
                // Solo agregar datos válidos
                if (!isNaN(temp) && !isNaN(hum) && !isNaN(pres)) {
                    temperatureData.push(temp);
                    humidityData.push(hum);
                    pressureData.push(pres);
                    timeLabels.push(formatTime(new Date(feed.created_at)));
                }
            });

            // Actualizar todos los gráficos con el historial
            if (temperatureData.length > 0) {
                // Actualizar los datos en los gráficos
                temperatureChart.data.labels = timeLabels;
                temperatureChart.data.datasets[0].data = temperatureData;
                
                humidityChart.data.labels = timeLabels;
                humidityChart.data.datasets[0].data = humidityData;
                
                pressureChart.data.labels = timeLabels;
                pressureChart.data.datasets[0].data = pressureData;

                // Actualizar todos los gráficos
                temperatureChart.update('none');
                humidityChart.update('none');
                pressureChart.update('none');

                // Guardar el último tiempo de actualización
                lastUpdateTime = data.feeds[data.feeds.length - 1].created_at;
            }
        }
    } catch (error) {
        console.error('Error al cargar el historial:', error);
    }
}

// Función para calcular predicciones usando lógica difusa
function calculateFuzzyPredictions(temperature, humidity, pressure) {
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
            
            // Asegurarse de que los campos se lean en el orden correcto según la API
            const processedData = {
                temperature: parseFloat(latestFeed.field1), // Temperatura
                pressure: parseFloat(latestFeed.field2),    // Presión
                humidity: parseFloat(latestFeed.field3),    // Humedad
                created_at: latestFeed.created_at
            };

            // Validar que los datos sean números válidos
            if (!isNaN(processedData.temperature) && 
                !isNaN(processedData.humidity) && 
                !isNaN(processedData.pressure)) {

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
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    initializeCharts();
    await loadInitialHistory(); // Cargar historial inicial
    fetchAndProcessData();
    // Actualizar datos cada segundo
    setInterval(fetchAndProcessData, 1000);
}); 




