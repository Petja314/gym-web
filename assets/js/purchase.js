// BTN_ID yoomoney-auth

function initiateYooMoneyPayment(amount) {
    axios.post('http://localhost:3000/auth/yoomoney' , {
        amount : amount
    })

}