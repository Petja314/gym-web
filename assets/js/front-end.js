const getPriceValue = async (button) => {
    const price = button.value
    const title = button.closest('[data-block="pricing-block"]').getAttribute('data-title')
    // console.log("price >" , price)
    // console.log("title >" , title)

    const response = await fetch('http://localhost:4000/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            recipientEmail: "petja314@gmail.com",
            subject: "Hello from the client!",
            message: "This is a message sent from the frontend.",
            price : price,
            title : title
        }),
    });
    const data = await response.json()
    if(response.ok){
        console.log('EMAIL SUCCESSFULLY SENT :' , data)
    }
    else{
        console.error('Error while sending the email :' , data)
    }

}

