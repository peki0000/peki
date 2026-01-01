// TVOJ DISCORD ID
const DISCORD_ID = "592669287743881217"; 

document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const mainContent = document.getElementById('main-content');
    const audio = document.getElementById('audio-player');
    const volumeSlider = document.getElementById('volume-slider');
    const zvucnikDugme = document.getElementById('zvucnik');

    const avatarImg = document.getElementById('discord-avatar');
    const statusIndicator = document.getElementById('status-indicator');
    const usernameText = document.getElementById('discord-username');
    const statusText = document.getElementById('discord-status-text');

    // --- SNEG EFEKAT ---
    function createSnow() {
        const snowContainer = document.getElementById('snow-container');
        if(!snowContainer) return; 
        
        const numberOfSnowflakes = 40; 
        for (let i = 0; i < numberOfSnowflakes; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.style.left = Math.random() * 100 + 'vw';
            const size = Math.random() * 3 + 2 + 'px';
            snowflake.style.width = size;
            snowflake.style.height = size;
            snowflake.style.animationDuration = Math.random() * 10 + 5 + 's';
            snowflake.style.animationDelay = Math.random() * 5 + 's';
            snowflake.style.opacity = Math.random() * 0.5 + 0.3;
            snowContainer.appendChild(snowflake);
        }
    }
    createSnow();

    // POSTAVKA ZVUKA
    if(audio && volumeSlider) {
        audio.volume = parseFloat(volumeSlider.value);
    }

    // --- 1. KLIK NA EKRAN (POČETAK) ---
    if(startScreen) {
        startScreen.addEventListener('click', () => {
            startScreen.style.opacity = '0';
            setTimeout(() => { startScreen.style.display = 'none'; }, 800);
            if(mainContent) mainContent.style.opacity = '1';
            if(audio) audio.play().catch(err => console.log("Audio autoplay block:", err));
        });
    }

    // --- 2. LOGIKA ZA GAŠENJE ZVUKA (MUTE) ---
    if(zvucnikDugme) {
        zvucnikDugme.addEventListener('click', () => {
            if (audio.muted) {
                audio.muted = false;
                zvucnikDugme.style.opacity = "1";
            } else {
                audio.muted = true;
                zvucnikDugme.style.opacity = "0.3";
            }
        });
    }

    // --- 3. SLAJDER LOGIKA ---
    if(volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            const val = parseFloat(volumeSlider.value);
            if(audio) audio.volume = val;
            if(audio.muted) {
                audio.muted = false;
                if(zvucnikDugme) zvucnikDugme.style.opacity = "1";
            }
        });
    }

    // --- 4. DISCORD STATUS ---
    async function updateDiscordStatus() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
            const json = await response.json();

            if (json.success) {
                const data = json.data;
                const user = data.discord_user;

                if(usernameText) usernameText.innerText = user.username;

                if(avatarImg) {
                    let avatarUrl = "default.jpg";
                    if (user.avatar) {
                        const extension = user.avatar.startsWith("a_") ? "gif" : "png";
                        avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=512`;
                    }
                    avatarImg.src = avatarUrl;
                    
                    const status = data.discord_status;
                    avatarImg.className = ''; 
                    if(statusIndicator) statusIndicator.className = '';

                    switch(status) {
                        case 'online': avatarImg.classList.add('online-border'); statusIndicator.classList.add('online-bg'); break;
                        case 'idle': avatarImg.classList.add('idle-border'); statusIndicator.classList.add('idle-bg'); break;
                        case 'dnd': avatarImg.classList.add('dnd-border'); statusIndicator.classList.add('dnd-bg'); break;
                        default: avatarImg.classList.add('offline-border'); statusIndicator.classList.add('offline-bg');
                    }
                }

                if(statusText) {
                    let activityText = "Chilling";
                    const activity = data.activities.find(a => a.type === 0);
                    const spotify = data.listening_to_spotify;
                    const custom = data.activities.find(a => a.type === 4);

                    if (activity) {
                        activityText = `Playing: ${activity.name}`;
                        if(activity.details) activityText += `\n${activity.details}`;
                    } else if (spotify) {
                        activityText = `Listening to: ${data.spotify.song}`;
                    } else if (custom && custom.state) {
                        activityText = custom.state;
                    } else {
                        if(status === 'online') activityText = "Online";
                        if(status === 'dnd') activityText = "Do Not Disturb";
                        if(status === 'idle') activityText = "AFK";
                        if(status === 'offline') activityText = "Offline";
                    }
                    statusText.innerText = activityText;
                }
            }
        } catch (error) {
            console.error(error);
            if(statusText) statusText.innerText = "Offline";
        }
    }

    // --- 5. WIDGETI: VREME I SAT ---
    function updateWidgets() {
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');
        const now = new Date();
        
        const optionsTime = { timeZone: 'Europe/Belgrade', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const optionsDate = { timeZone: 'Europe/Belgrade', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        if(timeElement) timeElement.innerText = new Intl.DateTimeFormat('en-GB', optionsTime).format(now);
        if(dateElement) dateElement.innerText = new Intl.DateTimeFormat('en-GB', optionsDate).format(now);

        const currentDay = new Date().getDay(); 
        const days = document.querySelectorAll('.day-item');
        days.forEach(day => {
            day.classList.remove('active');
            if (parseInt(day.getAttribute('data-day')) === currentDay) {
                day.classList.add('active');
            }
        });
    }

    // --- 6. POPRAVLJENA FUNKCIJA ZA VREME (NOVO) ---
    async function getWeather() {
        try {
            // Dodajemo timestamp (cacheBuster) da se podaci uvek osveže
            const cacheBuster = new Date().getTime();
            
            // URL sa eksplicitnim parametrima za Pančevo
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=44.8708&longitude=20.6403&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FBelgrade&forecast_days=1&t=${cacheBuster}`);
            
            if (!response.ok) throw new Error("API nije dostupan");
            
            const data = await response.json();
            
            // Sigurna provera da li postoje podaci
            if (!data.current) throw new Error("Fale trenutni podaci");

            const temp = Math.round(data.current.temperature_2m);
            const wind = data.current.wind_speed_10m;
            const code = data.current.weather_code;

            const tempEl = document.getElementById('temperature');
            const windEl = document.getElementById('wind-speed');
            const descEl = document.getElementById('weather-desc');
            const iconEl = document.getElementById('weather-icon');

            if(tempEl) tempEl.innerText = `${temp}°C`;
            if(windEl) windEl.innerText = `Wind: ${wind} km/h`;

            let desc = "Clear Sky";
            let icon = "☀️";

            // WMO kodovi za vreme
            if (code >= 1 && code <= 3) { desc = "Partly Cloudy"; icon = "⛅"; }
            else if (code >= 45 && code <= 48) { desc = "Foggy"; icon = "🌫️"; }
            else if (code >= 51 && code <= 67) { desc = "Rainy"; icon = "🌧️"; }
            else if (code >= 71 && code <= 86) { desc = "Snow"; icon = "❄️"; }
            else if (code >= 95) { desc = "Thunderstorm"; icon = "⚡"; }

            if(descEl) descEl.innerText = desc;
            if(iconEl) iconEl.innerText = icon;

        } catch (error) { 
            console.error("Greška sa vremenom:", error);
            const tempEl = document.getElementById('temperature');
            // Ako pukne API, ispiši "--" da ne zbunjuje nula
            if(tempEl) tempEl.innerText = "--°C";
            
            const descEl = document.getElementById('weather-desc');
            if(descEl) descEl.innerText = "Connection Error";
        }
    }

    // POKRETANJE SVEGA
    updateDiscordStatus();
    setInterval(updateDiscordStatus, 5000);

    setInterval(updateWidgets, 1000);
    updateWidgets();
    
    // Odmah pozovi vreme i osvežavaj na 10 minuta
    getWeather();
    setInterval(getWeather, 600000); 
});

// --- KOPIRANJE ADRESA ---
window.copyCrypto = function(address, element) {
    navigator.clipboard.writeText(address).then(() => {
        const statusSpan = element.querySelector('.crypto-status');
        const originalText = statusSpan.innerText;
        
        element.classList.add('copied-success');
        statusSpan.innerText = "COPIED!";
        
        setTimeout(() => {
            element.classList.remove('copied-success');
            statusSpan.innerText = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}