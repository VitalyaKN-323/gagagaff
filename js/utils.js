"use strict"

// Функція для відображення повідомлень про помилки
export function showErrorMessage(message) {
    const h1 = document.querySelector('.wrapper h1');
    const msg = 
        `<div class="error">
            <p>${message}</p>
            <p><a href="/">Перейти до списку товарів!</a></p>
        </div>`;
    h1.insertAdjacentHTML('afterend', msg);
}

// Функція для отримання даних кошика з LocalStorage
export function getBasketLocalStorage() {
    const cartDataJSON = localStorage.getItem('basket');
    return cartDataJSON ? JSON.parse(cartDataJSON) : [];
}

// Функція для збереження даних кошика у LocalStorage
export function setBasketLocalStorage(basket) {
    const basketCount = document.querySelector('.basket__count');
    localStorage.setItem('basket', JSON.stringify(basket));
    basketCount.textContent = basket.length;
}

// Функція для перевірки актуальності товарів у кошику
export function checkingRelevanceValueBasket(productsData) {
    const basket = getBasketLocalStorage();

    basket.forEach((basketId, index) => {
        const existsInProducts = productsData.some(item => item.id === Number(basketId));
        if (!existsInProducts) {
            basket.splice(index, 1);
        }
    });

    setBasketLocalStorage(basket);
}

// Нова функція для форматування ціни
export function formatPrice(price) {
    return `${price.toFixed(2)}грн`;
}

// Нова функція для додавання категорії та терміну придатності до продукту
// Нова функція для додавання категорії, терміну придатності, виробника та складу до продукту
export function addCategoryAndExpiry(product) {
    const { category, expiry_date, manufacturer, composition } = product;
    return `
        <div class="product__category"><b>Категорія:</b> ${category}</div>
        <div class="product__expiry"><b>Термін придатності:</b> ${expiry_date}</div>
        <div class="product__manufacturer"><b>Виробник:</b> ${manufacturer}</div>
        <div class="product__composition"><b>Склад:</b> ${composition}</div>
    `;
}

