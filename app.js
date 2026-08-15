import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuración de Supabase
const SUPABASE_URL = 'https://uazbmforbmnacnljscgm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sLtMqBSM84p8UTyHiCLovw_2MjCZM6R';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATALOG_PIZZERIAS = [
    {
        id: 'pizza-01',
        name: 'La Napoletana Supremma',
        pizzeria: 'LA CABAÑA',
        ingredients: 'Masa de fermentación lenta (72h), salsa San Marzano, mozzarella fior di latte, albahaca fresca, aceite de oliva virgen extra y prosciutto di Parma.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'pizza-02',
        name: 'Quattro Formaggi Trufada',
        pizzeria: 'Trattoria Bella Napoli',
        ingredients: 'Mozzarella di bufala, gorgonzola cremoso, fontina alpina, parmigiano reggiano y crema de trufa negra silvestre.',
        image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'pizza-03',
        name: 'Pepperoni Artisan Hot Honey',
        pizzeria: 'Brooklyn Slice Co.',
        ingredients: 'Doble capa de pepperoni crujiente artesanal, mozzarella ahumada, orégano silvestre y baño de miel picante infusionada con chiles habaneros.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'pizza-04',
        name: 'Burrata & Pesto Gourmet',
        pizzeria: 'L\'Artigiano Pizza Lab',
        ingredients: 'Burrata fresca de 150g entera en el centro, pesto artesanal de piñones y albahaca, tomates cherry confitados y reducción de balsámico.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'pizza-05',
        name: 'Smoked BBQ Carnivora',
        pizzeria: 'Master Smokehouse Pizza',
        ingredients: 'Brisket ahumado en leña de roble por 12 horas, pulled pork, tocineta crujiente, queso cheddar madurado y salsa barbacoa de la casa.',
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'pizza-06',
        name: 'Huerta Mediterránea',
        pizzeria: 'Verde & Leña Bio',
        ingredients: 'Berenjenas asadas, alcachofas marinadas, pimientos rojos ahumados, aceitunas kalamata, rúgula fresca y queso de cabra artesanal.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'pizza-07',
        name: 'Mexicana Fuego Criollo',
        pizzeria: 'Taquería & Pizza El Ranchero',
        ingredients: 'Carne molida sazonada, jalapeños frescos, maíz dulce, guacamole rústico, pico de gallo, queso fundido y nachos crujientes de topping.',
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'pizza-08',
        name: 'Mamma Mia Carbonara',
        pizzeria: 'Antica Pizzeria Romana',
        ingredients: 'Salsa carbonara auténtica con yema de huevo organic, guanciale crujiente, abundante queso pecorino romano y pimienta negra recién molida.',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80'
    }
];

class PizzaFestApp {
    constructor() {
        this.currentUser = null;
        this.userVotes = {}; 
        this.selectedStars = {}; 
        this.authMode = 'login'; 
        this.currentTab = 'pizzerias';

        // Variables Admin
        this.adminEmail = 'admin@pizzafestmagangue.com';
        this.allVotes = [];
        this.adminChannel = null;

        this.initApp();
    }

    async initApp() {
        const { data: { session } } = await supabase.auth.getSession();
        this.currentUser = session?.user || null;
        
        if (this.currentUser) {
            await this.loadUserVotes();
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
            this.currentUser = session?.user || null;
            if (this.currentUser) {
                await this.loadUserVotes();
                this.updateUIForUser();
            } else {
                this.userVotes = {};
                this.updateUIForUser();
            }
        });

        this.updateUIForUser();
        this.renderPizzeriasCatalog();
    }

    async loadUserVotes() {
        if (!this.currentUser) return;
        const { data, error } = await supabase
            .from('votes')
            .select('*')
            .eq('user_id', this.currentUser.id);

        if (!error && data) {
            this.userVotes = {};
            data.forEach(v => {
                this.userVotes[v.pizzeria_id] = { stars: v.stars, timestamp: v.created_at };
            });
            this.updateVoteCountersUI();
            this.renderPizzeriasCatalog();
            this.renderMyVotes();
        }
    }

    updateUIForUser() {
        const btnOpenAuth = document.getElementById('btn-open-auth');
        const userProfileMenu = document.getElementById('user-profile-menu');
        const userDisplayEmail = document.getElementById('user-display-email');
        const tabAdmin = document.getElementById('tab-admin');

        if (this.currentUser) {
            btnOpenAuth.classList.add('hidden');
            userProfileMenu.classList.remove('hidden');
            if (userDisplayEmail) {
                userDisplayEmail.textContent = this.currentUser.email;
            }
            
            // Lógica Exclusiva Admin (Control de interfaz)
            if (this.currentUser.email === this.adminEmail) {
                if(tabAdmin) tabAdmin.classList.remove('hidden');
                this.setupAdminRealtime(); // Iniciar escucha de Supabase
            } else {
                if(tabAdmin) tabAdmin.classList.add('hidden');
                if (this.currentTab === 'admin') this.switchTab('pizzerias');
            }
        } else {
            btnOpenAuth.classList.remove('hidden');
            userProfileMenu.classList.add('hidden');
            if(tabAdmin) tabAdmin.classList.add('hidden');
            if (this.currentTab === 'admin') this.switchTab('pizzerias');
        }
        this.updateVoteCountersUI();
    }

    updateVoteCountersUI() {
        const votesCast = Object.keys(this.userVotes).length;
        const remaining = Math.max(0, 7 - votesCast);
        const el = document.getElementById('user-remaining-votes');
        if (el) el.textContent = `${remaining}/7`;
    }

    async submitVote(pizzeriaId) {
        if (!this.currentUser) {
            this.showToast('Debes iniciar sesión para poder votar', 'error');
            this.openAuthModal();
            return;
        }

        const chosenStars = this.selectedStars[pizzeriaId] || (this.userVotes[pizzeriaId]?.stars || 0);

        if (chosenStars < 1 || chosenStars > 5) {
            this.showToast('Por favor selecciona entre 1 y 5 estrellas antes de votar', 'warning');
            return;
        }

        const isNewVote = !this.userVotes[pizzeriaId];
        const currentTotalVotes = Object.keys(this.userVotes).length;

        if (isNewVote && currentTotalVotes >= 7) {
            this.showToast('Has alcanzado el límite máximo de 7 votos permitidos', 'error');
            return;
        }

        const { error } = await supabase
            .from('votes')
            .upsert({
                user_id: this.currentUser.id,
                pizzeria_id: pizzeriaId,
                stars: chosenStars,
                created_at: new Date().toISOString()
            }, { onConflict: 'user_id,pizzeria_id' });

        if (error) {
            this.showToast('Error al registrar el voto: ' + error.message, 'error');
            return;
        }

        this.userVotes[pizzeriaId] = { stars: chosenStars, timestamp: new Date().toISOString() };
        this.updateVoteCountersUI();
        this.renderPizzeriasCatalog();
        this.renderMyVotes();
        this.showToast(`¡Voto de ${chosenStars} estrellas registrado exitosamente!`, 'success');
    }

    async handleAuthSubmit(event) {
        event.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const errorDiv = document.getElementById('auth-error-msg');
        errorDiv.classList.add('hidden');

        try {
            if (this.authMode === 'register') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                
                if (data.session) {
                    this.currentUser = data.session.user;
                    this.updateUIForUser();
                    this.showToast('¡Cuenta creada e inicio de sesión exitoso!', 'success');
                } else {
                    this.showToast('¡Cuenta creada! Revisa tu correo o intenta iniciar sesión.', 'success');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                
                this.currentUser = data.session.user;
                this.updateUIForUser();
                this.showToast('¡Bienvenido de nuevo a Pizza Fest Magangé!', 'success');
            }

            this.closeAuthModal();
        } catch (err) {
            errorDiv.textContent = err.message || 'Ocurrió un error en la autenticación.';
            errorDiv.classList.remove('hidden');
        }
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            this.currentUser = null;
            this.userVotes = {};
            this.updateUIForUser();
            this.renderPizzeriasCatalog();
            this.renderMyVotes();
            this.showToast('Has cerrado sesión correctamente', 'info');
        } else {
            this.showToast('Error al cerrar sesión', 'error');
        }
    }

    openAuthModal() {
        document.getElementById('auth-modal')?.classList.remove('hidden');
        this.setAuthMode(this.authMode || 'login');
    }

    closeAuthModal() {
        document.getElementById('auth-modal')?.classList.add('hidden');
    }

    setAuthMode(mode) {
        this.authMode = mode;
        const tabLogin = document.getElementById('auth-tab-login');
        const tabRegister = document.getElementById('auth-tab-register');
        const btnText = document.getElementById('auth-btn-text');
        const errorMsg = document.getElementById('auth-error-msg');

        if (errorMsg) errorMsg.classList.add('hidden');

        if (mode === 'register') {
            tabRegister.className = 'py-3 text-center text-white bg-zinc-900 rounded-xl transition';
            tabLogin.className = 'py-3 text-center text-zinc-400 hover:text-white transition';
            btnText.textContent = 'Crear Cuenta y Votar';
        } else {
            tabLogin.className = 'py-3 text-center text-white bg-zinc-900 rounded-xl transition';
            tabRegister.className = 'py-3 text-center text-zinc-400 hover:text-white transition';
            btnText.textContent = 'Iniciar Sesión';
        }
    }

    onStarHover(pizzeriaId, hoverRating) {
        const container = document.getElementById(`stars-container-${pizzeriaId}`);
        if (!container) return;
        container.querySelectorAll('i').forEach((star, idx) => {
            star.className = idx < hoverRating ? 'fa-solid fa-star text-amber-400 cursor-pointer text-2xl md:text-xl' : 'fa-regular fa-star text-zinc-600 cursor-pointer text-2xl md:text-xl';
        });
    }

    onStarLeave(pizzeriaId) {
        const currentRating = this.selectedStars[pizzeriaId] || (this.userVotes[pizzeriaId]?.stars || 0);
        this.updateStarDisplay(pizzeriaId, currentRating);
    }

    onStarClick(pizzeriaId, rating) {
        this.selectedStars[pizzeriaId] = rating;
        this.updateStarDisplay(pizzeriaId, rating);
        const valLabel = document.getElementById(`star-value-text-${pizzeriaId}`);
        if (valLabel) valLabel.textContent = `${rating} estrella${rating > 1 ? 's' : ''}`;
    }

    updateStarDisplay(pizzeriaId, rating) {
        const container = document.getElementById(`stars-container-${pizzeriaId}`);
        if (!container) return;
        container.querySelectorAll('i').forEach((star, idx) => {
            star.className = idx < rating ? 'fa-solid fa-star text-amber-400 cursor-pointer text-2xl md:text-xl' : 'fa-regular fa-star text-zinc-600 cursor-pointer text-2xl md:text-xl';
        });
    }

    renderPizzeriasCatalog() {
        const grid = document.getElementById('pizzerias-grid');
        if (!grid) return;

        document.getElementById('proposal-count-badge').textContent = `${CATALOG_PIZZERIAS.length} Locales`;

        grid.innerHTML = CATALOG_PIZZERIAS.map(p => {
            const existingVote = this.userVotes[p.id];
            const activeRating = this.selectedStars[p.id] || (existingVote ? existingVote.stars : 0);

            const starsHtml = [1, 2, 3, 4, 5].map(starNum => {
                const iconClass = starNum <= activeRating ? 'fa-solid fa-star text-amber-400' : 'fa-regular fa-star text-zinc-600';
                return `<i class="${iconClass} cursor-pointer text-2xl md:text-xl" 
                           onmouseenter="app.onStarHover('${p.id}', ${starNum})" 
                           onmouseleave="app.onStarLeave('${p.id}')" 
                           onclick="app.onStarClick('${p.id}', ${starNum})"></i>`;
            }).join(' ');

            const btnText = existingVote ? 'Actualizar Voto' : 'Registrar Voto';
            const btnBadge = existingVote ? `<span class="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold ml-auto"><i class="fa-solid fa-check mr-1"></i>Votado (${existingVote.stars}★)</span>` : '';

            return `
                <div class="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg hover:border-brand-500/50 transition-all flex flex-col">
                    <div class="relative h-56 md:h-48 overflow-hidden bg-black">
                        <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transform hover:scale-105 transition duration-500" onerror="this.src='https://placehold.co/600x400/000000/f97316?text=Pizza+Fest'">
                        <div class="absolute top-3 left-3 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm md:text-xs font-bold text-amber-400 border border-zinc-700 flex items-center gap-1.5">
                            <i class="fa-solid fa-store"></i> ${p.pizzeria}
                        </div>
                    </div>
                    <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <h4 class="font-bold text-lg md:text-base text-white line-clamp-1">${p.name}</h4>
                                ${btnBadge}
                            </div>
                            <p class="text-sm md:text-xs text-zinc-400 line-clamp-3">${p.ingredients}</p>
                        </div>
                        <div class="pt-4 border-t border-zinc-800 space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-sm md:text-xs text-zinc-400 font-medium">Tu Calificación:</span>
                                <span id="star-value-text-${p.id}" class="text-sm md:text-xs font-bold text-amber-400">
                                    ${activeRating > 0 ? `${activeRating} estrella${activeRating > 1 ? 's' : ''}` : 'Sin calificar'}
                                </span>
                            </div>
                            <div id="stars-container-${p.id}" class="flex items-center justify-center gap-3 py-2 bg-black/50 rounded-xl border border-zinc-800">
                                ${starsHtml}
                            </div>
                            <button onclick="app.submitVote('${p.id}')" class="w-full py-3 md:py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm md:text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2">
                                <i class="fa-solid fa-check-to-slot"></i>
                                <span>${btnText}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMyVotes() {
        const list = document.getElementById('my-votes-list');
        const empty = document.getElementById('my-votes-empty');
        if (!list || !empty) return;

        const userVoteKeys = Object.keys(this.userVotes);
        if (userVoteKeys.length === 0) {
            list.classList.add('hidden');
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        list.classList.remove('hidden');

        list.innerHTML = userVoteKeys.map(pizzId => {
            const vote = this.userVotes[pizzId];
            const pizzeria = CATALOG_PIZZERIAS.find(p => p.id === pizzId) || { name: pizzId, pizzeria: 'Local', image: 'https://placehold.co/600x400/000000/f97316?text=Pizza' };
            const starsHtml = [1, 2, 3, 4, 5].map(s => 
                `<i class="${s <= vote.stars ? 'fa-solid fa-star text-amber-400' : 'fa-regular fa-star text-zinc-600'} text-base md:text-sm"></i>`
            ).join(' ');

            const dateStr = vote.timestamp ? new Date(vote.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Reciente';

            return `
                <div class="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 md:p-5 flex gap-4 items-center shadow">
                    <img src="${pizzeria.image}" class="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover flex-shrink-0" onerror="this.src='https://placehold.co/100x100/000000/f97316?text=Pizza'">
                    <div class="flex-1 min-w-0 space-y-1.5">
                        <span class="text-xs font-semibold text-brand-400 uppercase tracking-wider">${pizzeria.pizzeria}</span>
                        <h4 class="text-base md:text-sm font-bold text-white truncate">${pizzeria.name}</h4>
                        <div class="flex items-center gap-1">${starsHtml}</div>
                        <span class="text-xs text-zinc-400 block"><i class="fa-regular fa-clock mr-1"></i>${dateStr}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    switchTab(tabName) {
        // Validación estricta de seguridad: Evitar acceso a 'admin' si no es el administrador
        if (tabName === 'admin' && (!this.currentUser || this.currentUser.email !== this.adminEmail)) {
            this.showToast('Acceso denegado: Área exclusiva de administración.', 'error');
            return; // Detiene la ejecución y evita que se renderice
        }

        this.currentTab = tabName;
        
        // Ocultar todas las vistas y resetear estilos
        ['pizzerias', 'my-votes', 'admin'].forEach(tab => {
            const view = document.getElementById(`view-${tab}`);
            const btn = document.getElementById(`tab-${tab}`);
            if (view) view.classList.add('hidden');
            if (btn) {
                btn.className = 'px-4 py-3 md:py-2 rounded-xl font-semibold text-sm text-zinc-400 hover:text-white transition-all w-full lg:w-auto text-center flex justify-center items-center gap-2';
            }
        });

        // Activar la vista actual
        const activeView = document.getElementById(`view-${tabName}`);
        const activeBtn = document.getElementById(`tab-${tabName}`);
        
        if (activeView) activeView.classList.remove('hidden');
        if (activeBtn) {
            activeBtn.className = 'px-4 py-3 md:py-2 rounded-xl font-semibold text-sm transition-all bg-brand-500 text-white shadow w-full lg:w-auto text-center flex justify-center items-center gap-2';
        }

        if (tabName === 'my-votes') this.renderMyVotes();
        if (tabName === 'admin') this.renderAdminDashboard();
    }

    setupAdminRealtime() {
        // Validación estricta de seguridad
        if (!this.currentUser || this.currentUser.email !== this.adminEmail) return;
        if (this.adminChannel) return;
        
        this.fetchAdminData(); 

        // Escuchar cambios en la tabla 'votes' en tiempo real
        this.adminChannel = supabase.channel('admin-votes-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, payload => {
                this.fetchAdminData();
            })
            .subscribe();
    }

    async fetchAdminData() {
        // Validación estricta de seguridad
        if (!this.currentUser || this.currentUser.email !== this.adminEmail) return;

        const { data, error } = await supabase.from('votes').select('*');
        if (!error && data) {
            this.allVotes = data;
            if (this.currentTab === 'admin') {
                this.renderAdminDashboard();
            }
        }
    }

    renderAdminDashboard() {
        // Validación estricta de seguridad
        if (!this.currentUser || this.currentUser.email !== this.adminEmail) return;

        const container = document.getElementById('admin-dashboard-content');
        if (!container) return;

        // Calcular votos, puntajes totales y promedios
        const stats = CATALOG_PIZZERIAS.map(p => {
            const pVotes = this.allVotes.filter(v => v.pizzeria_id === p.id);
            const totalVotes = pVotes.length;
            const totalStars = pVotes.reduce((sum, v) => sum + v.stars, 0);
            // Calculamos el promedio exacto (ej: 4.5)
            const avgStars = totalVotes > 0 ? (totalStars / totalVotes).toFixed(1) : '0.0';
            return { ...p, totalVotes, totalStars, avgStars };
        }).sort((a, b) => b.totalStars - a.totalStars); // El ranking se basa en puntos totales

        const maxStars = Math.max(...stats.map(s => s.totalStars), 1);
        const totalVotesOverall = this.allVotes.length;
        // Identificamos al líder (siempre que tenga al menos 1 voto)
        const leader = stats[0].totalVotes > 0 ? stats[0] : null;

        let html = `
            <div class="space-y-8">
                <!-- Tarjeta de Resumen Global -->
                <div class="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 md:p-6 flex items-center justify-between shadow-lg">
                    <div>
                        <h4 class="text-zinc-400 text-xs md:text-sm font-semibold uppercase tracking-wider mb-1">Votos Registrados en Tiempo Real</h4>
                        <strong class="text-3xl md:text-4xl text-brand-500 font-black">${totalVotesOverall}</strong>
                    </div>
                    <div class="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-zinc-800">
                        <i class="fa-solid fa-chart-pie text-xl text-zinc-500"></i>
                    </div>
                </div>
        `;

        // Tarjeta del Líder Destacado (Solo se muestra si ya hay votos)
        if (leader) {
            html += `
                <div class="bg-gradient-to-br from-amber-500/20 to-brand-600/20 rounded-3xl border border-amber-500/50 p-1 relative overflow-hidden shadow-2xl shadow-amber-500/10">
                    <div class="absolute top-0 right-0 bg-amber-500 text-black text-[10px] md:text-xs font-black uppercase px-4 py-1.5 rounded-bl-xl z-10 shadow">
                        <i class="fa-solid fa-crown mr-1"></i> Líder Actual
                    </div>
                    <div class="bg-black/60 backdrop-blur-md rounded-[22px] p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                        
                        <!-- Imagen del Líder -->
                        <div class="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 mt-4 md:mt-0">
                            <div class="absolute inset-0 bg-amber-500 rounded-full animate-pulse blur-md opacity-50"></div>
                            <img src="${leader.image}" alt="${leader.name}" class="relative w-full h-full object-cover rounded-full border-4 border-amber-400 shadow-lg" onerror="this.src='https://placehold.co/400x400/000000/f97316?text=Pizza'">
                        </div>

                        <!-- Detalles del Líder -->
                        <div class="flex-1 text-center md:text-left space-y-4 w-full">
                            <div>
                                <span class="inline-block bg-amber-500/20 text-amber-400 text-[10px] md:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-amber-500/30 mb-2">
                                    <i class="fa-solid fa-store mr-1"></i> ${leader.pizzeria}
                                </span>
                                <h3 class="text-2xl md:text-3xl font-black text-white leading-tight">${leader.name}</h3>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-2 md:gap-4 pt-2">
                                <div class="bg-black/50 border border-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center">
                                    <span class="text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Puntos</span>
                                    <strong class="text-lg md:text-xl text-white">${leader.totalStars} <i class="fa-solid fa-star text-amber-400 text-xs"></i></strong>
                                </div>
                                <div class="bg-black/50 border border-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center">
                                    <span class="text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Promedio</span>
                                    <strong class="text-lg md:text-xl text-white">${leader.avgStars} <span class="text-xs text-zinc-500">/ 5</span></strong>
                                </div>
                                <div class="bg-black/50 border border-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center">
                                    <span class="text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Votos</span>
                                    <strong class="text-lg md:text-xl text-white">${leader.totalVotes}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Lista de Clasificación Detallada para todos los productos
        html += `
            <div class="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-lg">
                <h4 class="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-4 flex items-center gap-2">
                    <i class="fa-solid fa-list-ol text-brand-500"></i> Tabla de Posiciones General
                </h4>
                <div class="space-y-6">
        `;

        stats.forEach((stat, index) => {
            const percentage = maxStars > 0 ? ((stat.totalStars / maxStars) * 100).toFixed(1) : 0;
            const isLeader = index === 0 && stat.totalVotes > 0;
            
            // Colores para el podio (Oro, Plata, Bronce)
            const rankColor = index === 0 ? 'text-amber-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-700' : 'text-zinc-600';
            
            html += `
                <div class="space-y-2.5 group">
                    <div class="flex justify-between items-end gap-3">
                        
                        <!-- Info Restaurante / Pizza -->
                        <div class="flex items-start gap-3 md:gap-4 min-w-0">
                            <span class="font-black text-lg md:text-2xl ${rankColor} w-6 text-right mt-0.5">${index + 1}.</span>
                            <div class="min-w-0">
                                <h5 class="font-bold text-white text-sm md:text-base truncate group-hover:text-brand-400 transition-colors">${stat.name}</h5>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <span class="text-[10px] md:text-xs text-zinc-400 truncate">${stat.pizzeria}</span>
                                    <span class="w-1 h-1 rounded-full bg-zinc-700"></span>
                                    <span class="text-[10px] md:text-xs text-brand-400 font-semibold"><i class="fa-solid fa-star text-[10px] mr-0.5"></i>${stat.avgStars}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Info Puntaje -->
                        <div class="text-right flex-shrink-0">
                            <span class="text-white font-black text-sm md:text-lg block leading-none">${stat.totalStars} <span class="text-brand-500 text-xs md:text-sm">pts</span></span>
                            <span class="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-wide mt-1 block">${stat.totalVotes} votos</span>
                        </div>
                    </div>
                    
                    <!-- Barra de Progreso -->
                    <div class="w-full bg-black rounded-full h-2 md:h-2.5 border border-zinc-800 overflow-hidden relative shadow-inner">
                        <div class="bg-gradient-to-r ${isLeader ? 'from-amber-600 to-amber-400' : 'from-brand-700 to-brand-500'} h-full rounded-full transition-all duration-1000 ease-out relative" style="width: ${percentage}%">
                            ${isLeader ? '<div class="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        </div>`;
        
        container.innerHTML = html;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `p-4 rounded-2xl shadow-xl text-sm font-bold text-white border flex items-center justify-between pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 ${
            type === 'success' ? 'bg-emerald-600 border-emerald-500' :
            type === 'error' ? 'bg-red-600 border-red-500' :
            type === 'warning' ? 'bg-amber-600 border-amber-500' : 'bg-zinc-800 border-zinc-700'
        }`;

        const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info';

        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fa-solid ${icon} text-lg"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" class="ml-4 opacity-70 hover:opacity-100 p-2">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

window.onload = () => {
    window.app = new PizzaFestApp();
};