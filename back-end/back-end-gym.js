require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Маршрут для запроса авторизации
app.get('/auth/yoomoney', (req, res) => {
    const { CLIENT_ID, REDIRECT_URI, SCOPE, INSTANCE_NAME } = process.env;

    const params = {
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPE,
        instance_name: INSTANCE_NAME || 'default_instance'
    };

    const authorizationUrl = `https://yoomoney.ru/oauth/authorize?${querystring.stringify(params)}`;

    // Перенаправление пользователя на страницу авторизации YooMoney
    res.redirect(authorizationUrl);
});

// Маршрут для обработки перенаправления после авторизации
app.get('/callback', async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
        // Обработка ошибок авторизации
        return res.status(400).send(`Ошибка авторизации: ${error_description || error}`);
    }

    if (!code) {
        return res.status(400).send('Отсутствует код авторизации.');
    }

    try {
        // Обмен временного кода на access_token
        const tokenResponse = await axios.post('https://yoomoney.ru/oauth/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in, token_type } = tokenResponse.data;

        // Здесь вы можете сохранить access_token в базе данных или сессии пользователя
        // Например:
        // await saveTokenToDatabase(userId, access_token, refresh_token);

        res.send('Авторизация прошла успешно! Теперь вы можете использовать YooMoney API.');
    } catch (err) {
        console.error('Ошибка при обмене кода на токен:', err.response ? err.response.data : err.message);
        res.status(500).send('Ошибка при обмене кода на токен.');
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
