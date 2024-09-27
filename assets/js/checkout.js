    const updatePriceDisplay = () => {
        const priceElement = document.querySelector('.checkout-price'); // Находим элемент с классом price
        const savedPrice = localStorage.getItem('price'); // Извлекаем цену из localStorage
        const titleElement = document.querySelector('.checkout-title'); // Находим элемент с классом title
        const savedTitle = localStorage.getItem('checkoutTitle'); // Извлекаем цену из localStorage
        if (savedPrice && savedTitle) {
            priceElement.textContent = `₽ ${savedPrice}`; // Обновляем текст элемента
            titleElement.textContent = savedTitle; // Обновляем текст элемента
        }
    };
    // Вызываем функцию, чтобы обновить цену при загрузке страницы
    updatePriceDisplay();

const createPaymentHandler = async () => {
    const trainingRussianTitle = localStorage.getItem('checkoutTitle'); // Извлекаем цену из localStorage
    const fullName = document.getElementById('nameInput').value;
    const surname = document.getElementById('surnameInput').value;
    const email = document.getElementById('emailInput').value;
    const training = localStorage.getItem('title')
    const price = localStorage.getItem('price'); // Извлекаем цену из localStorage

    console.log('fullname ' , fullName)
    const obj = {
            fullName,
            surname,
            email,
            training,
            price,
            trainingRussianTitle
        }
    if(Object.values(obj).every((item) => item && item.length > 0)){
        try {
            const response = await fetch('http://localhost:4000/create-payment-yookassa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    surname,
                    email,
                    training,
                    price,
                    trainingRussianTitle
                }),
            });
            const data = await response.json();
            console.log('data' , data)
            // После получения ссылки на оплату перенаправляем пользователя
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                console.error('Ошибка получения ссылки на оплату');
            }
        } catch (error) {
            console.error('Ошибка при инициации платежа:', error);
        }
    }
}
document.getElementById("pay-button").addEventListener('click' , createPaymentHandler)
