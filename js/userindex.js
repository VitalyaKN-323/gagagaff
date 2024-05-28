"use strict"

import { 
    showErrorMessage,
    setBasketLocalStorage,
    getBasketLocalStorage,
    checkingRelevanceValueBasket
} from './utils.js';

import { 
    COUNT_SHOW_CARDS_CLICK, 
    ERROR_SERVER,
    NO_PRODUCTS_IN_THIS_CATEGORY
} from './constants.js';

const cards = document.querySelector('.cards');
const btnShowCards = document.querySelector('.show-cards');
let shownCards = COUNT_SHOW_CARDS_CLICK;
let countClickBtnShowCards = 1;
let productsData = [];

getProducts();

btnShowCards.addEventListener('click', sliceArrCards);
cards.addEventListener('click', handleCardClick);

async function getProducts() {
    try {
        if (!productsData.length) {
            const res = await fetch('../data/products.json');
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            productsData = await res.json();

            // Додайте поле ID кожному товару
            productsData.forEach((product, index) => {
                product.id = index + 1; // Можете використати будь-який унікальний ідентифікатор
            });
        }

        if ((productsData.length > COUNT_SHOW_CARDS_CLICK) && 
            btnShowCards.classList.contains('none')) {
            btnShowCards.classList.remove('none');
        }
        
        renderStartPage(productsData);

    } catch (err) {
        showErrorMessage(ERROR_SERVER);
        console.log(err.message);
    }
}


function renderStartPage(data) {
    if (!data || !data.length) {
        showErrorMessage(NO_PRODUCTS_IN_THIS_CATEGORY);
        return;
    }

    const arrCards = data.slice(0, COUNT_SHOW_CARDS_CLICK);
    createCards(arrCards);

    checkingRelevanceValueBasket(data);

    const basket = getBasketLocalStorage();
    checkingActiveButtons(basket);
}

function sliceArrCards() {
    if(shownCards >= productsData.length) return;

    countClickBtnShowCards++;
    const countShowCards = COUNT_SHOW_CARDS_CLICK * countClickBtnShowCards;

    const arrCards = productsData.slice(shownCards, countShowCards);
    createCards(arrCards);
    shownCards = cards.children.length;

    if(shownCards >= productsData.length) {
        btnShowCards.classList.add('none');
    }
}

function handleCardClick(event) {
    const targetButton = event.target.closest('.card__add');
    if (!targetButton) return;

    const card = targetButton.closest('.card');
    const id = card.dataset.productId;
    const basket = getBasketLocalStorage();

    if (basket.includes(id)) return;

    basket.push(id);
    setBasketLocalStorage(basket);
    checkingActiveButtons(basket);
}

function checkingActiveButtons(basket) {
    const buttons = document.querySelectorAll('.card__add');

    buttons.forEach(btn => {
        const card = btn.closest('.card');
        const id = card.dataset.productId;
        const isInBasket = basket.includes(id);

        btn.disabled = isInBasket;
        btn.classList.toggle('active', isInBasket);
        btn.textContent = isInBasket ? 'У кошику' : 'В кошик';
    });
}

function createCards(data) {
    data.forEach(card => {
        const { id, img, title, price, discount, category, expiry_date, manufacturer, composition } = card;
        const priceDiscount = price - ((price * discount) / 100);
        const cardItem = 
            `
                <div class="card" data-product-id="${id}">
                    <div class="card__top">
                        <a href="/card.html?id=${id}" class="card__image">
                            <img
                                src="./images/${img}"
                                alt="${title}"
                            />
                        </a>
                        <div class="card__label">-${discount}% знижка</div>
                    </div>
                    <div class="card__bottom">
                        <div class="card__prices">
                            <div class="card__price card__price--discount">${priceDiscount.toFixed(2)}грн</div>
                            <div class="card__price card__price--common">${price}грн</div>
                        </div>
                        <a href="/card.html?id=${id}" class="card__title">${title}</a>
                        <div class="card__category"><b>Категорія:</b> ${category}</div>
                        <div class="card__expiry"><b>Термін придатності:</b> ${expiry_date}</div>
                        <div class="card__manufacturer"><b>Виробник:</b> ${manufacturer}</div>
                        <div class="card__composition"><b>Склад:</b> ${composition}</div>
                        <button class="card__add">В кошик</button>
                    </div>
                </div>
            `;
        cards.insertAdjacentHTML('beforeend', cardItem);
    });
}

// Отримання всіх кнопок "Редагувати товар"
const editButtons = document.querySelectorAll('.card__edit');

// Додавання обробника подій для кожної кнопки
editButtons.forEach(button => {
    button.addEventListener('click', openModal);
});

// Функція для відкриття модального вікна
function openModal(event) {
    const modal = document.querySelector('.modal');
    modal.style.display = 'block';

    // Отримання id товару з атрибута data-id кнопки "Редагувати"
    const productId = event.target.dataset.id;

    // Заповнення поля вводу id товару
    const productIdInput = document.getElementById('productId');
    productIdInput.value = productId;
}

document.addEventListener('DOMContentLoaded', async function () {
    const icona = document.querySelector('.searchInput .icona');
    const searchInput = document.querySelector('.searchInput');
    const searchField = document.querySelector('#searchInput');

    icona.onclick = function() {
        searchInput.classList.toggle('active');
    };

    searchField.addEventListener('input', handleSearchInput);

    // Отримання всіх товарів з файлу products.json під час завантаження сторінки
    const allProducts = await getAllProductsFromJSON();

    function handleSearchInput(event) {
        const query = event.target.value.trim().toLowerCase();

        // Фільтрація товарів за введеним користувачем запитом
        const filteredProducts = allProducts.filter(product => {
            return product.title.toLowerCase().includes(query);
        });

        renderSearchResults(filteredProducts);
    }

    function renderSearchResults(products) {
        const cardsContainer = document.querySelector('.cards');
        cardsContainer.innerHTML = '';

        if (products.length === 0) {
            const message = document.getElementById('message');
            message.textContent = 'Товарів з такою назвою не знайдено';
            message.style.display = 'block';
        } else {
            const message = document.getElementById('message');
            message.style.display = 'none';
            products.forEach(product => {
                const cardItem = `
                    <div class="card" data-product-id="${product.id}">
                        <a href="/card.html?id=${product.id}">
                            <h2>${product.title}</h2>
                        </a>
                    </div>
                `;
                cardsContainer.insertAdjacentHTML('beforeend', cardItem);
            });
        }
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const icona = document.querySelector('.searchInput .icona');
    const searchInput = document.querySelector('.searchInput');
    const searchField = document.querySelector('#searchInput');
    const cardsContainer = document.querySelector('.cards');
    const productsData = [
        {
            "id": 1,
            "title": "Банан",
            "price": "20",
            "discount": "5",
            "img": "banana.webp",
            "descr": "Банан як банан що тут сказати.",
            "category": "Фрукти",
            "expiry_date": "5 днів",
            "manufacturer": "Ферма 'Сонячне Лукошко'",
            "composition": "100% банани"
        },
        {
            "id": 2,
            "title": "Яблуко",
            "price": "15",
            "discount": "15",
            "img": "yabko.webp",
            "descr": "Яблуко(зелене)",
            "category": "Фрукти",
            "expiry_date": "7 днів",
            "manufacturer": "Органічні ферми Зелений Сад",
            "composition": "Яблука веганського виробництва"
        },
        {
            "id": 3,
            "title": "Молоко",
            "price": "25",
            "discount": "5",
            "img": "Milk.webp",
            "descr": "Молоко 3.2% жиру",
            "category": "Молочка",
            "expiry_date": "10 днів",
            "manufacturer": "Кооператив 'Молочна Родина'",
            "composition": "Молоко, стабілізатори"
        },
        {
            "id": 4,
            "title": "Хліб",
            "price": "21",
            "discount": "50",
            "img": "Bread.webp",
            "descr": "Хліб(білий пшеничний)",
            "category": "Випічка",
            "expiry_date": "3 дні",
            "manufacturer": "Пекарня 'Смачний кущ'",
            "composition": "Пшеничне борошно, вода, дріжжі, сіль"
        },
        {
            "id": 5,
            "title": "Живчик",
            "price": "40",
            "discount": "30",
            "img": "aple.webp",
            "descr": "Солодка водичка - Живчик",
            "category": "Напої",
            "expiry_date": "30 днів",
            "manufacturer": "'Очищена Смаковитість'",
            "composition": "Вода, цукор, ароматизатори"
        },
        {
            "id": 6,
            "title": "Філe кур'яче",
            "price": "138",
            "discount": "10",
            "img": "chike.webp",
            "descr": "Грудка куряча",
            "category": "М'ясо",
            "expiry_date": "5 днів",
            "manufacturer": "Ферма 'Смачна Курочка'",
            "composition": "М'ясо курки"
        },
        {
            "id": 7,
            "title": "Апельсиновий сік",
            "price": "10",
            "discount": "2",
            "img": "apelsinshake.webp",
            "descr": "Апельсиновий сік",
            "category": "Напої",
            "expiry_date": "7 днів",
            "manufacturer": "Фабрика 'Соковиті Квіти'",
            "composition": "Сок з апельсинів, вода, цукор"
        },
        {
            "id": 8,
            "title": "Сир",
            "price": "59",
            "discount": "5",
            "img": "sirr.webp",
            "descr": "Сир пористий",
            "category": "Молочка",
            "expiry_date": "14 днів",
            "manufacturer": "Сирна Ферма 'Пухнасті обійми'",
            "composition": "Молоко, закваска, сіль"
        },
        {
            "id": 9,
            "title": "Помідор",
            "price": "10",
            "discount": "5",
            "img": "tomato.webp",
            "descr": "Помідор соковитий квасни)))))",
            "category": "Овочі",
            "expiry_date": "5 днів",
            "manufacturer": "Сади'Сонячний урожай'",
            "composition": "Органічного виробництва"
        },
        {
            "id": 10,
            "title": "Огірок",
            "price": "8",
            "discount": "0",
            "img": "Gg.webp",
            "descr": "Ну огірок нічо більше.",
            "category": "Овочі",
            "expiry_date": "7 днів",
            "manufacturer": "Органічні городи 'Зелений дім'",
            "composition": "Огірки без ГМО"
        },
        {
            "id": 11,
            "title": "Суші",
            "price": "200",
            "discount": "4",
            "img": "susi.webp",
            "descr": "Суші з лососем 300грам.",
            "category": "Готові страви",
            "expiry_date": "1 день",
            "manufacturer": "Ресторан 'Смачні Суші'",
            "composition": "Рис, лосось, норі, соєвий соус"
        },
        {
            
                "id": 12,
                "title": "Віскі",
                "price": "3500",
                "discount": "15",
                "img": "VISKI.webp",
                "descr": "Віскі",
                "category": "Алкоголь",
                "expiry_date": "Необмежений",
                "manufacturer": "'Джентльменська Традиція'",
                "composition": "Зі спеціально відібраних зерен-Віскі."
            
            
            
        }
        // Додайте решту продуктів тут
    ];

    icona.onclick = function() {
        searchInput.classList.toggle('active');
    };

    searchField.addEventListener('input', handleSearchInput);

    function handleSearchInput(event) {
        const query = event.target.value.trim().toLowerCase(); // Отримуємо введений текст і перетворюємо його на нижній регістр

        // Фільтруємо товари за введеним користувачем запитом
        const filteredProducts = productsData.filter(product => {
            return product.title.toLowerCase().includes(query);
        });

        renderSearchResults(filteredProducts); // Відображаємо знайдені товари на сторінці
    }

    // Функція відображення результатів пошуку
    function renderSearchResults(products) {
        cardsContainer.innerHTML = ''; // Очищуємо контейнер з карточками

        if (products.length === 0) {
            cardsContainer.innerHTML = '<p>Товарів з такою назвою не знайдено</p>';
        } else {
            products.forEach(product => {
                const cardItem = `
                    <div class="card" data-product-id="${product.id}">
                        <a href="/card.html?id=${product.id}">
                            <h2>${product.title}</h2>
                        </a>
                    </div>
                `;
                cardsContainer.insertAdjacentHTML('beforeend', cardItem);
            });
        }
    }
});
