const getPriceValue = async (button) => {
    const price = button.value
    const title = button.closest('[data-block="pricing-block"]').getAttribute('data-title');
    const checkOutTitle = button.querySelector('[data-title-checkout]').getAttribute('data-title-checkout');

    // // Получаем текущие значения из localStorage
    const getCurrentPriceLs = localStorage.getItem('price');
    const getCurrentCheckoutTitleLs = localStorage.getItem('checkoutTitle');
    const getCurrentTitleLs = localStorage.getItem('title');

    // // Проверяем, изменились ли значения, и обновляем localStorage
    if (getCurrentPriceLs !== price) {
        localStorage.setItem('price', price);
    }

    if (getCurrentTitleLs !== title) {
        localStorage.setItem('title', title);
    }

    if (getCurrentCheckoutTitleLs !== checkOutTitle) {
        localStorage.setItem('checkoutTitle', checkOutTitle);
    }
    // // Перенаправление на shop-checkout.html после обновления localStorage
    window.location.href = 'shop-checkout.html';
};

