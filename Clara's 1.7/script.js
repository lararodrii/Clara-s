document.addEventListener('DOMContentLoaded', function () {
    // Configuration
    const PRICES = {
        base3h: 50.00,
        base4h: 65.00,
        extras: {
            crepe: 15.00, // per person
            drinks: 25.00, // per person
            kids: 20.00,  // per person
            trampoline: 150.00, // fixed
            popcorn: 100.00     // fixed
        }
    };

    // Elements
    const guestsInput = document.getElementById('guests');
    const durationInputs = document.getElementsByName('duration');
    const extraCheckboxes = {
        crepe: document.getElementById('crepe'),
        drinks: document.getElementById('drinks'),
        kids: document.getElementById('kids'),
        trampoline: document.getElementById('trampoline'),
        popcorn: document.getElementById('popcorn')
    };
    const totalPriceElement = document.getElementById('total-price');

    // Calculation Function
    function calculateTotal() {
        let total = 0;
        const guests = parseInt(guestsInput.value) || 0;

        // 1. Base Price (Duration)
        let basePricePerPerson = 0;
        let selectedDuration = '3';

        for (const radio of durationInputs) {
            if (radio.checked) {
                selectedDuration = radio.value;
                break;
            }
        }

        if (selectedDuration === '3') {
            basePricePerPerson = PRICES.base3h;
        } else {
            basePricePerPerson = PRICES.base4h;
        }

        total += guests * basePricePerPerson;

        // 2. Per Person Extras
        if (extraCheckboxes.crepe.checked) total += guests * PRICES.extras.crepe;
        if (extraCheckboxes.drinks.checked) total += guests * PRICES.extras.drinks;
        if (extraCheckboxes.kids.checked) total += guests * PRICES.extras.kids;

        // 3. Fixed Extras
        if (extraCheckboxes.trampoline.checked) total += PRICES.extras.trampoline;
        if (extraCheckboxes.popcorn.checked) total += PRICES.extras.popcorn;

        // Update Display
        if (totalPriceElement) {
            totalPriceElement.textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    // Event Listeners
    if (guestsInput) guestsInput.addEventListener('input', calculateTotal);

    for (const radio of durationInputs) {
        radio.addEventListener('change', calculateTotal);
    }

    for (const key in extraCheckboxes) {
        if (extraCheckboxes[key]) {
            extraCheckboxes[key].addEventListener('change', calculateTotal);
        }
    }

    // Initial Calculation
    if (guestsInput) calculateTotal();

    // Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;

    // Create dots logic only if carousel exists
    if (slides.length > 0) {
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
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

        function goToSlide(index) {
            currentSlide = index;
            updateSlides();
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlides();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlides();
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', prevSlide);
            nextBtn.addEventListener('click', nextSlide);
        }

        // Auto rotate
        setInterval(nextSlide, 5000);
    }

    // Mobile Menu Logic
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');

    if (mobileMenuBtn && navUl) {
        mobileMenuBtn.addEventListener('click', () => {
            navUl.classList.toggle('active');

            // Toggle icon between bars and times (X)
            const icon = mobileMenuBtn.querySelector('i');
            if (navUl.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when a link is clicked
        const navLinks = navUl.querySelectorAll('a');
        navLinks.forEach(link => {
            // Se for o botão "Serviços" (que tem submenu), não fecha o menu e previne navegação
            if (link.classList.contains('dropbtn') && window.innerWidth <= 768) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                });
            } else {
                // Outros links fecham o menu
                link.addEventListener('click', () => {
                    navUl.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
            }
        });
    }

    // Custom Booking Calendar Logic
    const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const bookingModal = document.getElementById('booking-modal');
    const closeBookingModal = document.getElementById('close-booking-modal');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const bookingForm = document.getElementById('booking-form');
    const availabilityMessage = document.getElementById('availability-message');

    // New elements for multi-step
    const bookingStep1 = document.getElementById('booking-step-1');
    const bookingStep2 = document.getElementById('booking-step-2');
    const reviewBookingBtn = document.getElementById('review-booking-btn');
    const backBookingBtn = document.getElementById('back-booking-btn');
    const summaryContent = document.getElementById('summary-content');

    let currentDate = new Date();
    let selectedDate = null;

    if (calendarDays && monthYear) {
        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDay = firstDay.getDay();

            const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            monthYear.textContent = `${monthNames[month]} ${year}`;

            calendarDays.innerHTML = "";

            // Empty cells for previous month
            for (let i = 0; i < startingDay; i++) {
                const emptyDiv = document.createElement('div');
                emptyDiv.classList.add('calendar-day', 'empty');
                calendarDays.appendChild(emptyDiv);
            }

            // Days of the month
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.classList.add('calendar-day');
                dayDiv.textContent = i;

                const today = new Date();
                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayDiv.classList.add('today');
                }

                dayDiv.addEventListener('click', () => {
                    selectedDate = new Date(year, month, i);
                    openBookingModal(selectedDate);
                });

                calendarDays.appendChild(dayDiv);
            }
        }

        function openBookingModal(date) {
            const formattedDate = date.toLocaleDateString('pt-BR');
            selectedDateDisplay.textContent = `Data selecionada: ${formattedDate}`;

            // Set ISO date for hidden input
            const offset = date.getTimezoneOffset();
            const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
            document.getElementById('selected-date-iso').value = adjustedDate.toISOString().split('T')[0];

            // Reset steps
            bookingStep1.style.display = 'block';
            bookingStep2.style.display = 'none';
            bookingForm.reset(); // Clear previous inputs
            availabilityMessage.textContent = "";

            bookingModal.style.display = "block";
        }

        if (closeBookingModal) {
            closeBookingModal.addEventListener('click', () => {
                bookingModal.style.display = "none";
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target == bookingModal) {
                bookingModal.style.display = "none";
            }
        });

        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // Initial Render
        renderCalendar();
    }

    // Review Button Logic
    if (reviewBookingBtn) {
        reviewBookingBtn.addEventListener('click', () => {
            const name = document.getElementById('client-name').value;
            const location = document.getElementById('event-location').value;
            const duration = document.getElementById('event-duration').value;
            const time = document.getElementById('event-time').value;

            if (!name || !location || !duration || !time) {
                availabilityMessage.textContent = "Por favor, preencha todos os campos obrigatórios.";
                availabilityMessage.style.color = "red";
                return;
            }

            // Time Validation (Minutes)
            const [hours, minutes] = time.split(':').map(Number);
            if (minutes > 59) {
                availabilityMessage.textContent = "Horário inválido. Os minutos não podem ser maiores que 59.";
                availabilityMessage.style.color = "red";
                return;
            }

            // Collect Services
            const selectedServices = [];
            document.querySelectorAll('input[name="services"]:checked').forEach(checkbox => {
                selectedServices.push(checkbox.value);
            });
            const servicesText = selectedServices.length > 0 ? selectedServices.join(', ') : "Nenhum serviço extra selecionado";

            // Populate Summary
            summaryContent.innerHTML = `
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Data:</strong> ${selectedDate.toLocaleDateString('pt-BR')}</p>
                <p><strong>Horário:</strong> ${time}</p>
                <p><strong>Duração:</strong> ${duration} Horas</p>
                <p><strong>Local:</strong> ${location}</p>
                <p><strong>Serviços:</strong> ${servicesText}</p>
            `;

            // Switch Steps
            bookingStep1.style.display = 'none';
            bookingStep2.style.display = 'block';
        });
    }

    // Real-time Validation Listeners
    const eventTimeInput = document.getElementById('event-time');
    const eventDurationInput = document.getElementById('event-duration');

    function validateTimeAndAvailability() {
        const time = eventTimeInput.value;
        const duration = eventDurationInput.value;

        if (!time || !selectedDate) return;

        // 1. Validate Minutes
        const [hours, minutes] = time.split(':').map(Number);
        if (minutes > 59) {
            availabilityMessage.textContent = "Horário inválido. Os minutos não podem ser maiores que 59.";
            availabilityMessage.style.color = "red";
            reviewBookingBtn.disabled = true;
            return;
        }

        // 2. Check Availability (Server-side only now)
        availabilityMessage.textContent = "";
        reviewBookingBtn.disabled = false;

    }

    if (eventTimeInput) eventTimeInput.addEventListener('input', validateTimeAndAvailability);
    if (eventDurationInput) eventDurationInput.addEventListener('change', validateTimeAndAvailability);


    // Back Button Logic
    if (backBookingBtn) {
        backBookingBtn.addEventListener('click', () => {
            bookingStep2.style.display = 'none';
            bookingStep1.style.display = 'block';
        });
    }

    // Commitment Modal Logic
    const commitmentModal = document.getElementById('commitment-modal');
    const confirmCommitmentBtn = document.getElementById('confirm-commitment');
    const cancelCommitmentBtn = document.getElementById('cancel-commitment');

    if (cancelCommitmentBtn) {
        cancelCommitmentBtn.addEventListener('click', () => {
            commitmentModal.style.display = 'none';
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const disclaimerCheckbox = document.getElementById('booking-disclaimer');
            if (!disclaimerCheckbox.checked) {
                alert("Por favor, confirme que você está ciente de que este envio é uma pré-reserva.");
                return;
            }

            // Show Commitment Modal
            commitmentModal.style.display = 'block';
        });
    }

    if (confirmCommitmentBtn) {
        confirmCommitmentBtn.addEventListener('click', function () {
            const form = bookingForm;
            const submitBtn = form.querySelector('button[type="submit"]');

            // Visual Feedback on Confirm Button
            confirmCommitmentBtn.innerText = 'Processando...';
            confirmCommitmentBtn.disabled = true;

            var formData = new FormData();
            const name = document.getElementById('client-name').value;
            const location = document.getElementById('event-location').value;
            const duration = document.getElementById('event-duration').value;
            const time = document.getElementById('event-time').value;

            formData.append('clientName', name);
            formData.append('eventLocation', location);
            formData.append('eventDuration', duration);
            formData.append('eventTime', time);
            formData.append('selectedDateISO', document.getElementById('selected-date-iso').value);

            // Append Services
            const selectedServices = [];
            document.querySelectorAll('input[name="services"]:checked').forEach(checkbox => {
                selectedServices.push(checkbox.value);
            });
            formData.append('services', selectedServices.join(', '));

            var scriptURL = "https://script.google.com/macros/s/AKfycbywYl8DmGmVc3ZWYzHCYCJp8XOnBTql6zxr0L2cXP0RctfpZ7BPjlgShr0y1H90x7cO-Q/exec";

            fetch(scriptURL, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Construct WhatsApp Message
                        const servicesText = selectedServices.length > 0 ? selectedServices.join(', ') : "Nenhum";
                        const message = `Olá, gostaria de confirmar meu agendamento:%0A%0A*Nome:* ${name}%0A*Data:* ${selectedDate.toLocaleDateString('pt-BR')}%0A*Horário:* ${time}%0A*Duração:* ${duration} Horas%0A*Local:* ${location}%0A*Serviços:* ${servicesText}`;

                        const whatsappUrl = `https://api.whatsapp.com/send/?phone=5561982605050&text=${message}`;

                        window.open(whatsappUrl, '_blank');

                        // Close modals and reset
                        commitmentModal.style.display = 'none';
                        bookingModal.style.display = "none";
                        form.reset();

                        // Reset Step 1
                        bookingStep2.style.display = 'none';
                        bookingStep1.style.display = 'block';

                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro detalhado:', error);
                    commitmentModal.style.display = 'none';

                    // Switch back to Step 1 to show the error
                    bookingStep2.style.display = 'none';
                    bookingStep1.style.display = 'block';

                    const errorMsgDiv = document.getElementById('availability-message');
                    errorMsgDiv.innerText = "Erro ao salvar: " + error.message;
                    errorMsgDiv.style.color = 'red';
                })
                .finally(() => {
                    confirmCommitmentBtn.innerText = 'SIM, QUERO ASSINAR O CONTRATO';
                    confirmCommitmentBtn.disabled = false;
                });
        });
    }

    // Navbar Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Scroll Animations (Fade In Up)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => observer.observe(el));

});