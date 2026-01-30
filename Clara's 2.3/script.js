document.addEventListener('DOMContentLoaded', function () {

    // Helper para proteção de DOM e Optional Chaining automático
    const getEl = (id) => document.getElementById(id);

    // ==========================================
    // 0. CALENDÁRIO (Prioritário - Inicialização no Topo)
    // ==========================================
    const calendarDays = getEl('calendar-days');
    const monthYear = getEl('month-year');
    let currentDate = new Date(); // Data base para navegação (mês visível)

    function renderCalendar() {
        // Garante execução independente de outros erros
        if (!calendarDays || !monthYear) return;

        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDay = firstDay.getDay();

            const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            monthYear.textContent = `${monthNames[month]} ${year}`;
            calendarDays.innerHTML = "";

            // Dias vazios do início do mês
            for (let i = 0; i < startingDay; i++) {
                const emptyDiv = document.createElement('div');
                emptyDiv.classList.add('calendar-day', 'empty');
                calendarDays.appendChild(emptyDiv);
            }

            // Dias do mês
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.classList.add('calendar-day');
                dayDiv.textContent = i;

                // Evento de clique para abrir modal
                dayDiv.addEventListener('click', () => {
                    const selectedDate = new Date(year, month, i);
                    openBookingModal(selectedDate);
                });

                calendarDays.appendChild(dayDiv);
            }
        } catch (e) {
            console.error("Erro ao renderizar calendário:", e);
        }
    }

    // Navegação do Calendário
    getEl('prev-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    getEl('next-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Chamada inicial garantida
    renderCalendar();


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

    // Inputs Principais (Home) - Captura Protegida
    const inputs = {
        buffetEssencial: getEl('service-buffet-essencial'),
        buffetEspecial: getEl('service-buffet-especial'),
        buffetPremium: getEl('service-buffet-premium'),
        massas: getEl('service-massas'),
        crepe: getEl('service-crepe'),
        hotdog: getEl('service-hotdog'),
        carts: getEl('service-carts'),
        popcornPremium: getEl('service-popcorn-premium'),

        addonDrinks: getEl('addon-drinks'),
        addonSavory: getEl('addon-savory'),
        addonGlass: getEl('addon-glass'),
        addonCutlery: getEl('addon-cutlery'),
        addonNutella: getEl('addon-nutella'),
        containerNutella: getEl('container-addon-nutella')
    };

    const guestsInput = getEl('guests');
    const totalPriceElement = getEl('total-price');
    const dynamicWarnings = getEl('dynamic-warnings');

    // ==========================================
    // 1. LÓGICA DA CALCULADORA PRINCIPAL
    // ==========================================
    function updateAddonsState() {
        const mainServices = [
            inputs.buffetEssencial, inputs.buffetEspecial, inputs.buffetPremium,
            inputs.massas, inputs.crepe, inputs.hotdog, inputs.carts, inputs.popcornPremium
        ];

        // Verifica se input existe antes de acessar .checked
        const isMainSelected = mainServices.some(input => input && input.checked);
        const addons = [inputs.addonDrinks, inputs.addonSavory, inputs.addonGlass, inputs.addonCutlery, inputs.addonNutella];

        addons.forEach(addon => {
            if (addon) {
                addon.disabled = !isMainSelected;
                if (!isMainSelected) addon.checked = false;
            }
        });

        // Lógica visual da Nutella na Home
        if (inputs.popcornPremium && inputs.containerNutella) {
            const showNutella = inputs.popcornPremium.checked;
            inputs.containerNutella.style.display = showNutella ? 'flex' : 'none';
            if (!showNutella && inputs.addonNutella) inputs.addonNutella.checked = false;
        }

        calculateTotal();
    }

    function calculateTotal() {
        let total = 0;
        let guests = parseInt(guestsInput?.value) || 0;
        if (guests < 0) guests = 0;

        let warnings = [];
        let isOverflow = false;

        const getTierPrice = (serviceKey) => {
            const config = PRICES.buffet[serviceKey];
            return (guests <= config.threshold) ? config.tier1 : config.tier2;
        };

        // Cálculos seguros com Optional Chaining
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

        // Atualiza globalGuests para uso no Modal
        globalGuests = guests;

        // Atualiza UI
        const btnBooking = getEl('btn-goto-booking');
        const btnWhatsapp = getEl('btn-whatsapp-fallback');

        if (totalPriceElement) {
            if (isOverflow) {
                totalPriceElement.textContent = "Sob Consulta";
                if (btnBooking) btnBooking.style.display = 'none';
                if (btnWhatsapp) btnWhatsapp.style.display = 'block';
            } else {
                totalPriceElement.textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                if (btnBooking) btnBooking.style.display = 'block';
                if (btnWhatsapp) btnWhatsapp.style.display = 'none';
            }
        }
        if (dynamicWarnings) dynamicWarnings.innerHTML = warnings.join('<br>');
    }

    // Listeners da Calculadora Home
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

    const btnBooking = getEl('btn-goto-booking');
    if (btnBooking) {
        btnBooking.addEventListener('click', () => {
            getEl('custom-booking')?.scrollIntoView({ behavior: 'smooth' });
        });
    }


    // ==========================================
    // 2. LÓGICA DO MODAL (TRAVAMENTO, SYNC e TÉRMINO)
    // ==========================================

    // Função auxiliar: Calcular horário de término
    function calculateEndTime() {
        const timeInput = getEl('event-time');
        const endTimeInput = getEl('event-end-time');
        const modalGuestsInput = getEl('modal-guests');

        // Se não houver horário preenchido ou input não existir, aborta
        if (!timeInput?.value || !endTimeInput) return;

        const guests = parseInt(modalGuestsInput?.value) || 0;
        const duration = guests > 30 ? 4 : 3;

        const parts = timeInput.value.split(':');
        if (parts.length < 2) return;

        const [h, m] = parts.map(Number);
        if (isNaN(h) || isNaN(m)) return;

        const endH = (h + duration) % 24;
        endTimeInput.value = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Função auxiliar: Verificar trava de convidados
    function checkModalGuestsLock() {
        const modalGuestsInput = getEl('modal-guests');
        const warning = getEl('modal-guest-warning');
        const checkboxes = document.querySelectorAll('#booking-modal input[type="checkbox"]');

        let guests = parseInt(modalGuestsInput?.value) || 0;
        const isLocked = guests <= 0;

        // Trava/Destrava checkboxes e recalcula
        checkboxes.forEach(cb => {
            if (cb.id !== 'booking-disclaimer') {
                cb.disabled = isLocked;
            }
        });

        if (warning) {
            warning.style.display = isLocked ? 'block' : 'none';
        }

        if (!isLocked) {
            recalculateModalTotal();
        } else {
            const display = getEl('modal-total-display');
            if (display) display.textContent = "R$ 0,00";
        }
    }

    // Função auxiliar: Recalcular total do Modal
    function recalculateModalTotal() {
        const modalGuestsInput = getEl('modal-guests');
        let guests = parseInt(modalGuestsInput?.value) || 0;
        if (guests <= 0) return;

        let total = 0;

        const getTierPrice = (serviceKey) => {
            const config = PRICES.buffet[serviceKey];
            return (guests <= config.threshold) ? config.tier1 : config.tier2;
        };

        const m = {
            essencial: getEl('modal-service-buffet-essencial'),
            especial: getEl('modal-service-buffet-especial'),
            premium: getEl('modal-service-buffet-premium'),
            massas: getEl('modal-service-massas'),
            crepe: getEl('modal-service-crepe'),
            hotdog: getEl('modal-service-hotdog'),
            carts: getEl('modal-service-carts'),
            popcorn: getEl('modal-service-popcorn-premium'),
            drinks: getEl('modal-addon-drinks'),
            savory: getEl('modal-addon-savory'),
            glass: getEl('modal-addon-glass'),
            cutlery: getEl('modal-addon-cutlery'),
            nutella: getEl('modal-addon-nutella')
        };

        // Soma segura
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

        const modalDisplay = getEl('modal-total-display');
        if (modalDisplay) {
            modalDisplay.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }

    // --- ABRIR MODAL (Função Principal) ---
    function openBookingModal(date) {
        window.currentSelectedDateObj = date;

        const modal = getEl('booking-modal');
        const dateDisplay = getEl('selected-date-display');
        const isoInput = getEl('selected-date-iso');

        // Reset Visual
        const step1 = getEl('booking-step-1');
        const step2 = getEl('booking-step-2');
        const form = getEl('booking-form');

        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';
        if (form) form.reset();

        if (dateDisplay) dateDisplay.textContent = `Data selecionada: ${date.toLocaleDateString('pt-BR')}`;

        // Ajuste fuso horário para input hidden
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        if (isoInput) isoInput.value = adjustedDate.toISOString().split('T')[0];

        // SINCRONIZAÇÃO DE DADOS (PULO DO GATO)
        const mGuests = getEl('modal-guests');
        if (mGuests) {
            mGuests.value = globalGuests;
        }

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
            const source = getEl(sourceId);
            const target = getEl(targetId);
            if (source && target) {
                target.checked = source.checked;
                // Exibe Nutella se Pipoca estiver marcado
                if (sourceId === 'service-popcorn-premium') {
                    const modalNutellaContainer = getEl('modal-container-addon-nutella');
                    if (modalNutellaContainer) {
                        modalNutellaContainer.style.display = source.checked ? 'block' : 'none';
                    }
                }
            }
        }

        // --- CORREÇÕES CRÍTICAS ---
        // 1. Libera campos baseados nos convidados (simula input)
        checkModalGuestsLock();

        // 2. Garante que o cálculo de término rode se já houver horário (ex: memória do browser)
        calculateEndTime();

        if (modal) modal.style.display = "block";
    }

    // --- LISTENERS DO MODAL ---

    // Trava/Destrava e Cálculo Tempo Real
    const modalGuestsInput = getEl('modal-guests');
    if (modalGuestsInput) {
        modalGuestsInput.addEventListener('input', () => {
            checkModalGuestsLock();
            calculateEndTime(); // Recalcula o término se mudar número de convidados (3h/4h)
        });
    }

    // Lógica Pipoca -> Nutella (Modal)
    const modalPopcorn = getEl('modal-service-popcorn-premium');
    const modalNutellaDiv = getEl('modal-container-addon-nutella');
    const modalNutellaCheck = getEl('modal-addon-nutella');

    if (modalPopcorn && modalNutellaDiv) {
        modalPopcorn.addEventListener('change', function () {
            if (this.checked) {
                modalNutellaDiv.style.display = 'block';
            } else {
                modalNutellaDiv.style.display = 'none';
                if (modalNutellaCheck) modalNutellaCheck.checked = false;
            }
            recalculateModalTotal();
        });
    }

    // Recalcular ao mexer em qualquer serviço
    const allModalInputs = document.querySelectorAll('#booking-modal input[type="checkbox"]');
    allModalInputs.forEach(input => {
        input.addEventListener('change', recalculateModalTotal);
    });

    // Horário Término Dinâmico
    const timeInput = getEl('event-time');
    timeInput?.addEventListener('input', calculateEndTime);

    // Fechar Modal
    getEl('close-booking-modal')?.addEventListener('click', () => {
        getEl('booking-modal').style.display = "none";
    });

    // ==========================================
    // 3. MENU MOBILE & HEADER
    // ==========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');
    const headerElement = document.querySelector('header');

    if (mobileMenuBtn && navUl) {
        mobileMenuBtn.addEventListener('click', () => {
            navUl.classList.toggle('active');
            if (headerElement) headerElement.classList.toggle('menu-open');
        });
    }

    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }

    // ==========================================
    // 4. REVISÃO DA RESERVA (Passo 1 -> Passo 2)
    // ==========================================
    const reviewBtn = getEl('review-booking-btn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            // Captura de valores com proteção (Optional Chaining)
            const name = getEl('client-name')?.value;
            const loc = getEl('event-location')?.value;
            const time = getEl('event-time')?.value;
            const guests = getEl('modal-guests')?.value;

            // Validação Básica
            if (!name || !loc || !time || !guests) {
                alert("⚠️ Preencha todos os campos obrigatórios.");
                return;
            }

            // Data Formatada
            let dateStr = "";
            if (window.currentSelectedDateObj) {
                dateStr = window.currentSelectedDateObj.toLocaleDateString('pt-BR');
            } else {
                const displayTxt = getEl('selected-date-display')?.innerText || "";
                dateStr = displayTxt.replace('Data selecionada: ', '').trim();
            }

            // Lista Serviços Marcados (apenas dentro do modal)
            let servicesList = [];
            // Seletor específico corrigido
            const checkedServices = document.querySelectorAll('#booking-modal input[type="checkbox"]:checked');
            checkedServices.forEach(cb => {
                // Ignora o disclaimer e verifica se tem pai (label)
                if (cb.parentElement && cb.id !== 'booking-disclaimer') {
                    servicesList.push(cb.parentElement.innerText.trim());
                }
            });

            const summaryDiv = getEl('summary-content');
            const totalVal = getEl('modal-total-display')?.innerText || "R$ 0,00";
            const endTime = getEl('event-end-time')?.value || "";

            if (summaryDiv) {
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
            }

            // Transição de Tela
            const step1 = getEl('booking-step-1');
            const step2 = getEl('booking-step-2');
            if (step1) step1.style.display = 'none';
            if (step2) step2.style.display = 'block';

            // Scroll para o topo do modal
            const content = document.querySelector('.booking-modal-content');
            if (content) content.scrollTop = 0;
        });
    }

    // Botão Voltar (Passo 2 -> Passo 1)
    getEl('back-booking-btn')?.addEventListener('click', () => {
        const step1 = getEl('booking-step-1');
        const step2 = getEl('booking-step-2');
        if (step2) step2.style.display = 'none';
        if (step1) step1.style.display = 'block';
    });

    // ==========================================
    // 5. ENVIO FINAL (WhatsApp + Planilha)
    // ==========================================
    const bookingForm = getEl('booking-form');
    const commitModal = getEl('commitment-modal');
    const confirmBtn = getEl('confirm-commitment');

    // Intercepta Submit do Formulário
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const disclaimer = getEl('booking-disclaimer');
            if (!disclaimer?.checked) {
                alert("Confirme que é uma pré-reserva.");
                return;
            }
            if (commitModal) commitModal.style.display = 'block';
        });
    }

    // Fechar Modal de Compromisso
    getEl('cancel-commitment')?.addEventListener('click', () => {
        if (commitModal) commitModal.style.display = 'none';
    });

    // Botão "SIM, QUERO ASSINAR"
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            // 1. Coleta os dados de forma segura
            const name = getEl('client-name')?.value || "";
            const loc = getEl('event-location')?.value || "";
            const time = getEl('event-time')?.value || "";
            const guests = getEl('modal-guests')?.value || "0";
            const isoDate = getEl('selected-date-iso')?.value || "";
            const endTime = getEl('event-end-time')?.value || "";
            const total = getEl('modal-total-display')?.innerText || "";
            let displayDate = getEl('selected-date-display')?.innerText.replace('Data selecionada: ', '') || "";

            let sList = [];
            document.querySelectorAll('#booking-modal input[type="checkbox"]:checked').forEach(cb => {
                if (cb.parentElement && cb.id !== 'booking-disclaimer') {
                    sList.push(cb.parentElement.innerText.trim());
                }
            });
            const sText = sList.join(', ');

            // 2. Prepara e Abre WhatsApp (IMEDIATAMENTE para não ser bloqueado)
            const whatsappMsg = `Olá, quero confirmar:\n\n*Nome:* ${name}\n*Data:* ${displayDate}\n*Convidados:* ${guests}\n*Horário:* ${time} às ${endTime}\n*Local:* ${loc}\n*Serviços:* ${sText}\n*Total:* ${total}`;
            const whatsappUrl = `https://api.whatsapp.com/send?phone=5561982605050&text=${encodeURIComponent(whatsappMsg)}`;

            window.open(whatsappUrl, '_blank');

            // 3. Atualiza botão para feedback visual
            confirmBtn.innerText = "Enviando Planilha...";
            confirmBtn.disabled = true;

            // 4. Envia para Planilha (Google Apps Script)
            const formData = new FormData();
            formData.append('clientName', name);
            formData.append('eventLocation', loc);
            formData.append('eventTime', time);

            // CORREÇÃO CRÍTICA: Enviar apenas o número (Inteiro) para o Apps Script
            const durationNum = parseInt(guests) > 30 ? 4 : 3;
            formData.append('eventDuration', durationNum);

            formData.append('selectedDateISO', isoDate);
            formData.append('services', sText);

            const scriptURL = "https://script.google.com/macros/s/AKfycbywYl8DmGmVc3ZWYzHCYCJp8XOnBTql6zxr0L2cXP0RctfpZ7BPjlgShr0y1H90x7cO-Q/exec";

            fetch(scriptURL, { method: 'POST', body: formData })
                .finally(() => {
                    // 5. Finalização e Limpeza
                    if (commitModal) commitModal.style.display = 'none';
                    const bookingModal = getEl('booking-modal');
                    if (bookingModal) bookingModal.style.display = 'none';

                    confirmBtn.innerText = "SIM, QUERO ASSINAR";
                    confirmBtn.disabled = false;
                    if (bookingForm) bookingForm.reset();
                });
        });
    }

    // Inicialização da Calculadora
    updateAddonsState();
    calculateTotal();

});