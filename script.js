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

    // --- NOVO: FUNKCIJA ZA SNEG ---
    function createSnow() {
        const snowContainer = document.getElementById('snow-container');
        const numberOfSnowflakes = 50; // Broj pahuljica (50 je optimalno za mobilni)

        for (let i = 0; i < numberOfSnowflakes; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            
            // Random pozicija (levo-desno)
            snowflake.style.left = Math.random() * 100 + 'vw';
            
            // Random veličina (od 2px do 5px)
            const size = Math.random() * 3 + 2 + 'px';
            snowflake.style.width = size;
            snowflake.style.height = size;
            
            // Random brzina padanja (između 5s i 15s)
            snowflake.style.animationDuration = Math.random() * 10 + 5 + 's';
            
            // Random kašnjenje (da ne krenu sve odjednom)
            snowflake.style.animationDelay = Math.random() * 5 + 's';
            
            // Random providnost
            snowflake.style.opacity = Math.random() * 0.5 + 0.3;

            snowContainer.appendChild(snowflake);
        }
    }

    // Pokreni sneg odmah
    createSnow();

    // Postavi početnu jačinu
    audio.volume = parseFloat(volumeSlider.value);

    // --- 1. KLIK NA EKRAN (POČETAK) ---
    startScreen.addEventListener('click', () => {
        startScreen.style.opacity = '0';
        setTimeout(() => { startScreen.style.display = 'none'; }, 800);
        mainContent.style.opacity = '1';
        audio.play().catch(err => console.log(err));
    });

    // --- 2. LOGIKA ZA GAŠENJE ZVUKA (MUTE) ---
    zvucnikDugme.addEventListener('click', () => {
        if (audio.muted) {
            audio.muted = false;
            zvucnikDugme.style.opacity = "1";
        } else {
            audio.muted = true;
            zvucnikDugme.style.opacity = "0.3";
        }
    });

    // --- 3. SLAJDER LOGIKA ---
    volumeSlider.addEventListener('input', () => {
        const val = parseFloat(volumeSlider.value);
        audio.volume = val;
        if(audio.muted) {
            audio.muted = false;
            zvucnikDugme.style.opacity = "1";
        }
    });

    // --- 4. DISCORD STATUS ---
    async function updateDiscordStatus() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
            const json = await response.json();

            if (json.success) {
                const data = json.data;
                const user = data.discord_user;

                usernameText.innerText = user.username;

                let avatarUrl = "default.jpg";
                if (user.avatar) {
                    const extension = user.avatar.startsWith("a_") ? "gif" : "png";
                    avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=512`;
                }
                avatarImg.src = avatarUrl;

                const status = data.discord_status;
                avatarImg.className = ''; 
                statusIndicator.className = '';

                switch(status) {
                    case 'online':
                        avatarImg.classList.add('online-border');
                        statusIndicator.classList.add('online-bg');
                        break;
                    case 'idle':
                        avatarImg.classList.add('idle-border');
                        statusIndicator.classList.add('idle-bg');
                        break;
                    case 'dnd':
                        avatarImg.classList.add('dnd-border');
                        statusIndicator.classList.add('dnd-bg');
                        break;
                    default:
                        avatarImg.classList.add('offline-border');
                        statusIndicator.classList.add('offline-bg');
                }

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
        } catch (error) {
            console.error(error);
            statusText.innerText = "Offline";
        }
    }

    updateDiscordStatus();
    setInterval(updateDiscordStatus, 5000);
});