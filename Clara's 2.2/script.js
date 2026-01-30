document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // ⚙️ CONFIGURAÇÃO DE PREÇOS
    // ==========================================
    const PRICES = {
        buffet: {
            essencial: { tier1: 47.00, tier2: 44.00, threshold: 49 },
            especial: { tier1: 65.00, tier2: 62.00, threshold: 49 },
            premium: { tier1: 75.00, tier2: 72.00, threshold: 49 }
        },
        services: {
            massas: 39.99,
            crepe: 37.90,
            hotdog: 750.00,
            carts: 300.00,
            popcorn_premium: 600.00
        },
        addons: {
            drinks: 9.90,
            savory: 8.90,
            glass: 1.00,
            cutlery: 2.50,
            nutella: 120.00
        }
    };

    // Variáveis Globais
    let globalGuests = 50;
    
    // Inputs Principais (Home)
    const inputs = {
        buffetEssencial: document.getElementById('service-buffet-essencial'),
        buffetEspecial: document.getElementById('service-buffet-especial'),
        buffetPremium: document.getElementById('service-buffet-premium'),
        massas: document.getElementById('service-massas'),
        crepe: document.getElementById('service-crepe'),
        hotdog: document.getElementById('service-hotdog'),
        carts: document.getElementById('service-carts'),
        popcornPremium: document.getElementById('service-popcorn-premium'),
        
        addonDrinks: document.getElementById('addon-drinks'),
        addonSavory: document.getElementById('addon-savory'),
        addonGlass: document.getElementById('addon-glass'),
        addonCutlery: document.getElementById('addon-cutlery'),
        addonNutella: document.getElementById('addon-nutella'),
        containerNutella: document.getElementById('container-addon-nutella')
    };

    const guestsInput = document.getElementById('guests');
    const totalPriceElement = document.getElementById('total-price');
    const dynamicWarnings = document.getElementById('dynamic-warnings');

    // ==========================================
    // 1. LÓGICA DA CALCULADORA PRINCIPAL
    // ==========================================
    function updateAddonsState() {
        const mainServices = [
            inputs.buffetEssencial, inputs.buffetEspecial, inputs.buffetPremium,
            inputs.massas, inputs.crepe, inputs.hotdog, inputs.carts, inputs.popcornPremium
        ];
        
        const isMainSelected = mainServices.some(input => input && input.checked);
        const addons = [inputs.addonDrinks, inputs.addonSavory, inputs.addonGlass, inputs.addonCutlery, inputs.addonNutella];

        addons.forEach(addon => {
            if (addon) {
                addon.disabled = !isMainSelected;
                if (!isMainSelected) addon.checked = false;
            }
        });

        if (inputs.popcornPremium && inputs.containerNutella) {
            const showNutella = inputs.popcornPremium.checked;
            inputs.containerNutella.style.display = showNutella ? 'flex' : 'none';
            if (!showNutella && inputs.addonNutella) inputs.addonNutella.checked = false;
        }

        calculateTotal();
    }

    function calculateTotal() {
        let total = 0;
        let guests = parseInt(guestsInput.value) || 0;
        if (guests < 0) guests = 0;

        let warnings = [];
        let isOverflow = false;

        const getTierPrice = (serviceKey) => {
            const config = PRICES.buffet[serviceKey];
            return (guests <= config.threshold) ? config.tier1 : config.tier2;
        };

        if (inputs.buffetEssencial?.checked) total += guests * getTierPrice('essencial');
        if (inputs.buffetEspecial?.checked) total += guests * getTierPrice('especial');
        if (inputs.buffetPremium?.checked) total += guests * getTierPrice('premium');
        if (inputs.massas?.checked) total += guests * PRICES.services.massas;
        if (inputs.crepe?.checked) total += guests * PRICES.services.crepe;
        if (inputs.popcornPremium?.checked) total += PRICES.services.popcorn_premium;

        if (inputs.hotdog?.checked) {
            if (guests > 80) {
                isOverflow = true;
                warnings.push('<span style="color:red; font-weight:bold;">⚠️ Limite excedido para Hot Dog (Máx 80).</span>');
            } else {
                total += PRICES.services.hotdog;
            }
        }
        if (inputs.carts?.checked) {
            if (guests > 100) {
                isOverflow = true;
                warnings.push('<span style="color:red; font-weight:bold;">⚠️ Limite excedido para Carrinho (Máx 100).</span>');
            } else {
                total += PRICES.services.carts;
            }
        }

        if (inputs.addonDrinks?.checked) total += guests * PRICES.addons.drinks;
        if (inputs.addonSavory?.checked) total += guests * PRICES.addons.savory;
        if (inputs.addonGlass?.checked) total += guests * PRICES.addons.glass;
        if (inputs.addonCutlery?.checked) total += guests * PRICES.addons.cutlery;
        if (inputs.popcornPremium?.checked && inputs.addonNutella?.checked) total += PRICES.addons.nutella;

        globalGuests = guests;
        
        if (totalPriceElement) {
            if (isOverflow) {
                totalPriceElement.textContent = "Sob Consulta";
                document.getElementById('btn-goto-booking').style.display = 'none';
                document.getElementById('btn-whatsapp-fallback').style.display = 'block';
            } else {
                totalPriceElement.textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.getElementById('btn-goto-booking').style.display = 'block';
                document.getElementById('btn-whatsapp-fallback').style.display = 'none';
            }
        }
        if (dynamicWarnings) dynamicWarnings.innerHTML = warnings.join('<br>');
    }

    if (guestsInput) guestsInput.addEventListener('input', calculateTotal);
    Object.values(inputs).forEach(input => {
        if (input) {
            if (!input.id.startsWith('addon')) {
                input.addEventListener('change', updateAddonsState);
            } else {
                input.addEventListener('change', calculateTotal);
            }
        }
    });

    const btnBooking = document.getElementById('btn-goto-booking');
    if (btnBooking) {
        btnBooking.addEventListener('click', () => {
            document.getElementById('custom-booking').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ==========================================
    // 2. CALENDÁRIO
    // ==========================================
    const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.getElementById('month-year');
    let currentDate = new Date();

    function renderCalendar() {
        if (!calendarDays) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        monthYear.textContent = `${monthNames[month]} ${year}`;
        calendarDays.innerHTML = "";

        for (let i = 0; i < startingDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarDays.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = i;
            dayDiv.addEventListener('click', () => {
                const selectedDate = new Date(year, month, i);
                openBookingModal(selectedDate);
            });
            calendarDays.appendChild(dayDiv);
        }
    }

    document.getElementById('prev-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // ==========================================
    // 3. LÓGICA DO MODAL (Cálculo e Travamento)
    // ==========================================
    
    function checkModalGuestsLock() {
        const modalGuestsInput = document.getElementById('modal-guests');
        const warning = document.getElementById('modal-guest-warning');
        const checkboxes = document.querySelectorAll('#booking-modal input[type="checkbox"]');
        
        let guests = parseInt(modalGuestsInput.value) || 0;
        const isLocked = guests <= 0;

        checkboxes.forEach(cb => {
            if(cb.id !== 'booking-disclaimer') {
                cb.disabled = isLocked;
            }
        });

        if (warning) {
            warning.style.display = isLocked ? 'block' : 'none';
        }

        if (!isLocked) {
            recalculateModalTotal();
        } else {
            document.getElementById('modal-total-display').textContent = "R$ 0,00";
        }
    }

    function recalculateModalTotal() {
        const modalGuestsInput = document.getElementById('modal-guests');
        let guests = parseInt(modalGuestsInput.value) || 0;
        if (guests <= 0) return;

        let total = 0;

        const getTierPrice = (serviceKey) => {
            const config = PRICES.buffet[serviceKey];
            return (guests <= config.threshold) ? config.tier1 : config.tier2;
        };

        const m = {
            essencial: document.getElementById('modal-service-buffet-essencial'),
            especial: document.getElementById('modal-service-buffet-especial'),
            premium: document.getElementById('modal-service-buffet-premium'),
            massas: document.getElementById('modal-service-massas'),
            crepe: document.getElementById('modal-service-crepe'),
            hotdog: document.getElementById('modal-service-hotdog'),
            carts: document.getElementById('modal-service-carts'),
            popcorn: document.getElementById('modal-service-popcorn-premium'),
            
            drinks: document.getElementById('modal-addon-drinks'),
            savory: document.getElementById('modal-addon-savory'),
            glass: document.getElementById('modal-addon-glass'),
            cutlery: document.getElementById('modal-addon-cutlery'),
            nutella: document.getElementById('modal-addon-nutella')
        };

        if (m.essencial?.checked) total += guests * getTierPrice('essencial');
        if (m.especial?.checked) total += guests * getTierPrice('especial');
        if (m.premium?.checked) total += guests * getTierPrice('premium');
        
        if (m.massas?.checked) total += guests * PRICES.services.massas;
        if (m.crepe?.checked) total += guests * PRICES.services.crepe;
        
        if (m.hotdog?.checked) total += PRICES.services.hotdog;
        if (m.carts?.checked) total += PRICES.services.carts;
        if (m.popcorn?.checked) total += PRICES.services.popcorn_premium;

        if (m.drinks?.checked) total += guests * PRICES.addons.drinks;
        if (m.savory?.checked) total += guests * PRICES.addons.savory;
        if (m.glass?.checked) total += guests * PRICES.addons.glass;
        if (m.cutlery?.checked) total += guests * PRICES.addons.cutlery;
        
        if (m.popcorn?.checked && m.nutella?.checked) total += PRICES.addons.nutella;

        const modalDisplay = document.getElementById('modal-total-display');
        if (modalDisplay) {
            modalDisplay.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }

    // ABRIR MODAL
    function openBookingModal(date) {
        window.currentSelectedDateObj = date; 
        
        const modal = document.getElementById('booking-modal');
        const dateDisplay = document.getElementById('selected-date-display');
        const isoInput = document.getElementById('selected-date-iso');
        
        // Reset Visual
        document.getElementById('booking-step-1').style.display = 'block';
        document.getElementById('booking-step-2').style.display = 'none';
        document.getElementById('booking-form').reset();

        dateDisplay.textContent = `Data selecionada: ${date.toLocaleDateString('pt-BR')}`;
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        isoInput.value = adjustedDate.toISOString().split('T')[0];

        // Traz convidados da home
        document.getElementById('modal-guests').value = globalGuests;

        // SINCRONIZA CHECKBOXES
        const idMap = {
            'service-buffet-essencial': 'modal-service-buffet-essencial',
            'service-buffet-especial': 'modal-service-buffet-especial',
            'service-buffet-premium': 'modal-service-buffet-premium',
            'service-massas': 'modal-service-massas',
            'service-crepe': 'modal-service-crepe',
            'service-hotdog': 'modal-service-hotdog',
            'service-carts': 'modal-service-carts',
            'service-popcorn-premium': 'modal-service-popcorn-premium',
            'addon-drinks': 'modal-addon-drinks',
            'addon-savory': 'modal-addon-savory',
            'addon-glass': 'modal-addon-glass',
            'addon-cutlery': 'modal-addon-cutlery',
            'addon-nutella': 'modal-addon-nutella'
        };

        for (const [sourceId, targetId] of Object.entries(idMap)) {
            const source = document.getElementById(sourceId);
            const target = document.getElementById(targetId);
            if (source && target) {
                target.checked = source.checked;
                // Nutella Visual Inicial
                if (sourceId === 'service-popcorn-premium') {
                    const modalNutellaContainer = document.getElementById('modal-container-addon-nutella');
                    if (modalNutellaContainer) {
                        modalNutellaContainer.style.display = source.checked ? 'block' : 'none';
                    }
                }
            }
        }

        // Verifica trava e calcula
        checkModalGuestsLock();

        modal.style.display = "block";
    }

    // --- INTERAÇÕES DO MODAL ---
    
    // 1. Trava/Destrava ao digitar convidados
    const modalGuestsInput = document.getElementById('modal-guests');
    if(modalGuestsInput) {
        modalGuestsInput.addEventListener('input', checkModalGuestsLock);
    }

    // 2. Lógica Pipoca -> Nutella
    const modalPopcorn = document.getElementById('modal-service-popcorn-premium');
    const modalNutellaDiv = document.getElementById('modal-container-addon-nutella');
    const modalNutellaCheck = document.getElementById('modal-addon-nutella');

    if (modalPopcorn && modalNutellaDiv) {
        modalPopcorn.addEventListener('change', function() {
            if (this.checked) {
                modalNutellaDiv.style.display = 'block';
            } else {
                modalNutellaDiv.style.display = 'none';
                if (modalNutellaCheck) modalNutellaCheck.checked = false; 
            }
            recalculateModalTotal();
        });
    }

    // 3. Recalcular ao mexer nos checkboxes
    const allModalInputs = document.querySelectorAll('#booking-modal input[type="checkbox"]');
    allModalInputs.forEach(input => {
        input.addEventListener('change', recalculateModalTotal);
    });

    document.getElementById('close-booking-modal')?.addEventListener('click', () => {
        document.getElementById('booking-modal').style.display = "none";
    });

    // --- CÁLCULO DE HORÁRIO ---
    const timeInput = document.getElementById('event-time');
    const endTimeInput = document.getElementById('event-end-time');
    
    function calculateEndTime() {
        if (!timeInput.value) return;
        const guests = parseInt(document.getElementById('modal-guests').value) || 0;
        const duration = guests > 30 ? 4 : 3;
        const [h, m] = timeInput.value.split(':').map(Number);
        const endH = (h + duration) % 24;
        endTimeInput.value = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    timeInput?.addEventListener('input', calculateEndTime);
    modalGuestsInput?.addEventListener('input', calculateEndTime);

    // ==========================================
    // 4. MENU MOBILE & HEADER
    // ==========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');
    const headerElement = document.querySelector('header'); // Seleciona o header

    if (mobileMenuBtn && navUl) {
        mobileMenuBtn.addEventListener('click', () => {
            navUl.classList.toggle('active');
            // Alterna a classe para o fundo preto
            if (headerElement) {
                headerElement.classList.toggle('menu-open');
            }
        });
    }

    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // ==========================================
    // 5. REVISÃO E ENVIO
    // ==========================================
    const reviewBtn = document.getElementById('review-booking-btn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            const name = document.getElementById('client-name').value;
            const loc = document.getElementById('event-location').value;
            const time = document.getElementById('event-time').value;
            const guests = document.getElementById('modal-guests').value;
            
            if (!name || !loc || !time || !guests) {
                alert("⚠️ Preencha todos os campos obrigatórios.");
                return;
            }

            let dateStr = "";
            if (window.currentSelectedDateObj) {
                dateStr = window.currentSelectedDateObj.toLocaleDateString('pt-BR');
            } else {
                const displayTxt = document.getElementById('selected-date-display').innerText;
                dateStr = displayTxt.replace('Data selecionada: ', '').trim();
            }

            let servicesList = [];
            document.querySelectorAll('#booking-modal input[type="checkbox"]:checked').forEach(cb => {
                if(cb.parentElement && cb.id !== 'booking-disclaimer') {
                    servicesList.push(cb.parentElement.innerText.trim());
                }
            });

            const summaryDiv = document.getElementById('summary-content');
            const totalVal = document.getElementById('modal-total-display').innerText;
            const endTime = document.getElementById('event-end-time').value;

            summaryDiv.innerHTML = `
                <p><strong>👤 Nome:</strong> ${name}</p>
                <p><strong>📅 Data:</strong> ${dateStr}</p>
                <p><strong>⏰ Horário:</strong> ${time} às ${endTime}</p>
                <p><strong>👥 Convidados:</strong> ${guests}</p>
                <p><strong>📍 Local:</strong> ${loc}</p>
                <hr style="border:0; border-top:1px solid #444; margin:10px 0;">
                <p><strong>✅ Serviços:</strong><br>${servicesList.length ? servicesList.join('<br>') : 'Nenhum'}</p>
                <p style="margin-top:15px; color:#D4AF37; font-weight:bold; font-size:1.2em;">Total: ${totalVal}</p>
            `;

            document.getElementById('booking-step-1').style.display = 'none';
            document.getElementById('booking-step-2').style.display = 'block';
            document.querySelector('.booking-modal-content').scrollTop = 0;
        });
    }

    document.getElementById('back-booking-btn')?.addEventListener('click', () => {
        document.getElementById('booking-step-2').style.display = 'none';
        document.getElementById('booking-step-1').style.display = 'block';
    });

    const bookingForm = document.getElementById('booking-form');
    const commitModal = document.getElementById('commitment-modal');
    const confirmBtn = document.getElementById('confirm-commitment');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if(!document.getElementById('booking-disclaimer').checked) {
                alert("Confirme que é uma pré-reserva.");
                return;
            }
            commitModal.style.display = 'block';
        });
    }

    document.getElementById('cancel-commitment')?.addEventListener('click', () => {
        commitModal.style.display = 'none';
    });

    // ---------------------------------------------
    // ENVIO FINAL (CORRIGIDO: WHATSAPP PRIMEIRO)
    // ---------------------------------------------
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            // 1. Coleta os dados
            const name = document.getElementById('client-name').value;
            const loc = document.getElementById('event-location').value;
            const time = document.getElementById('event-time').value;
            const guests = document.getElementById('modal-guests').value;
            const isoDate = document.getElementById('selected-date-iso').value;
            const endTime = document.getElementById('event-end-time').value;
            const total = document.getElementById('modal-total-display').innerText;
            let displayDate = document.getElementById('selected-date-display').innerText.replace('Data selecionada: ', '');
            
            let sList = [];
            document.querySelectorAll('#booking-modal input[type="checkbox"]:checked').forEach(cb => {
                if(cb.parentElement && cb.id !== 'booking-disclaimer') {
                    sList.push(cb.parentElement.innerText.trim());
                }
            });
            const sText = sList.join(', ');

            // 2. Prepara e Abre WhatsApp (IMEDIATAMENTE)
            const whatsappMsg = `Olá, quero confirmar:%0A%0A*Nome:* ${name}%0A*Data:* ${displayDate}%0A*Convidados:* ${guests}%0A*Horário:* ${time} às ${endTime}%0A*Local:* ${loc}%0A*Serviços:* ${sText}%0A*Total:* ${total}`;
            const whatsappUrl = `https://api.whatsapp.com/send?phone=5561982605050&text=${encodeURIComponent(whatsappMsg)}`;
            
            window.open(whatsappUrl, '_blank');

            // 3. Muda estado do botão (Visual)
            confirmBtn.innerText = "Enviando Planilha...";
            confirmBtn.disabled = true;

            // 4. Envia para Planilha (Segundo plano)
            const formData = new FormData();
            formData.append('clientName', name);
            formData.append('eventLocation', loc);
            formData.append('eventTime', time);
            formData.append('eventDuration', (parseInt(guests) > 30 ? "4h" : "3h"));
            formData.append('selectedDateISO', isoDate);
            formData.append('services', sText);

            const scriptURL = "https://script.google.com/macros/s/AKfycbywYl8DmGmVc3ZWYzHCYCJp8XOnBTql6zxr0L2cXP0RctfpZ7BPjlgShr0y1H90x7cO-Q/exec";

            fetch(scriptURL, { method: 'POST', body: formData })
            .finally(() => {
                // 5. Limpa a tela
                commitModal.style.display = 'none';
                document.getElementById('booking-modal').style.display = 'none';
                confirmBtn.innerText = "SIM, QUERO ASSINAR";
                confirmBtn.disabled = false;
                bookingForm.reset();
            });
        });
    }

    updateAddonsState();
    calculateTotal();
    renderCalendar();
});