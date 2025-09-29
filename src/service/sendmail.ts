import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";


export const sendmail= async (mailoptions: Mail.Options)=>{
        

    // create reusable transporter
    const transporter = nodemailer.createTransport({
    service: "gmail", // or smtp detailsو,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
    rejectUnauthorized: false, // بيتجاهل مشكلة الشهادة
  },
    });

    // send mail

    try {
        const info = await transporter.sendMail({
        from: '"social app" ' + process.env.EMAIL_USER,
        to: mailoptions.to,
            ...mailoptions,
        });

        console.log("Message sent:", info.messageId);
    } catch (err) {
        console.error("Error sending email:", err);
    }

}
// gnerate otp from six numbers
export const generateOTP = (length: number): string => {
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
}