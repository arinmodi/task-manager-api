const sgMail = require('@sendgrid/mail')

const sendgridapi = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridapi)

const sendWelcomeEmail = (email,name) => {
    sgMail.send({
        to : email,
        from : 'genztechsolutions@gmail.com',
        subject : 'Thanks choosing us!',
        text : `Welcome to the app, ${name}. Let me know how you get along the app.`
    })
}

const sendCancelEmail = (email,name) => {
    sgMail.send({
        to : email,
        from : 'genztechsolutions@gmail.com',
        subject : `Good Bye ${name}!`,
        text : `Thanks ${name} for stick with us till now. Let me know, what was happned that you removed your account? I am waiting for your response...`
    })
}

module.exports = {
    welcomeEmail : sendWelcomeEmail,
    CancelEmail : sendCancelEmail
}