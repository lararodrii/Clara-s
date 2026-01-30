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
    let globalEstimatedTotal = 0;
    
    // Inputs Principais
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
    // 🛠️ FUNÇÃO: DESTRAVAR ADICIONAIS
    // ==========================================
    function updateAddonsState() {
        const mainServices = [
            inputs.buffetEssencial, inputs.buffetEspecial, inputs.buffetPremium,
            inputs.massas, inputs.crepe, inputs.hotdog, inputs.carts, inputs.popcornPremium
        ];
        
        // Verifica se algum serviço principal está marcado
        const isMainSelected = mainServices.some(input => input && input.checked);

        const addons = [inputs.addonDrinks, inputs.addonSavory, inputs.addonGlass, inputs.addonCutlery, inputs.addonNutella];

        addons.forEach(addon => {
            if (addon) {
                addon.disabled = !isMainSelected;
                if (!isMainSelected) addon.checked = false;
            }
        });

        // Regra da Nutella (Só aparece se Pipoca Gourmet estiver marcada)
        if (inputs.popcornPremium && inputs.containerNutella) {
            const showNutella = inputs.popcornPremium.checked;
            inputs.containerNutella.style.display = showNutella ? 'flex' : 'none';
            if (!showNutella && inputs.addonNutella) inputs.addonNutella.checked = false;
        }

        calculateTotal();
    }

    // ==========================================
    // 💰 FUNÇÃO: CALCULAR TOTAL
    // ==========================================
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

        // Soma Principais
        if (inputs.buffetEssencial?.checked) total += guests * getTierPrice('essencial');
        if (inputs.buffetEspecial?.checked) total += guests * getTierPrice('especial');
        if (inputs.buffetPremium?.checked) total += guests * getTierPrice('premium');
        if (inputs.massas?.checked) total += guests * PRICES.services.massas;
        if (inputs.crepe?.checked) total += guests * PRICES.services.crepe;
        if (inputs.popcornPremium?.checked) total += PRICES.services.popcorn_premium;

        // Regras de Limite (Hot Dog e Carrinho)
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

        // Soma Adicionais
        if (inputs.addonDrinks?.checked) total += guests * PRICES.addons.drinks;
        if (inputs.addonSavory?.checked) total += guests * PRICES.addons.savory;
        if (inputs.addonGlass?.checked) total += guests * PRICES.addons.glass;
        if (inputs.addonCutlery?.checked) total += guests * PRICES.addons.cutlery;
        if (inputs.popcornPremium?.checked && inputs.addonNutella?.checked) total += PRICES.addons.nutella;

        // Renderiza
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

    // ==========================================
    // 👂 LISTENERS DE INPUTS
    // ==========================================
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
    // 📅 CALENDÁRIO & MODAL
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

    // --- FUNÇÃO DE ABRIR MODAL ---
    function openBookingModal(date) {
        window.currentSelectedDateObj = date; // Salva data globalmente
        
        const modal = document.getElementById('booking-modal');
        const dateDisplay = document.getElementById('selected-date-display');
        const isoInput = document.getElementById('selected-date-iso');
        
        // Reset Visual
        document.getElementById('booking-step-1').style.display = 'block';
        document.getElementById('booking-step-2').style.display = 'none';
        document.getElementById('booking-form').reset();

        // Preenche Data
        dateDisplay.textContent = `Data selecionada: ${date.toLocaleDateString('pt-BR')}`;
        
        // Ajuste Fuso Horário ISO
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        isoInput.value = adjustedDate.toISOString().split('T')[0];

        // Traz valor e convidados da calculadora
        document.getElementById('modal-guests').value = globalGuests;
        document.getElementById('modal-total-display').textContent = "R$ " + document.getElementById('total-price').textContent;

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
                // Nutella Visual no Modal
                if (sourceId === 'service-popcorn-premium') {
                    const nutellaContainer = document.getElementById('modal-container-addon-nutella');
                    if (nutellaContainer) nutellaContainer.style.display = source.checked ? 'block' : 'none';
                }
            }
        }

        modal.style.display = "block";
    }

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

    // ==========================================
    // 📝 BOTÃO DE REVISÃO (CORRIGIDO)
    // ==========================================
    const reviewBtn = document.getElementById('review-booking-btn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            // 1. Coleta Dados
            const name = document.getElementById('client-name').value;
            const loc = document.getElementById('event-location').value;
            const time = document.getElementById('event-time').value;
            const guests = document.getElementById('modal-guests').value;
            
            // 2. Validação
            if (!name || !loc || !time || !guests) {
                alert("⚠️ Preencha todos os campos obrigatórios (Nome, Local, Horário e Convidados).");
                return;
            }

            // 3. Recupera Data com SEGURANÇA (Se a variável falhar, lê do texto)
            let dateStr = "";
            if (window.currentSelectedDateObj) {
                dateStr = window.currentSelectedDateObj.toLocaleDateString('pt-BR');
            } else {
                // Fallback: lê direto do elemento HTML
                const displayTxt = document.getElementById('selected-date-display').innerText;
                dateStr = displayTxt.replace('Data selecionada: ', '').trim();
            }

            // 4. Lista Serviços
            let servicesList = [];
            document.querySelectorAll('#booking-modal input[type="checkbox"]:checked').forEach(cb => {
                if(cb.parentElement) servicesList.push(cb.parentElement.innerText.trim());
            });

            // 5. Monta HTML do Resumo
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

            // 6. Troca de Tela
            document.getElementById('booking-step-1').style.display = 'none';
            document.getElementById('booking-step-2').style.display = 'block';
            document.querySelector('.booking-modal-content').scrollTop = 0;
        });
    }

    // Botão Voltar
    document.getElementById('back-booking-btn')?.addEventListener('click', () => {
        document.getElementById('booking-step-2').style.display = 'none';
        document.getElementById('booking-step-1').style.display = 'block';
    });

    // ==========================================
    // 📤 ENVIO FINAL
    // ==========================================
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

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            confirmBtn.innerText = "Enviando...";
            confirmBtn.disabled = true;

            const name = document.getElementById('client-name').value;
            const loc = document.getElementById('event-location').value;
            const time = document.getElementById('event-time').value;
            const guests = document.getElementById('modal-guests').value;
            const isoDate = document.getElementById('selected-date-iso').value;
            const endTime = document.getElementById('event-end-time').value;
            
            // Serviços Texto
            let sList = [];
            document.querySelectorAll('#booking-modal input[type="checkbox"]:checked').forEach(cb => {
                sList.push(cb.parentElement.innerText.trim());
            });
            const sText = sList.join(', ');

            // Envia para Planilha
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
                // WhatsApp
                const total = document.getElementById('modal-total-display').innerText;
                // Data Display Seguro
                let displayDate = document.getElementById('selected-date-display').innerText.replace('Data selecionada: ', '');
                
                const msg = `Olá, quero confirmar:%0A%0A*Nome:* ${name}%0A*Data:* ${displayDate}%0A*Convidados:* ${guests}%0A*Horário:* ${time} às ${endTime}%0A*Local:* ${loc}%0A*Serviços:* ${sText}%0A*Total:* ${total}`;
                
                window.open(`https://api.whatsapp.com/send?phone=5561982605050&text=${msg}`, '_blank');
                
                // Limpa tudo
                commitModal.style.display = 'none';
                document.getElementById('booking-modal').style.display = 'none';
                confirmBtn.innerText = "SIM, QUERO ASSINAR";
                confirmBtn.disabled = false;
                bookingForm.reset();
            });
        });
    }

    // Inicialização
    updateAddonsState();
    calculateTotal();
    renderCalendar();
});