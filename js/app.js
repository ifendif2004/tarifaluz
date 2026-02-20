// Elements
const dateControl = document.querySelector('#cbfecha');
const geolimit = document.getElementById('sellimit');
const lista = document.getElementById('lista');
const btnConsultar = document.getElementById('btnConsultar');
const maxmin = document.getElementById('maxmin');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('themeToggle');
let priceChart = null;

// Theme Logic
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark-mode');
        updateThemeIcon(true);
    }
};

const updateThemeIcon = (isDark) => {
    themeToggle.innerHTML = isDark
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
};

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);

    // Refresh chart to update colors if it exists
    if (priceChart) {
        const labels = priceChart.data.labels;
        const data = priceChart.data.datasets[0].data;
        // Get thresholds from original chart or recalculate
        // For simplicity, we just rebuild it if we have the data
        // Actually, better to just update the options
        renderChart(labels, data);
    }
});

initTheme();

// ----------- Registrar el Service Worker ------------------
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./swtarifaluz.js')
            .then(reg => console.log('Service Worker registrado', reg))
            .catch(err => console.error('Error al registrar SW', err));
    });
}

// Inicialización de fecha
const setInitialDate = () => {
    const hoy = new Date();
    dateControl.value = hoy.toISOString().split('T')[0];
};

setInitialDate();

// Listeners
const clearResults = () => {
    lista.innerHTML = '';
    maxmin.innerHTML = '';
    if (priceChart) {
        priceChart.destroy();
        priceChart = null;
    }
};

geolimit.addEventListener("change", clearResults);
dateControl.addEventListener("change", clearResults);

btnConsultar.addEventListener("click", (event) => {
    event.preventDefault();
    const fecha = dateControl.value;
    if (!fecha) return;

    const startdate = `${fecha}T00:00`;
    const enddate = `${fecha}T23:59`;
    cargarPrecios(startdate, enddate);
});

// Lógica de carga
const cargarPrecios = async (startdate, enddate) => {
    try {
        setLoadingState(true);
        clearResults();

        const url = `https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=${startdate}&end_date=${enddate}&geo_limit=${geolimit.value}&time_trunc=hour`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const values = data.included[0].attributes.values;

        if (!values || values.length === 0) {
            lista.innerHTML = '<p class="error">No se encontraron datos para esta fecha o zona.</p>';
            return;
        }

        renderResults(values);

    } catch (error) {
        console.error("Error cargando precios:", error);
        lista.innerHTML = `<p class="error">Error: ${error.message}. Por favor, reintenta más tarde.</p>`;
    } finally {
        setLoadingState(false);
    }
};

const renderResults = (values) => {
    const prices = values.map(v => v.value / 1000);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Calcular umbrales para colores
    const range = max - min;
    const lowThreshold = min + (range * 0.33);
    const midThreshold = min + (range * 0.66);

    // Renderizar Stats
    maxmin.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Mínimo</div>
            <div class="stat-value minimo">${min.toFixed(5)} <small>€</small></div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Media</div>
            <div class="stat-value medio">${avg.toFixed(5)} <small>€</small></div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Máximo</div>
            <div class="stat-value maximo">${max.toFixed(5)} <small>€</small></div>
        </div>
    `;

    // Renderizar Lista y preparar datos para el gráfico
    const labels = [];
    const chartData = [];
    let listHtml = '';

    values.forEach((item, index) => {
        const price = prices[index];
        const hourStart = item.datetime.slice(11, 13);
        const hourEnd = String((parseInt(hourStart) + 1) % 24).padStart(2, '0');
        const timeLabel = `${hourStart}:00 - ${hourEnd}:00`;

        let statusClass = 'maximo';
        if (price <= lowThreshold) statusClass = 'minimo';
        else if (price <= midThreshold) statusClass = 'medio';

        labels.push(`${hourStart}h`);
        chartData.push(price);

        listHtml += `
            <div class="itempreciohora">
                <div class="status-dot dot-${statusClass}"></div>
                <span class="time-label">${timeLabel}</span>
                <span class="price-value ${statusClass}">${price.toFixed(5)} €/kWh</span>
            </div>
        `;
    });

    lista.innerHTML = listHtml;
    renderChart(labels, chartData, lowThreshold, midThreshold);
};

const renderChart = (labels, data, low, mid) => {
    const ctx = document.getElementById('priceChart').getContext('2d');

    // Colores dinámicos para las barras
    const backgroundColors = data.map(val => {
        if (val <= low) return '#10b981'; // Green
        if (val <= mid) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    });

    priceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Precio €/kWh',
                data: data,
                backgroundColor: backgroundColors,
                borderRadius: 4,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: document.documentElement.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                    ticks: { color: document.documentElement.classList.contains('dark-mode') ? '#94a3b8' : '#64748b' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 9 },
                        color: document.documentElement.classList.contains('dark-mode') ? '#94a3b8' : '#64748b'
                    }
                }
            }
        }
    });
};

const setLoadingState = (isLoading) => {
    btnConsultar.disabled = isLoading;
    loading.style.display = isLoading ? 'block' : 'none';
};

