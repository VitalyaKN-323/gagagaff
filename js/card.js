"use strict"
import { ERROR_SERVER, PRODUCT_INFORMATION_NOT_FOUND } from './constants.js';
import { 
    showErrorMessage,
    checkingRelevanceValueBasket
} from './utils.js';

const wrapper = document.querySelector('.wrapper');
let productsData = [];

getProducts();

async function getProducts() {
    try {
        if (!productsData.length) {
            const res = await fetch('../data/products.json');
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            productsData = await res.json();
        }
        loadProductDetails(productsData);
    } catch (err) {
        showErrorMessage(ERROR_SERVER);
        console.log(err.message);
    }
}

function getParameterFromURL(parameter) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameter);
}

function loadProductDetails(data) {
    if (!data || !data.length) {
        showErrorMessage(ERROR_SERVER);
        return;
    }

    checkingRelevanceValueBasket(data);

    const productId = Number(getParameterFromURL('id'));

    if (!productId) {
        showErrorMessage(PRODUCT_INFORMATION_NOT_FOUND);
        return;
    }

    const findProduct = data.find(card => card.id === productId);

    if (!findProduct) {
        showErrorMessage(PRODUCT_INFORMATION_NOT_FOUND);
        return;
    }
    renderInfoProduct(findProduct);
}

function renderInfoProduct(product) {
    const { img, title, price, discount, descr, category, expiry_date, manufacturer, composition } = product;
    const priceDiscount = price - ((price * discount) / 100);
    const productItem = 
        `
        <div class="product">
            <h2 class="product__title">${title}</h2>
            <div class="product__img">
                <img src="./images/${img}" alt="${title}">
            </div>
            <p class="product__descr">${descr}</p>
            <div class="product__inner-price">
                <div class="product__price">
                    <b>Ціна:</b>
                    ${price}грн
                </div>
                <div class="product__discount">
                    <b>Ціна зі знижкою:</b>
                    ${priceDiscount.toFixed(2)}грн
                </div>
            </div>
            <div class="product__category">
                <b>Категорія:</b>
                ${category}
            </div>
            <div class="product__expiry">
                <b>Термін придатності:</b>
                ${expiry_date}
            </div>
            <div class="product__manufacturer">
                <b>Виробник:</b>
                ${manufacturer}
            </div>
            <div class="product__composition">
                <b>Склад:</b>
                ${composition}
            </div>
        </div>
        `;
    wrapper.insertAdjacentHTML('beforeend', productItem);
}
