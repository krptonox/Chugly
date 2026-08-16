import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface SendMailOptions {
    email: string;
    subject: string;
    mailgenContent: Mailgen.Content;
}



const sendMail = async (options: SendMailOptions): Promise<void> => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "http://localhost:3000",
        },
    });

    const emailTextual = mailGenerator.generatePlaintext(
        options.mailgenContent
    );

    const emailHtml = mailGenerator.generate(
        options.mailgenContent
    );

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,

        port: Number(process.env.MAILTRAP_SMTP_PORT),

        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD,
        },
    });

    const mail = {
        from: "krptonox7@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        throw new Error("Error sending email");
    }
};

const emailVerficationMailgenContent = (
    username: string,
    verificationurl: string
): Mailgen.Content => {
    return {
        body: {
            name: username,
            intro: "Welcome to Chugly! We're very excited to have you on board.",
            action: {
                instructions:
                    "To verify your email, please click the button below:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: verificationurl,
                },
            },
            outro:
                "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

const forgotPasswordMailgenContent = (
    username: string,
    passwordreseturl: string
): Mailgen.Content => {
    return {
        body: {
            name: username,
            intro: "We're resetting your password.",
            action: {
                instructions:
                    "To reset your password, please click the button below:",
                button: {
                    color: "#ad1f1f",
                    text: "Reset Password",
                    link: passwordreseturl,
                },
            },
            outro:
                "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

export {
    emailVerficationMailgenContent,
    forgotPasswordMailgenContent,
    sendMail,
};