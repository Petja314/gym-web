const express = require("express");
const querystring = require("querystring");
const axios = require("axios");

const CLIENT_ID_YOOMONEY = process.env.CLIENT_ID_YOOMONEY
const ACCESS_TOKEN = ""
app.use(express.json());
// инициаллизация приложения oauth
app.post('/oauth',  async (req, res) => {
    const requestData = {
        client_id: "9A6205257E20B264DFBB76678F5BDD25228DC1830D98D791A01CFAF833C7AF2A",
        response_type: 'code',
        redirect_uri: 'https://petja314.github.io/gym-web/',
        scope: 'account-info operation-history operation-details payment money-source',
    };

    // Формируем строку запроса
    const queryString = querystring.stringify(requestData);

    // Формируем полный URL для редиректа пользователя
    const authUrl = `https://yoomoney.ru/oauth/authorize?${queryString}`;

    console.log(authUrl)

    res.json({
        success: true,
        redirectUrl: authUrl,
    });
    // Перенаправляем пользователя на страницу авторизации ЮMoney
    // res.redirect(authUrl);

});

//Эндпоинт для обмена временного токена на access_token
app.post('/get_access_token_swap', async (req, res) => {
    // const { code } = req.body; // Получаем код из тела запроса
    // console.log('code' , code)
    // if (!code) {
    //     return res.status(400).json({
    //         success: false,
    //         message: 'Не удалось получить временный токен (authorization code)',
    //     });
    // }

    try {
        const tokenRequestData = {
            code: "645599042794BEDC772CECC000326456D3EB948318D26D86CFAFC9591E8BBF76433F8640C9F795F419DD4D01070C24A4871B44703137DA4306D66FDCCBBCA53B5CDA70A9F8EE5A90677C3A00D40A3D8D55F832F15AD93388E22B7E8372CDA9591A3CB3E369AAB637B720E64070B2E40E172E8C31DFE74646A36400C5CC30F1A0",
            client_id: "9A6205257E20B264DFBB76678F5BDD25228DC1830D98D791A01CFAF833C7AF2A",
            grant_type: 'authorization_code',
            redirect_uri: 'https://petja314.github.io/gym-web/',
        };

        const tokenResponse = await axios.post(
            'https://yoomoney.ru/oauth/token',
            new URLSearchParams(tokenRequestData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token } = tokenResponse.data;
        console.log('access_token ' , access_token)
        if (access_token) {
            // Здесь можно обработать access_token (например, сохранить в сессии или БД)
            res.json({
                success: true,
                access_token: access_token,
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Не удалось получить токен авторизации',
            });
        }
    } catch (error) {
        console.error('Ошибка при обмене временного токена на access_token:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обмене временного токена',
            error: error.message,
        });
    }
});

// Эндпоинт для создания платежа
app.post('/api/request-payment-yoomoney', async (req, res) => {
    const accessToken = "4100118835342992.24DA1C2BD395F0E219CECD7EF731626E1A72515A2479D41945CFA8E1832260554B49CAA88B51460F8BE6C58FDA7BEAF346FF4D9604DF347E79A253FEBF59A5D41DECA1EED05F287A99AC1F30774CF5790EC6B60DC52879E7E01CD3F0E98D26D520E48C9DBDEF6DDCA25B03877238EB8A5ABD5A34BBF9464413673A86D8AC8516"; // Токен авторизации
    const {title , price } = req.body;
    const requestData = {
        pattern_id	: "p2p" ,
        to	: "4100116572436069" , //Идентификатор получателя перевода (номер счета, номер телефона или email).
        amount	: price , //Сумма к оплате (столько заплатит отправитель).
        amount_due	: price , //Сумма к получению (придет на счет получателя после оплаты).
        comment		: title , //Комментарий к переводу, отображается в истории отправителя.
        message	: title , //Комментарий к переводу, отображается получателю.
    }
    // Формируем строку запроса

    try {
        const queryString = querystring.stringify(requestData);
        console.log('queryString' , queryString)
        // pattern_id=p2p&to=3213131&amount=1490&comment=beginner-mass-gain&message=beginner-mass-gain

        // Шаг 1: запрос на создание платежа через YooMoney API
        const response = await axios.post('https://yoomoney.ru/api/request-payment', queryString, {
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Заголовок авторизации
                'Content-Type': 'application/x-www-form-urlencoded', // Устанавливаем тип контента
            },
        });

        const paymentData = response.data;
        console.log('response >' , response.status)
        console.log(' response data' , response.data)
        // Возвращаем ссылку на оплату пользователю на фронтенд
        return res.json({
            paymentData
            // paymentUrl: paymentData.contract_url,
        });
    }catch (error) {
        if (error.response) {
            console.error('Status code:', error.response.status);  // HTTP статус код
            console.error('Response headers:', error.response.headers);  // Заголовки ответа
            console.error('Response data:', error.response.data);  // Данные ответа
        } else {
            console.error('Error message:', error.message);
        }
        return res.status(500).json({
            error: 'Ошибка создания платежа',
            details: error.response?.data || error.message,
        });
    }
});


// Эндпоинт для обработки успешного платежа
app.get('/process-payment-yoomoney', async (req, res) => {
    // Предположим, request_id был сохранен на сервере при создании платежа
    const requestId = req.query.request_id || 'request_id_из_базы_данных'; // Варианты получения request_id
    const accessToken = 'ваш_access_token';

    try {
        // Вызов process-payment для авторизации и завершения платежа
        const response = await axios.post(
            'https://yoomoney.ru/api/process-payment',
            {
                request_id: requestId,  // Передаем request_id для завершения платежа
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const paymentResult = response.data;

        // Проверка статуса платежа
        if (paymentResult.status === 'success') {
            res.send('Платеж успешно завершен!');
        } else {
            res.send('Ошибка при завершении платежа.');
        }
    } catch (error) {
        console.error('Ошибка при процессинге платежа:', error.response?.data || error.message);
        res.status(500).send('Ошибка завершения платежа.');
    }
});