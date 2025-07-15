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
let predictionHistory = [];
const maxHistoryItems = 10;

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
                borderColor: '#00ff9d',
                backgroundColor: 'rgba(0, 255, 157, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointStyle: 'circle',
                borderWidth: 2
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
                        stepSize: 5,
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ...commonOptions.scales.x,
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    ...commonOptions.plugins.legend,
                    labels: {
                        color: '#ffffff'
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
                borderColor: '#00b8ff',
                backgroundColor: 'rgba(0, 184, 255, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointStyle: 'circle',
                borderWidth: 2
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
                        stepSize: 10,
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ...commonOptions.scales.x,
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    ...commonOptions.plugins.legend,
                    labels: {
                        color: '#ffffff'
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
                borderColor: '#ff3d00',
                backgroundColor: 'rgba(255, 61, 0, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointStyle: 'circle',
                borderWidth: 2
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
                        stepSize: 25,
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ...commonOptions.scales.x,
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    ...commonOptions.plugins.legend,
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Función para cargar el historial desde localStorage
function loadPredictionHistory() {
    const savedHistory = localStorage.getItem('predictionHistory');
    if (savedHistory) {
        predictionHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// Función para guardar el historial en localStorage
function savePredictionHistory() {
    localStorage.setItem('predictionHistory', JSON.stringify(predictionHistory));
}

// Función para actualizar la visualización del historial
function updateHistoryDisplay() {
    const historyList = document.getElementById('prediction-history-list');
    historyList.innerHTML = predictionHistory.map(item => `
        <div class="history-item">
            <span class="time">${item.time}</span>
            <span class="temp">${item.temp}°C</span>
            <span class="humidity">${item.humidity}%</span>
            <span class="pressure">${item.pressure} hPa</span>
            <span class="rain">${item.rain}%</span>
            <span class="cold">${item.cold}%</span>
            <span class="comfort">${item.comfort}%</span>
        </div>
    `).join('');
}

// Función para actualizar el historial de predicciones
function updatePredictionHistory(data) {
    // Verificar si es un nuevo dato comparando con el último tiempo de actualización
    if (lastUpdateTime !== data.created_at) {
        const historyItem = {
            time: formatTime(new Date(data.created_at)),
            temp: data.temperature.toFixed(1),
            humidity: data.humidity.toFixed(1),
            pressure: data.pressure.toFixed(1),
            rain: data.rainProbability,
            cold: data.coldRisk,
            comfort: data.comfortIndex
        };

        predictionHistory.unshift(historyItem);
        
        // Mantener solo los últimos maxHistoryItems
        if (predictionHistory.length > maxHistoryItems) {
            predictionHistory = predictionHistory.slice(0, maxHistoryItems);
        }

        // Guardar el historial actualizado
        savePredictionHistory();
        
        // Actualizar la visualización
        updateHistoryDisplay();

        // Enviar la predicción al backend Node.js
        fetch('http://localhost:3001/api/predicciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fecha: new Date(data.created_at).toISOString().slice(0, 19).replace('T', ' '),
                temperatura: data.temperature,
                humedad: data.humidity,
                presion: data.pressure,
                lluvia: data.rainProbability,
                frio: data.coldRisk,
                confort: data.comfortIndex
            })
        }).catch(err => console.error('Error enviando al backend:', err));
    }
}

// Función para actualizar los datos en tiempo real
function updateCurrentData(data) {
    document.getElementById('temperature').textContent = `${data.temperature.toFixed(2)}°C`;
    document.getElementById('humidity').textContent = `${data.humidity.toFixed(2)}%`;
    document.getElementById('pressure').textContent = `${data.pressure.toFixed(2)} hPa`;
    document.getElementById('rain-probability').textContent = `${data.rainProbability}%`;
    document.getElementById('cold-risk').textContent = `${data.coldRisk}%`;
    document.getElementById('comfort-index').textContent = `${data.comfortIndex}%`;
    
    // Actualizar el historial de predicciones solo si hay nuevos datos
    updatePredictionHistory(data);
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
    // Funciones de pertenencia difusas
    const triangular = (x, a, b, c) => Math.max(0, Math.min((x-a)/(b-a), 1, (c-x)/(c-b)));
    const trapezoidal = (x, a, b, c, d) => Math.max(0, Math.min((x-a)/(b-a), 1, (d-x)/(d-c)));

    // Fuzzificación de temperatura
    const tempFria = triangular(temperature, -10, 0, 10);
    const tempTemplada = triangular(temperature, 5, 15, 25);
    const tempCalida = triangular(temperature, 20, 30, 40);
    
    // Fuzzificación de humedad
    const humedadBaja = trapezoidal(humidity, 0, 0, 30, 50);
    const humedadMedia = trapezoidal(humidity, 30, 50, 70, 90);
    const humedadAlta = trapezoidal(humidity, 70, 90, 100, 100);

    // Fuzzificación de presión
    const presionBaja = trapezoidal(pressure, 950, 970, 990, 1010);
    const presionNormal = trapezoidal(pressure, 990, 1010, 1020, 1040);
    const presionAlta = trapezoidal(pressure, 1020, 1040, 1060, 1060);

    // Sistema de reglas difusas para probabilidad de lluvia
    const rainRules = [
        Math.min(humedadAlta, presionBaja), // Regla 1: Si humedad alta Y presión baja -> lluvia alta
        Math.min(humedadAlta, presionNormal), // Regla 2
        Math.min(humedadMedia, presionBaja), // Regla 3
        Math.min(humedadMedia, presionNormal, tempTemplada), // Regla 4
        Math.min(humedadBaja, presionAlta) // Regla 5: Si humedad baja Y presión alta -> lluvia baja
    ];

    // Sistema de reglas difusas para riesgo de frío
    const coldRules = [
        Math.min(tempFria, humedadAlta), // Regla 1: Si temp fría Y humedad alta -> frío extremo
        Math.min(tempFria, humedadMedia), // Regla 2
        Math.min(tempTemplada, humedadAlta), // Regla 3
        Math.min(tempTemplada, humedadMedia), // Regla 4
        Math.min(tempCalida, humedadBaja) // Regla 5: Si temp cálida Y humedad baja -> frío bajo
    ];

    // Pesos para cada regla de lluvia (salidas singletons)
    const rainWeights = [90, 70, 60, 40, 10];
    // Pesos para cada regla de frío
    const coldWeights = [95, 75, 60, 40, 15];

    // Cálculo de los centroides (defuzzificación)
    const rainNumerator = rainRules.reduce((sum, rule, i) => sum + rule * rainWeights[i], 0);
    const rainDenominator = rainRules.reduce((sum, rule) => sum + rule, 0.001);
    const rainProbability = rainNumerator / rainDenominator;

    const coldNumerator = coldRules.reduce((sum, rule, i) => sum + rule * coldWeights[i], 0);
    const coldDenominator = coldRules.reduce((sum, rule) => sum + rule, 0.001);
    const coldRisk = coldNumerator / coldDenominator;

    // Ajustes no lineales para interacciones complejas
    const adjustedRain = Math.min(100, rainProbability * (1 + humedadAlta * 0.3 - humedadBaja * 0.2));
    const adjustedCold = Math.min(100, coldRisk * (1 + tempFria * 0.4 - tempCalida * 0.3));

    // Calcular el índice de confort
    const comfortIndex = Math.round(100 - (adjustedCold * 0.7 + adjustedRain * 0.3));

    return {
        rainProbability: Math.round(adjustedRain),
        coldRisk: Math.round(adjustedCold),
        comfortIndex: comfortIndex
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
                processedData.comfortIndex = predictions.comfortIndex;

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
    loadPredictionHistory(); // Cargar el historial guardado
    await loadInitialHistory(); // Cargar historial inicial
    fetchAndProcessData();
    // Actualizar datos cada segundo
    setInterval(fetchAndProcessData, 1000);
}); 




