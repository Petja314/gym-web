const express = require('express');
const dotenv = require('dotenv');
const { Resend } = require('resend'); // Импортируем Resend
const app = express();
const fs = require('fs');
const path = require('path');
const axios = require("axios");
const cors = require('cors');
const port = 4000 || process.env.PORT


dotenv.config();
app.use(express.json());
app.use(cors());

// Эндпоинт для создание оплаты yoo-kassa
app.post('/create-payment-yookassa', async (req, res) => {
    // Предположим, request_id был сохранен на сервере при создании платежа
    const {
        fullName,
        surname,
        email,
        training,
        price,
        trainingRussianTitle
    } = req.body;
    console.log('fullName' , fullName)
    const API_KEY = process.env.YOO_KASSA_API_KEY
    const SHOP_ID = process.env.YOO_KASSA_SHOP_ID

    try {
        const response = await axios.post(
            'https://api.yookassa.ru/v3/payments',
            {
                amount: {
                    value: price,
                    currency: "RUB"
                },
                capture: true,
                description: trainingRussianTitle,
                metadata: {
                    fullName,
                    surname,
                    email,
                    training,
                    price
                },
                confirmation: {
                    type: "redirect",
                    return_url: "http://127.0.0.1:8080/xhtml/"
                }
            },
            {
                auth: {
                    username: SHOP_ID, // Ваш идентификатор магазина
                    password: API_KEY // Ваш секретный ключ
                },
                headers: {
                    'Idempotence-Key': Math.random().toString(36).substring(7), // Уникальный ключ для идемпотентности
                    'Content-Type': 'application/json' // Устанавливаем тип контента
                }
            }
        );
        console.log('response.data >' ,response.data.status )


        const paymentUrl = response.data.confirmation.confirmation_url
        if(paymentUrl){
            return res.json({
                paymentUrl,
                status : response.data.status
            });
        }

    } catch (error) {
        console.error('Ошибка при процессинге платежа:', error.response?.data || error.message);
        res.status(500).send('Ошибка завершения платежа.');
    }
});

app.post('/yookassa/webhook', async (req, res) => {
    const notification = req.body;
    console.log('Webhook notification:', JSON.stringify(notification, null, 2));
    const fullName = notification.object.metadata.fullName
    const surname = notification.object.metadata.surname
    const email = notification.object.metadata.email
    const training = notification.object.metadata.training
    const price = notification.object.metadata.price

    if (notification.event === 'payment.succeeded') {
        const payment = notification.object;
        console.log(`Платеж ${payment.id} завершен успешно!`);
        // отправить email
        await sendEmailHandler(fullName, surname, email, training, price)
    }

    res.status(200).send('Webhook received');
});



const packages = {
    "beginner-mass-gain" : {
        "1490" : {
            period : "3months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "beginner-mass-gain-3month.pdf"
        },
        "1990" : {
            period : "6months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "beginner-mass-gain-6month.pdf"

        }
    },
    "beginner-shredded" : {
        "1490" : {
            period : "3months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "beginner-shredded-3month.pdf"

        },
        "1990" : {
            period : "6months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "beginner-shredded-6month.pdf"

        }
    },
    "advanced-classic-split" : {
        "2490" : {
            period : "3months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "advanced-classic-split-3month.pdf"

        },
        "2990" : {
            period : "6months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "advanced-classic-split-6month.pdf"

        }
    },
    "advanced-upper-body" : {
        "2490" : {
            period : "3months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "advanced-upper-body-3month.pdf"

        },
        "2990" : {
            period : "6months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "advanced-upper-body-6month.pdf"

        }
    },
    "advanced-lower-body" : {
        "2490" : {
            period : "3months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "advanced-lower-body-3month.pdf"

        },
        "2990" : {
            period : "6months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "advanced-lower-body-6month.pdf"

        }
    },
    "powerlifting-12-weeks" : {
        "2999" : {
            period : "3months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "powerlifting-12-weeks.pdf"

        },
    },
    "powerlifting-bench-press-12-weeks" : {
        "2999" : {
            period : "3months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "powerlifting-bench-press-12-weeks.pdf"

        },
    },
    "personal-training" : {
        "5000" : {
            period : "1months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "personal-training-1moth.pdf"

        },
        "9000" : {
            period : "2months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "personal-training-2moth.pdf"

        },
        "12000" : {
            period : "3months",
            pdf : "https://www.dropbox.com/scl/fi/jg4qasep66f3y40dhl3pw/amazon.pdf?rlkey=3gxvhp969f7i0ty3lhw36vwfe&st=kl2ir1qz&dl=1"
            ,pdfName : "personal-training-3moth.pdf"

        }
    }
}

// Инициализация Resend с API ключом
const resend = new Resend(process.env.RESEND_API_KEY);

// Чтение HTML шаблона
const emailTemplatePath = path.join(__dirname, 'html-email-template', 'email-template.html');
const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');


// Маршрут для отправки письма
const sendEmailHandler = async (fullName, surname, email, training, price) => {
    console.log('sendEmailHandler')
    const selectedPrice = packages[training]?.[price]
    const pdf = packages[training]?.[price]?.pdf
    const pdfName = packages[training]?.[price]?.pdfName

    try {
        // Асинхронно отправляем письмо через Resend
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [email],
            subject:  training,
            html: emailTemplate,
            attachments: [
                {
                    filename:pdfName,
                    path: pdf,
                },
            ],

        });
        if (error) {
            console.error('Ошибка отправки:', error);
            return { success: false, message: 'Ошибка отправки письма' };
        }

        console.log('Ответ от Resend:', data);
        return { success: true, message: 'Письмо успешно отправлено!' };
    } catch (err) {
        console.error('Ошибка:', err);
        return { success: false, message: 'Произошла ошибка' };
    }
}

// Запуск сервера
app.listen(port, () => {
    console.log(`Приложение запущено на порту ${port}`);
});


