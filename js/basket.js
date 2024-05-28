"use strict"
import { ERROR_SERVER, NO_ITEMS_CART } from './constants.js';
import { 
    showErrorMessage,
    setBasketLocalStorage,
    getBasketLocalStorage,
    checkingRelevanceValueBasket
} from './utils.js';

const cart = document.querySelector('.cart');
let productsData = [];
getProducts();
cart.addEventListener('click', delProductBasket);
document.addEventListener('DOMContentLoaded', () => {
    const btnSend = document.querySelector('.btn-send');
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.querySelector('.close-order-modal');

    btnSend.addEventListener('click', () => {
        orderModal.style.display = 'block'; // При натисканні на кнопку відображаємо модальне вікно
    });

    closeOrderModal.addEventListener('click', () => {
        orderModal.style.display = 'none'; // При натисканні на кнопку закриття приховуємо модальне вікно
    });
});

async function getProducts() {
    try {
        if (!productsData.length) {
            const res = await fetch('../data/products.json');
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            productsData = await res.json();
        }
        loadProductBasket(productsData);
    } catch (err) {
        showErrorMessage(ERROR_SERVER);
        console.log(err.message);
    }
}

function loadProductBasket(data) {
    cart.textContent = '';
    if (!data || !data.length) {
        showErrorMessage(ERROR_SERVER);
        return;
    }
    checkingRelevanceValueBasket(data);
    const basket = getBasketLocalStorage();
    if (!basket || !basket.length) {
        showErrorMessage(NO_ITEMS_CART);
        return;
    }
    const findProducts = data.filter(item => basket.includes(String(item.id)));
    if (!findProducts.length) {
        showErrorMessage(NO_ITEMS_CART);
        return;
    }
    renderProductsBasket(findProducts);
}

function delProductBasket(event) {
    const targetButton = event.target.closest('.cart__del-card');
    if (!targetButton) return;
    const card = targetButton.closest('.cart__product');
    const id = card.dataset.productId;
    const basket = getBasketLocalStorage();
    const newBasket = basket.filter(item => item !== id);
    setBasketLocalStorage(newBasket);
    getProducts();
}

function renderProductsBasket(arr) {
    arr.forEach(card => {
        const { id, img, title, price, discount, category, expiry_date, manufacturer, composition } = card;
        const priceDiscount = price - ((price * discount) / 100);
        const cardItem =  `
        <div class="cart__product" data-product-id="${id}">
            <div class="cart__img">
                <img src="./images/${img}" alt="${title}">
            </div>
            <div class="cart__title">${title}</div>
            <div class="cart__category">Категорія: ${category}</div>
            <div class="cart__expiry">Термін придатності: ${expiry_date}</div>
            <div class="cart__manufacturer">Виробник: ${manufacturer}</div>
            <div class="cart__composition">Склад: ${composition}</div>
            <div class="cart__block-btns">
                <div class="cart__minus">-</div>
                <div class="cart__count">1</div>
                <div class="cart__plus">+</div>
            </div>
            <div class="cart__price">
                <span>${price}</span>грн
            </div>
            <div class="cart__price-discount">
                <span>${priceDiscount.toFixed(2)}</span>грн
            </div>
            <div class="cart__del-card">X</div>
        </div>
        `;
        cart.insertAdjacentHTML('beforeend', cardItem);
    });
}
// Отримуємо посилання на кнопку "Оформити замовлення"
const orderButton = document.querySelector('.btn-send');

// Отримуємо посилання на модальне вікно
const orderModal = document.getElementById('orderModal');

// Додаємо обробник подій для кліку на кнопку "Оформити замовлення"
orderButton.addEventListener('click', function() {
    // Відображаємо модальне вікно
    orderModal.style.display = 'block';
});

// Отримуємо посилання на елемент, що закриває модальне вікно
const closeModalButton = orderModal.querySelector('.close-order-modal');

// Додаємо обробник подій для кліку на кнопку закриття модального вікна
closeModalButton.addEventListener('click', function() {
    // Закриваємо модальне вікно
    orderModal.style.display = 'none';
});

// Додаємо обробник подій для кліку поза модальним вікном, який також закриває модальне вікно
window.addEventListener('click', function(event) {
    if (event.target === orderModal) {
        orderModal.style.display = 'none';
    }
});
