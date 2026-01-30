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

    // ==========================================
    // 🌐 ELEMENTOS E VARIÁVEIS
    // ==========================================
    let globalGuests = 50;
    let globalEstimatedTotal = 0;

    const guestsInput = document.getElementById('guests');
    const totalPriceElement = document.getElementById('total-price');
    const priceNote = document.getElementById('price-note');
    const btnGotoBooking = document.getElementById('btn-goto-booking');
    const btnWhatsappFallback = document.getElementById('btn-whatsapp-fallback');
    const dynamicWarnings = document.getElementById('dynamic-warnings');

    // Mapeamento dos Inputs
    const inputs = {
        // Principais
        buffetEssencial: document.getElementById('service-buffet-essencial'),
        buffetEspecial: document.getElementById('service-buffet-especial'),
        buffetPremium: document.getElementById('service-buffet-premium'),
        massas: document.getElementById('service-massas'),
        crepe: document.getElementById('service-crepe'),
        hotdog: document.getElementById('service-hotdog'),
        carts: document.getElementById('service-carts'),
        popcornPremium: document.getElementById('service-popcorn-premium'),
        // Adicionais
        addonDrinks: document.getElementById('addon-drinks'),
        addonSavory: document.getElementById('addon-savory'),
        addonGlass: document.getElementById('addon-glass'),
        addonCutlery: document.getElementById('addon-cutlery'),
        addonNutella: document.getElementById('addon-nutella'),
        // Containers
        containerNutella: document.getElementById('container-addon-nutella')
    };

    // ==========================================
    // 🛠️ LÓGICA DE ADICIONAIS (Destravar/Travar)
    // ==========================================
    function updateAddonsState() {
        // Verifica se ALGUM serviço principal está marcado (exceto addons)
        const mainServices = [
            inputs.buffetEssencial, inputs.buffetEspecial, inputs.buffetPremium,
            inputs.massas, inputs.crepe, inputs.hotdog, inputs.carts, inputs.popcornPremium
        ];

        const isMainSelected = mainServices.some(input => input && input.checked);

        // Lista de Adicionais para controlar
        const addons = [inputs.addonDrinks, inputs.addonSavory, inputs.addonGlass, inputs.addonCutlery, inputs.addonNutella];

        addons.forEach(addon => {
            if (addon) {
                addon.disabled = !isMainSelected;
                // Se desabilitou, desmarca para não cobrar
                if (!isMainSelected) {
                    addon.checked = false;
                }
            }
        });

        // Regra visual da Nutella
        if (inputs.popcornPremium && inputs.containerNutella) {
            const showNutella = inputs.popcornPremium.checked;
            inputs.containerNutella.style.display = showNutella ? 'flex' : 'none';
            if (!showNutella && inputs.addonNutella) inputs.addonNutella.checked = false;
        }

        // Recalcula o total após as mudanças
        calculateTotal();
    }

    // ==========================================
    // 🧠 LÓGICA DE CÁLCULO
    // ==========================================
    function calculateTotal() {
        let total = 0;
        let guests = parseInt(guestsInput.value) || 0;
        if (guests < 0) guests = 0;

        let warnings = [];
        let isOverflow = false;

        // Helper de Preço por Faixa
        const getTierPrice = (serviceKey) => {
            const config = PRICES.buffet[serviceKey];
            return (guests <= config.threshold) ? config.tier1 : config.tier2;
        };

        // --- Soma Principais ---
        if (inputs.buffetEssencial && inputs.buffetEssencial.checked) total += guests * getTierPrice('essencial');
        if (inputs.buffetEspecial && inputs.buffetEspecial.checked) total += guests * getTierPrice('especial');
        if (inputs.buffetPremium && inputs.buffetPremium.checked) total += guests * getTierPrice('premium');

        if (inputs.massas && inputs.massas.checked) total += guests * PRICES.services.massas;
        if (inputs.crepe && inputs.crepe.checked) total += guests * PRICES.services.crepe;
        if (inputs.popcornPremium && inputs.popcornPremium.checked) total += PRICES.services.popcorn_premium;

        // Regras de Overflow (Hot Dog & Carts)
        if (inputs.hotdog && inputs.hotdog.checked) {
            if (guests > 80) {
                isOverflow = true;
                warnings.push('<span style="color:red; font-weight:bold;">⚠️ Limite excedido para Hot Dog (Máx 80). Orçamento exclusivo via WhatsApp.</span>');
            } else {
                total += PRICES.services.hotdog;
            }
        }

        if (inputs.carts && inputs.carts.checked) {
            if (guests > 100) {
                isOverflow = true;
                warnings.push('<span style="color:red; font-weight:bold;">⚠️ Limite excedido para Carrinho (Máx 100). Orçamento exclusivo via WhatsApp.</span>');
            } else {
                total += PRICES.services.carts;
            }
        }

        // --- Soma Adicionais ---
        if (inputs.addonDrinks && inputs.addonDrinks.checked) total += guests * PRICES.addons.drinks;
        if (inputs.addonSavory && inputs.addonSavory.checked) total += guests * PRICES.addons.savory;
        if (inputs.addonGlass && inputs.addonGlass.checked) total += guests * PRICES.addons.glass;
        if (inputs.addonCutlery && inputs.addonCutlery.checked) total += guests * PRICES.addons.cutlery;

        // Nutella (Preço Fixo) - Só se estiver visível e marcado
        if (inputs.popcornPremium && inputs.popcornPremium.checked && inputs.addonNutella && inputs.addonNutella.checked) {
            total += PRICES.addons.nutella;
        }

        // Aviso de Massas (dependência de pratos)
        if (inputs.massas && inputs.massas.checked && inputs.addonCutlery && !inputs.addonCutlery.checked) {
            warnings.push('<span style="color:orange;">⚠️ Atenção: Recomendamos adicionar Pratos e Talheres para o evento de Massas.</span>');
        }

        // Atualiza Globais
        globalGuests = guests;
        globalEstimatedTotal = total;

        // Renderiza Preço
        if (totalPriceElement) {
            if (isOverflow) {
                totalPriceElement.parentElement.style.display = 'none';
                priceNote.textContent = "Orçamento sob medida necessário.";
                if (btnGotoBooking) btnGotoBooking.style.display = 'none';
                if (btnWhatsappFallback) btnWhatsappFallback.style.display = 'block';
            } else {
                totalPriceElement.parentElement.style.display = 'block';
                totalPriceElement.textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                priceNote.textContent = "*Valores estimados. Entre em contato para um orçamento final.";
                if (btnGotoBooking) btnGotoBooking.style.display = 'block';
                if (btnWhatsappFallback) btnWhatsappFallback.style.display = 'none';
            }
        }

        // Renderiza Avisos
        if (dynamicWarnings) dynamicWarnings.innerHTML = warnings.join('<br>');
    }

    // ==========================================
    // 👂 EVENT LISTENERS
    // ==========================================
    if (guestsInput) guestsInput.addEventListener('input', calculateTotal);

    // Adiciona listener em TODOS os inputs (change)
    Object.values(inputs).forEach(input => {
        if (input) {
            // Se for um serviço principal, chama o updateAddonsState
            if (!input.id.startsWith('addon')) {
                input.addEventListener('change', updateAddonsState);
            } else {
                // Se for addon, só recalcula o total
                input.addEventListener('change', calculateTotal);
            }
        }
    });

    // Botão "Solicitar Reserva" (Scroll)
    if (btnGotoBooking) {
        btnGotoBooking.addEventListener('click', () => {
            const bookingSection = document.getElementById('custom-booking');
            if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ==========================================
    // 🎠 CARROUSEL & MENU MOBILE & HEADER
    // ==========================================
    // (Lógica padrão mantida simplificada para garantir funcionamento)
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentSlide = 0;

    if (slides.length > 0) {
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => { currentSlide = index; updateSlides(); });
            if (dotsContainer) dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');
        function updateSlides() {
            slides.forEach((slide, index) => {
                slide.classList.remove('active');
                if (dots[index]) dots[index].classList.remove('active');
                if (index === currentSlide) {
                    slide.classList.add('active');
                    if (dots[index]) dots[index].classList.add('active');
                }
            });
        }

        // Auto Play
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlides();
        }, 5000);
    }

    // Mobile Menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');
    if (mobileMenuBtn && navUl) {
        mobileMenuBtn.addEventListener('click', () => {
            navUl.classList.toggle('active');
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // ==========================================
    // 📅 CALENDÁRIO & AGENDAMENTO
    // ==========================================
    const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const bookingModal = document.getElementById('booking-modal');
    let currentDate = new Date();

    function renderCalendar() {
        if (!calendarDays || !monthYear) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        monthYear.textContent = `${monthNames[month]} ${year}`;

        calendarDays.innerHTML = "";

        // Dias Vazios
        for (let i = 0; i < startingDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarDays.appendChild(emptyDiv);
        }

        // Dias do Mês
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = i;

            // Marca hoje
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            dayDiv.addEventListener('click', () => {
                const selectedDate = new Date(year, month, i);
                openBookingModal(selectedDate);
            });

            calendarDays.appendChild(dayDiv);
        }
    }

    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // --- SYNC CALCULATOR TO MODAL ---
    function syncCalculatorToModal() {
        // Valor Total
        const calcTotal = document.getElementById('total-price').textContent;
        const modalTotal = document.getElementById('modal-total-display');
        if (modalTotal) modalTotal.textContent = "R$ " + calcTotal;

        // IDs Mapa
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
                if (sourceId === 'addon-nutella') {
                    target.parentElement.style.display = source.parentElement.style.display;
                }
            }
        }
    }

    // --- ABRIR MODAL ---
    function openBookingModal(date) {
        syncCalculatorToModal(); // Sincroniza

        const bookingModal = document.getElementById('booking-modal');
        const selectedDateDisplay = document.getElementById('selected-date-display');
        const selectedDateIso = document.getElementById('selected-date-iso');
        const modalGuests = document.getElementById('modal-guests');
        const availabilityMessage = document.getElementById('availability-message');

        // Reset Steps
        document.getElementById('booking-step-1').style.display = 'block';
        document.getElementById('booking-step-2').style.display = 'none';
        document.getElementById('booking-form').reset();

        if (selectedDateDisplay) selectedDateDisplay.textContent = `Data selecionada: ${date.toLocaleDateString('pt-BR')}`;

        // Fix timezone offset for ISO
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        if (selectedDateIso) selectedDateIso.value = adjustedDate.toISOString().split('T')[0];

        if (modalGuests) modalGuests.value = globalGuests; // Traz convidados
        if (availabilityMessage) availabilityMessage.textContent = "";

        bookingModal.style.display = "block";

        // Salva data selecionada globalmente para uso posterior
        window.currentSelectedDateObj = date;
    }

    // Fechar Modal
    const closeBtn = document.getElementById('close-booking-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('booking-modal').style.display = "none";
        });
    }

    // Cálculo de Horário Término
    const eventTime = document.getElementById('event-time');
    const eventEndTime = document.getElementById('event-end-time');
    const modalGuests = document.getElementById('modal-guests');

    function calculateEndTime() {
        if (!eventTime || !eventTime.value || !modalGuests) return;

        let duration = parseInt(modalGuests.value) > 30 ? 4 : 3;
        const [hours, minutes] = eventTime.value.split(':').map(Number);
        let endHours = (hours + duration) % 24;
        eventEndTime.value = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    if (eventTime) eventTime.addEventListener('input', calculateEndTime);
    if (modalGuests) modalGuests.addEventListener('input', calculateEndTime);

    // --- REVISÃO E ENVIO ---
    const reviewBtn = document.getElementById('review-booking-btn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            const name = document.getElementById('client-name').value;
            const loc = document.getElementById('event-location').value;
            const time = document.getElementById('event-time').value;
            const guests = document.getElementById('modal-guests').value;

            if (!name || !loc || !time || !guests) {
                alert("⚠️ Por favor, preencha todos os campos obrigatórios.");
                return;
            }

            // Gera resumo
            const summaryContent = document.getElementById('summary-content');
            let servicesList = [];
            document.querySelectorAll('#booking-modal input[type="checkbox"]:checked').forEach(cb => {
                servicesList.push(cb.parentElement.textContent.trim());
            });

            summaryContent.innerHTML = `
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Data:</strong> ${window.currentSelectedDateObj ? window.currentSelectedDateObj.toLocaleDateString('pt-BR') : 'Data Indefinida'}</p>
                <p><strong>Horário:</strong> ${time} às ${eventEndTime.value}</p>
                <p><strong>Convidados:</strong> ${guests}</p>
                <p><strong>Local:</strong> ${loc}</p>
                <p><strong>Serviços:</strong> ${servicesList.join(', ')}</p>
                <p><strong>Total Estimado:</strong> ${document.getElementById('modal-total-display').textContent}</p>
            `;

            document.getElementById('booking-step-1').style.display = 'none';
            document.getElementById('booking-step-2').style.display = 'block';
        });
    }

    // Botão Voltar do Resumo
    const backBookingBtn = document.getElementById('back-booking-btn');
    if (backBookingBtn) {
        backBookingBtn.addEventListener('click', () => {
            document.getElementById('booking-step-2').style.display = 'none';
            document.getElementById('booking-step-1').style.display = 'block';
        });
    }

    // Envio Final (WhatsApp + Planilha)
    const confirmCommitmentBtn = document.getElementById('confirm-commitment');
    const bookingForm = document.getElementById('booking-form');
    const commitmentModal = document.getElementById('commitment-modal');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!document.getElementById('booking-disclaimer').checked) {
                alert("Confirme que é uma pré-reserva.");
                return;
            }
            commitmentModal.style.display = 'block';
        });
    }

    if (confirmCommitmentBtn) {
        confirmCommitmentBtn.addEventListener('click', () => {
            confirmCommitmentBtn.innerText = 'Processando...';
            confirmCommitmentBtn.disabled = true;

            const formData = new FormData();
            const name = document.getElementById('client-name').value;
            const loc = document.getElementById('event-location').value;
            const time = document.getElementById('event-time').value;
            const guests = document.getElementById('modal-guests').value;
            const dateIso = document.getElementById('selected-date-iso').value;

            let servicesList = [];
            document.querySelectorAll('#booking-modal input[type="checkbox"]:checked').forEach(cb => {
                servicesList.push(cb.parentElement.textContent.trim());
            });
            const servicesText = servicesList.join(', ');
            let durationCalc = (parseInt(guests) <= 30) ? "3 Horas" : "4 Horas";

            formData.append('clientName', name);
            formData.append('eventLocation', loc);
            formData.append('eventTime', time);
            formData.append('eventDuration', durationCalc);
            formData.append('selectedDateISO', dateIso);
            formData.append('services', servicesText);

            // URL DO SCRIPT DO GOOGLE (Substitua se necessário)
            const scriptURL = "https://script.google.com/macros/s/AKfycbywYl8DmGmVc3ZWYzHCYCJp8XOnBTql6zxr0L2cXP0RctfpZ7BPjlgShr0y1H90x7cO-Q/exec";

            fetch(scriptURL, { method: 'POST', body: formData })
                .then(res => res.json())
                .then(data => {
                    sendToWhatsapp(name, window.currentSelectedDateObj, guests, time, eventEndTime.value, durationCalc, loc, servicesText);
                })
                .catch(err => {
                    console.error(err);
                    alert("Erro ao salvar na planilha, redirecionando para WhatsApp...");
                    sendToWhatsapp(name, window.currentSelectedDateObj, guests, time, eventEndTime.value, durationCalc, loc, servicesText);
                })
                .finally(() => {
                    commitmentModal.style.display = 'none';
                    document.getElementById('booking-modal').style.display = 'none';
                    confirmCommitmentBtn.innerText = 'SIM, QUERO ASSINAR';
                    confirmCommitmentBtn.disabled = false;
                    bookingForm.reset();
                });
        });
    }

    function sendToWhatsapp(name, dateObj, guests, time, endTime, duration, loc, services) {
        const dateStr = dateObj ? dateObj.toLocaleDateString('pt-BR') : "";
        const total = document.getElementById('modal-total-display').textContent;

        const msg = `Olá, quero confirmar:%0A%0A*Nome:* ${name}%0A*Data:* ${dateStr}%0A*Convidados:* ${guests}%0A*Horário:* ${time} às ${endTime} (${duration})%0A*Local:* ${loc}%0A*Serviços:* ${services}%0A*Total:* ${total}`;

        window.open(`https://api.whatsapp.com/send?phone=5561982605050&text=${msg}`, '_blank');
    }

    // Cancelar Modal
    document.getElementById('cancel-commitment').addEventListener('click', () => {
        commitmentModal.style.display = 'none';
    });

    // INICIALIZAÇÃO
    updateAddonsState(); // Garante estado inicial dos adicionais
    calculateTotal();    // Garante preço inicial
    renderCalendar();    // Desenha o calendário

}); // Fim do DOMContentLoaded