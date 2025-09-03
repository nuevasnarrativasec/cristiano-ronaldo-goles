// Simulación de datos (reemplazar por la llamada real a Google Sheets)
        let goalsData = [];
        let filteredData = [];
        let currentFilter = 'all';
        let currentPage = 1;
        let currentTeam = 'Portugal';
        const GOALS_PER_PAGE = 12; // Número de goles por página

        // Configuración de la API de Google Sheets
        const SHEET_ID = '1rmq-uovoEXAFFD07h8MSUWfeI2Y7P2wg596PJ4CTceU'; // Reemplazar con tu ID
        const API_KEY = 'AIzaSyBiMIQGfjmnqRXpBANVOaK4HCEUp-dx0uw'; // Reemplazar con tu API key
        const SHEET_NAME = 'Hoja 1'; // Nombre de tu hoja

        // Función para cargar datos desde Google Sheets
        async function loadGoalsData() {
            try {
                // URL para acceder a Google Sheets API
                const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
                
                console.log('Cargando datos desde:', url);
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.values && data.values.length > 1) {
                    // Procesar los datos del sheet
                    goalsData = data.values.slice(1)
                        .filter(row => row && row.length > 0) // Filtrar filas vacías
                        .map((row, index) => ({
                            numero: parseInt(row[0]) || index + 1,
                            temporada: row[1] || 'N/A',
                            fecha: row[2] || 'N/A',
                            local: row[3] || 'N/A',
                            resultado: row[4] || 'N/A',
                            visita: row[5] || 'N/A',
                            minuto: parseInt(row[6]) || 0,
                            parteCuerpo: row[7] || 'N/A',
                            situacion: row[8] || 'N/A',
                            competicion: row[9] || 'N/A',
                            codigoJWPlayer: row[10] || '', // Código de JWPlayer (ej: TstMSBzy, rxq3j8xG, etc.)
                            numeroGol: row[11] || row[0] || '' // Número de gol
                        }))
                        .sort((a, b) => b.numero - a.numero); // Ordenar descendente por número
                    
                    console.log('Datos procesados:', goalsData.length, 'goles');
                    console.log('Primer gol:', goalsData[0]);
                    console.log('Último gol:', goalsData[goalsData.length - 1]);
                    
                    filteredData = [...goalsData];
                    renderGoals();
                } else {
                    throw new Error('No se encontraron datos en el spreadsheet');
                }
                
            } catch (error) {
                console.error('Error cargando datos:', error);
                // Usar datos de muestra en caso de error
                console.log('Usando datos simulados...');
                goalsData = generateSampleData();
                filteredData = [...goalsData];
                renderGoals();
            }
        }

        // Generar datos de muestra basados en tu spreadsheet (orden descendente)
        function generateSampleData() {
            const sampleGoals = [];
            const teams = {
                'Sporting Lisboa': { color: '#00B04F', opponent: 'Moreirense' },
                'Manchester United': { color: '#DA020E', opponent: 'Arsenal' },
                'Real Madrid': { color: '#FEBE10', opponent: 'Barcelona' },
                'Juventus': { color: '#000000', opponent: 'Inter Milan' },
                'Al Nassr': { color: '#005CA9', opponent: 'Al Hilal' },
                'Portugal': { color: '#FF0000', opponent: 'España' }
            };
            
            const competitions = ['Liga Portugal', 'Premier League', 'La Liga', 'Serie A', 'Champions League', 'Copa del Rey', 'Copa Árabe', 'Eurocopa', 'Mundial'];
            const bodyParts = ['De derecha', 'De izquierda', 'De cabeza', 'Penalty', 'Tiro libre'];
            const situations = ['Dentro del área', 'Fuera del área', 'Contraataque', 'Jugada ensayada', 'Tiro Libre'];
            
            // Generar 975 goles en orden descendente (del 975 al 1)
            for (let i = 975; i >= 1; i--) {
                const teamNames = Object.keys(teams);
                let currentTeam;
                
                // Asignar equipos según períodos de carrera
                if (i >= 900) currentTeam = 'Al Nassr';
                else if (i >= 800) currentTeam = 'Manchester United'; // Regreso
                else if (i >= 700) currentTeam = 'Al Nassr';
                else if (i >= 600) currentTeam = 'Juventus';
                else if (i >= 150) currentTeam = 'Real Madrid';
                else if (i >= 50) currentTeam = 'Manchester United';
                else currentTeam = 'Sporting Lisboa';
                
                const teamData = teams[currentTeam];
                
                sampleGoals.push({
                    numero: i,
                    temporada: `202${Math.floor((975-i)/100) + 2}-2${Math.floor((975-i)/100) + 3}`,
                    fecha: `${Math.floor(Math.random() * 28) + 1} de octubre de ${2023 + Math.floor((975-i)/200)}`,
                    local: currentTeam,
                    resultado: `${Math.floor(Math.random() * 4) + 1} - ${Math.floor(Math.random() * 3)}`,
                    visita: teamData.opponent,
                    minuto: Math.floor(Math.random() * 90) + 1,
                    parteCuerpo: bodyParts[Math.floor(Math.random() * bodyParts.length)],
                    situacion: situations[Math.floor(Math.random() * situations.length)],
                    competicion: competitions[Math.floor(Math.random() * competitions.length)],
                    embedCode: `tm25sf47`, // Código de embed de JWPlayer - cambiar por los reales
                    jwPlayerUrl: `https://content.jwplatform.com/players/tm25sf47-8qzXXXXX.html` // URL del embed
                });
            }
            
            return sampleGoals;
        }

        // Renderizar goles con paginación
        function renderGoals() {
            const grid = document.getElementById('goalsGrid');
            const resultsInfo = document.getElementById('resultsInfo');
            const pagination = document.getElementById('pagination');
            
            if (filteredData.length === 0) {
                grid.innerHTML = '<div class="no-results">No se encontraron goles con los filtros actuales</div>';
                resultsInfo.style.display = 'none';
                pagination.style.display = 'none';
                return;
            }

            // Calcular índices para la página actual
            const startIndex = (currentPage - 1) * GOALS_PER_PAGE;
            const endIndex = Math.min(startIndex + GOALS_PER_PAGE, filteredData.length);
            const currentPageData = filteredData.slice(startIndex, endIndex);

            // Mostrar información de resultados
            resultsInfo.style.display = 'block';
            resultsInfo.innerHTML = `
                Mostrando ${startIndex + 1}-${endIndex} de ${filteredData.length} goles
            `;

            // Renderizar goles de la página actual
            grid.innerHTML = currentPageData.map(goal => `
                <div class="goal-card" onclick="openVideoModal(${goal.numero})">
                    <div class="ctn-info-gol">
                        <div class="goal-number">${goal.numero}</div>
                        <div class="goal-info">
                            <div class="goal-teams">${goal.local}</div>
                            <div class="goal-result">${goal.resultado}</div>
                            <div class="goal-teams">${goal.visita}</div>
                            <div class="goal-competition">${goal.competicion}</div>
                            <div class="goal-date">${goal.fecha}</div>
                            <button class="play-btn">VER</button>
                        </div>
                    </div>                    
                </div>
            `).join('');

            // Renderizar paginación
            renderPagination();
        }

        // Renderizar controles de paginación
        function renderPagination() {
            const pagination = document.getElementById('pagination');
            const totalPages = Math.ceil(filteredData.length / GOALS_PER_PAGE);
            
            if (totalPages <= 1) {
                pagination.style.display = 'none';
                return;
            }

            pagination.style.display = 'flex';
            
            let paginationHTML = '';
            
            // Mostrar páginas (máximo 10 números visibles)
            const maxVisiblePages = 10;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // Ajustar el rango si estamos cerca del final
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `
                    <button class="page-number ${i === currentPage ? 'active' : ''}" 
                            onclick="changePage(${i})">${i}</button>
                `;
            }
            
            // Botón "Siguiente" si no estamos en la última página
            if (currentPage < totalPages) {
                paginationHTML += `
                    <button class="page-number next" onclick="changePage(${currentPage + 1})">
                        Siguiente
                    </button>
                `;
            }
            
            pagination.innerHTML = paginationHTML;
        }

        // Cambiar página
        function changePage(page) {
            currentPage = page;
            renderGoals();
            
            // Scroll suave hacia el inicio del grid de goles
            const goalsGrid = document.getElementById('goalsGrid');
            goalsGrid.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Actualizar botones activos
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                currentFilter = filter;
                
                // Ocultar todos los contenedores especiales
                document.getElementById('calendarContainer').style.display = 'none';
                document.getElementById('minuteContainer').style.display = 'none';
                document.getElementById('goalsGrid').style.display = 'grid';
                document.getElementById('teamsContainer').style.display = 'none';

                if (filter !== 'equipos') {
                    // Restaurar fondo rojo por defecto al salir de equipos
                    const body = document.body;
                    body.classList.remove('team-al-nassr', 'team-juventus', 'team-manchester-united', 
                                        'team-real-madrid', 'team-sporting-lisboa', 'team-portugal');
                    body.classList.add('bg-rojo');
                }
                
                if (filter === 'fecha') {
                    document.getElementById('calendarContainer').style.display = 'block';
                    document.getElementById('goalsGrid').style.display = 'none';
                    initCalendar();
                } else if (filter === 'minuto') {
                    document.getElementById('minuteContainer').style.display = 'block';
                    document.getElementById('goalsGrid').style.display = 'none';
                    initMinuteClock();
                    updateMinute(4); // Empezar con minuto 4
                } else if (filter === 'equipos') {
                    document.getElementById('teamsContainer').style.display = 'block';
                    document.getElementById('goalsGrid').style.display = 'none';
                    initTeamsSelector();
                    selectTeam('Sporting Lisboa');
                } else {
                    applyFilter(filter);
                }
            });
        });

        // Aplicar filtros
        function applyFilter(filter) {
            currentPage = 1; // Resetear a la primera página
            
            switch(filter) {
                case 'all':
                    filteredData = [...goalsData];
                    break;
                case 'equipos':
                    // Implementar filtro por equipos
                    filteredData = [...goalsData];
                    break;
                case 'cuerpo':
                    // Implementar filtro por parte del cuerpo
                    filteredData = [...goalsData];
                    break;
                case 'campo':
                    // Implementar filtro por parte del campo
                    filteredData = [...goalsData];
                    break;
                case 'equipos':
                    document.getElementById('teamsContainer').style.display = 'block';
                    document.getElementById('goalsGrid').style.display = 'none';
                    initTeamsSelector();
                    selectTeam('Sporting Lisboa'); // Empezar con Portugal
                    break;
            }
            renderGoals();
        }

        // Búsqueda
        document.getElementById('searchBox').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            currentPage = 1; // Resetear a la primera página
            
            filteredData = goalsData.filter(goal => 
                goal.local.toLowerCase().includes(searchTerm) ||
                goal.visita.toLowerCase().includes(searchTerm) ||
                goal.competicion.toLowerCase().includes(searchTerm) ||
                goal.fecha.toLowerCase().includes(searchTerm)
            );
            renderGoals();
        });

        // Variables para el selector de minutos circular
        let currentMinute = 4;

        // Inicializar reloj de minutos
        function initMinuteClock() {
            const clockNumbers = document.getElementById('clockNumbers');
            const clock = document.getElementById('minuteClock');
            
            // Generar números del reloj (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120)
            const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
            let numbersHTML = '';
            
            numbers.forEach((num, index) => {
                const angle = (index * (360 / 12)) - 90; // 360/12 = 30 grados entre cada número
                const radius = 140; // Radio para posicionar los números
                const x = Math.cos(angle * Math.PI / 180) * radius + 150;
                const y = Math.sin(angle * Math.PI / 180) * radius + 150;
                
                numbersHTML += `
                    <div class="clock-number" style="left: ${x}px; top: ${y}px;">${num}</div>
                `;
            });
            
            clockNumbers.innerHTML = numbersHTML;
            
            // Eventos para interacción con el reloj
            const minuteSelector = document.getElementById('minuteSelector');
            
            // Click en el reloj
            minuteSelector.addEventListener('click', function(e) {
                const minute = getMinuteFromPosition(e.clientX, e.clientY);
                updateMinute(minute);
            });
            
            // Scroll para cambiar minutos
            clock.addEventListener('wheel', function(e) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? 1 : -1;
                const newMinute = Math.max(0, Math.min(120, currentMinute + delta));
                updateMinute(newMinute);
            });

            // Arrastrar en el reloj (mejorado para más precisión)
            let isDragging = false;
            
            minuteSelector.addEventListener('mousedown', function(e) {
                e.preventDefault();
                isDragging = true;
                const minute = getMinuteFromPosition(e.clientX, e.clientY);
                updateMinute(minute);
            });
            
            minuteSelector.addEventListener('touchstart', function(e) {
                e.preventDefault();
                isDragging = true;
                if (e.touches[0]) {
                    const minute = getMinuteFromPosition(e.touches[0].clientX, e.touches[0].clientY);
                    updateMinute(minute);
                }
            });
            
            document.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    e.preventDefault();
                    const minute = getMinuteFromPosition(e.clientX, e.clientY);
                    updateMinute(minute);
                }
            });
            
            document.addEventListener('touchmove', function(e) {
                if (isDragging && e.touches[0]) {
                    e.preventDefault();
                    const minute = getMinuteFromPosition(e.touches[0].clientX, e.touches[0].clientY);
                    updateMinute(minute);
                }
            });
            
            document.addEventListener('mouseup', function() {
                isDragging = false;
            });
            
            document.addEventListener('touchend', function() {
                isDragging = false;
            });
        }

        // Función para calcular el minuto basado en la posición del cursor
        function getMinuteFromPosition(clientX, clientY) {
            const clock = document.getElementById('minuteClock');
            const rect = clock.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = clientX - centerX;
            const mouseY = clientY - centerY;
            
            // Calcular ángulo desde el centro
            let angle = Math.atan2(mouseY, mouseX) * 180 / Math.PI;
            // Normalizar ángulo para que 0° esté arriba
            angle = (angle + 90 + 360) % 360;
            
            // Convertir ángulo a minuto (0-120)
            const minute = Math.round((angle / 360) * 120);
            return Math.max(0, Math.min(120, minute));
        }

        // Actualizar minuto seleccionado
        function updateMinute(minute) {
            currentMinute = Math.max(0, Math.min(120, minute));
            
            // Actualizar display
            document.getElementById('minuteDisplayClock').textContent = currentMinute;
            
            // Calcular posición exacta del indicador
            const visualAngle = (currentMinute / 120) * 360 - 90; // -90 para empezar desde arriba
            const radius = 140; // Mismo radio que los números
            const angleRad = visualAngle * Math.PI / 180;
            
            // Calcular coordenadas del indicador
            const indicatorX = Math.cos(angleRad) * radius + 150; // 150 es el centro del reloj
            const indicatorY = Math.sin(angleRad) * radius + 150;
            
            // Posicionar el indicador visual
            const indicator = document.getElementById('minuteIndicator');
            indicator.style.left = indicatorX + 'px';
            indicator.style.top = indicatorY + 'px';
            
            // Actualizar gradiente del reloj
            const gradientAngle = (currentMinute / 120) * 360;
            const clock = document.getElementById('minuteClock');
            clock.style.background = `conic-gradient(from 0deg, #FF0000 0deg, #FF0000 ${gradientAngle}deg, rgba(255,255,255,0.2) ${gradientAngle}deg, rgba(255,255,255,0.2) ${gradientAngle + 2}deg, #DC143C ${gradientAngle + 2}deg, #DC143C 360deg)`;
            
            // Filtrar goles por minuto
            currentPage = 1;
            filteredData = goalsData.filter(goal => {
                const goalMinute = parseInt(goal.minuto) || 0;
                return goalMinute === currentMinute;
            });
            
            // Mostrar tanto el reloj como los goles debajo
            document.getElementById('goalsGrid').style.display = 'grid';
            renderGoals();
        }

        // Selector de equipos
        function initTeamsSelector() {
            const teamLogos = document.querySelectorAll('.team-logo');
            
            teamLogos.forEach(logo => {
                logo.addEventListener('click', function() {
                    const team = this.dataset.team;
                    selectTeam(team);
                });
            });
        }

        // Seleccionar equipo
        function selectTeam(teamName) {
            currentTeam = teamName;
            
            // Actualizar logos activos
            document.querySelectorAll('.team-logo').forEach(logo => {
                logo.classList.remove('active');
                if (logo.dataset.team === teamName) {
                    logo.classList.add('active');
                }
            });
            
            // Actualizar nombre del equipo
            document.getElementById('currentTeamName').textContent = teamName.toUpperCase();
            
            // Cambiar fondo del body según el equipo
            const body = document.body;
            // Remover todas las clases de equipos
            body.classList.remove('team-al-nassr', 'team-juventus', 'team-manchester-united', 
                                'team-real-madrid', 'team-sporting-lisboa', 'team-portugal', 'bg-rojo');
            
            // Agregar clase del equipo seleccionado
            const teamClass = 'team-' + teamName.toLowerCase().replace(' ', '-');
            body.classList.add(teamClass);
            
            // Filtrar goles por equipo
            currentPage = 1;
            filteredData = goalsData.filter(goal => 
                goal.local === teamName || goal.visita === teamName
            );
            
            // Mostrar goles debajo del selector
            document.getElementById('goalsGrid').style.display = 'grid';
            renderGoals();
        } 

        // Modal de video con embed de JWPlayer
        function openVideoModal(goalNumber) {
            const goal = goalsData.find(g => g.numero === goalNumber);
            if (!goal) return;

            const modal = document.getElementById('videoModal');
            const videoContainer = document.getElementById('videoContainer');
            const goalInfo = document.getElementById('goalModalInfo');

            // Verificar si tiene código de JWPlayer
            if (!goal.codigoJWPlayer || goal.codigoJWPlayer.trim() === '') {
                videoContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 400px; background: #000; color: white; text-align: center;">
                        <div>
                            <p>Video no disponible</p>
                            <p>Gol #${goal.numero}</p>
                        </div>
                    </div>
                `;
            } else {
                // Crear iframe con el embed de JWPlayer
                videoContainer.innerHTML = `
                    <iframe 
                        src="https://cdn.jwplayer.com/players/${goal.codigoJWPlayer}-sfGpVx0W.html" 
                        width="100%" 
                        height="400" 
                        frameborder="0" 
                        scrolling="auto" 
                        allowfullscreen
                        title="Gol ${goal.numero} de Cristiano Ronaldo">
                    </iframe>
                `;
            }

            goalInfo.innerHTML = `
                <h3>Gol #${goal.numero}</h3>
                <p><strong>Fecha:</strong> ${goal.fecha}</p>
                <p><strong>Partido:</strong> ${goal.local} ${goal.resultado} ${goal.visita}</p>
                <p><strong>Competición:</strong> ${goal.competicion}</p>
                <p><strong>Parte del cuerpo:</strong> ${goal.parteCuerpo}</p>
                <p><strong>Situación:</strong> ${goal.situacion}</p>
                <p><strong>Minuto:</strong> ${goal.minuto}'</p>
            `;

            modal.style.display = 'block';
        }

        // Cerrar modal
        document.querySelector('.close').addEventListener('click', function() {
            document.getElementById('videoModal').style.display = 'none';
            // Limpiar iframe para detener reproducción
            document.getElementById('videoContainer').innerHTML = '';
        });

        // Calendario
        let currentMonth = 0; // Enero
        const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                       'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

        function initCalendar() {
            renderCalendar();
        }

        function renderCalendar() {
            const header = document.querySelector('.calendar-header');
            const grid = document.getElementById('calendarGrid');
            
            header.textContent = months[currentMonth];
            
            // Generar días del mes
            const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();
            let daysHTML = '';
            
            for (let i = 1; i <= daysInMonth; i++) {
                const hasGoals = Math.random() > 0.7; // Simulación
                daysHTML += `
                    <div class="calendar-day ${hasGoals ? 'has-goals' : ''}" 
                         onclick="filterByDate(${i}, ${currentMonth})">
                        ${i}
                    </div>
                `;
            }
            
            grid.innerHTML = daysHTML;
        }

        function filterByDate(day, month) {
            const monthName = months[month].toLowerCase();
            currentPage = 1; // Resetear página
            
            filteredData = goalsData.filter(goal => 
                goal.fecha.toLowerCase().includes(`${day} de ${monthName}`)
            );
            
            document.getElementById('calendarContainer').style.display = 'none';
            document.getElementById('goalsGrid').style.display = 'grid';
            renderGoals();
        }

        // Navegación del calendario
        document.getElementById('prevMonth').addEventListener('click', function() {
            currentMonth = currentMonth > 0 ? currentMonth - 1 : 11;
            renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', function() {
            currentMonth = currentMonth < 11 ? currentMonth + 1 : 0;
            renderCalendar();
        });

        // Inicializar aplicación con optimizaciones SEO
        document.addEventListener('DOMContentLoaded', function() {
            // Cargar datos de forma asíncrona después del contenido crítico
            setTimeout(() => {
                loadGoalsData();
            }, 100);
            
            // Lazy loading para videos
            if ('IntersectionObserver' in window) {
                const videoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const videoElement = entry.target;
                            // Cargar video cuando sea necesario
                            videoObserver.unobserve(videoElement);
                        }
                    });
                });
            }
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('videoModal');
            if (event.target === modal) {
                modal.style.display = 'none';
                // Limpiar iframe para detener reproducción
                document.getElementById('videoContainer').innerHTML = '';
            }
        });