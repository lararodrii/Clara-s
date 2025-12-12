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
});
