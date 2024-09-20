const express = require('express');
const { Resend } = require('resend'); // Импортируем Resend
const cors = require('cors');
const app = express();
const fs = require('fs');
const path = require('path');
const port = 4000;



app.use(cors());
app.use(express.json());

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
const RESEND_API_KEY = "re_g1kgYZJk_EUVNJBwLHC2awYE7FJPYPxw2";
const resend = new Resend(RESEND_API_KEY);

// Чтение HTML шаблона
const emailTemplatePath = path.join(__dirname, 'html-email-template', 'email-template.html');
const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');


// Маршрут для отправки письма
app.post('/send-email', async (req, res) => {
    const { recipientEmail, subject, message ,title , price } = req.body;

    const selectedPrice = packages[title]?.[price]
    const pdf = packages[title]?.[price]?.pdf
    const pdfName = packages[title]?.[price]?.pdfName
        try {
        // Асинхронно отправляем письмо через Resend
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [recipientEmail],
            subject:  subject,
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
            return res.status(500).send('Ошибка отправки письма');
        }

        console.log('Ответ от Resend:', data);
        res.send('Письмо успешно отправлено!');
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send('Произошла ошибка');
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Приложение запущено на порту ${port}`);
});


