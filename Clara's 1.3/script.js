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
        totalPriceElement.textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Event Listeners
    guestsInput.addEventListener('input', calculateTotal);

    for (const radio of durationInputs) {
        radio.addEventListener('change', calculateTotal);
    }

    for (const key in extraCheckboxes) {
        extraCheckboxes[key].addEventListener('change', calculateTotal);
    }

    // Initial Calculation
    calculateTotal();

    // Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            dots[index].classList.remove('active');
            if (index === currentSlide) {
                slide.classList.add('active');
                dots[index].classList.add('active');
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

    // Modal Logic
    const modal = document.getElementById('service-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalImage = document.getElementById('modal-image');

    const servicesInfo = {
        crepe: {
            title: "Clara's Crepes",
            description: "Nossa estação de crepes oferece uma experiência gastronômica única, com massas leves e recheios generosos, doces e salgados, preparados na hora para seus convidados.",
            image: "Imagem de Crepes"
        },
        drinks: {
            title: "Crystal Bar",
            description: "Um bar completo com bartenders profissionais, oferecendo coquetéis clássicos e autorais, além de opções sem álcool, trazendo sofisticação e diversão.",
            image: "Imagem de Drinks"
        },
        kids: {
            title: "Clara's Kids Menu",
            description: "Um buffet especialmente pensado para os pequenos, com mini hambúrgueres, batata frita, nuggets e outras delícias que as crianças amam.",
            image: "Imagem Kids"
        },
        trampoline: {
            title: "Saltare Diversões",
            description: "Diversão garantida com nossa cama elástica segura e monitorada, perfeita para gastar a energia da criançada.",
            image: "Imagem Cama Elástica"
        },
        popcorn: {
            title: "Clara's Pipoca Gourmet",
            description: "O cheirinho irresistível de pipoca feita na hora, com opções salgadas e doces gourmet para todos os gostos.",
            image: "Imagem Pipoca"
        }
    };

    let modalTimer;

    function openModal(serviceKey) {
        const info = servicesInfo[serviceKey];
        if (info) {
            modalTitle.textContent = info.title;
            modalDesc.textContent = info.description;
            modalImage.textContent = info.image; // Placeholder text
            modal.style.display = "block";

            // Clear any existing timer
            if (modalTimer) clearTimeout(modalTimer);

            // Auto close after 20 seconds
            modalTimer = setTimeout(() => {
                modal.style.display = "none";
            }, 20000);
        }
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = "none";
            if (modalTimer) clearTimeout(modalTimer);
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
            if (modalTimer) clearTimeout(modalTimer);
        }
    });

    // Add click listeners to checkboxes to open modal
    for (const key in extraCheckboxes) {
        if (extraCheckboxes[key]) {
            extraCheckboxes[key].addEventListener('click', (e) => {
                if (e.target.checked) {
                    openModal(key);
                }
            });
        }
    }

    // History Carousel Logic
    const historySlides = document.querySelectorAll('.history-slide');
    const prevBtnHistory = document.querySelector('.prev-btn-history');
    const nextBtnHistory = document.querySelector('.next-btn-history');
    let currentHistorySlide = 0;

    if (historySlides.length > 0) {
        function updateHistorySlides() {
            historySlides.forEach((slide, index) => {
                slide.classList.remove('active');
                if (index === currentHistorySlide) {
                    slide.classList.add('active');
                }
            });
        }

        function nextHistorySlide() {
            currentHistorySlide = (currentHistorySlide + 1) % historySlides.length;
            updateHistorySlides();
        }

        function prevHistorySlide() {
            currentHistorySlide = (currentHistorySlide - 1 + historySlides.length) % historySlides.length;
            updateHistorySlides();
        }

        if (prevBtnHistory && nextBtnHistory) {
            prevBtnHistory.addEventListener('click', prevHistorySlide);
            nextBtnHistory.addEventListener('click', nextHistorySlide);
        }

        // Auto rotate history
        setInterval(nextHistorySlide, 6000);
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
            link.addEventListener('click', () => {
                navUl.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
});
