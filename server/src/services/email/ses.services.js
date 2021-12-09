const AWS = require('aws-sdk');

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION
};

const ses = new AWS.SES(awsConfig); // apiVersion

exports.sendAccountActivationMail = (email, token) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [email]
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
                        <html>
                            <h1>Verify your email address</h1>
                            <p>Please use the following link to complete your registration:</p>
                            <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                        </html>
                    `
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Complete your registration'
      }
    }
  };

  return ses.sendEmail(params).promise();
};

exports.sendPasswordResetMail = (email, shortCode) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [email]
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
                        <html>
                            <h1>Reset your password</h1>
                            <p>Please use the following code to reset your password:</p>
                            <span>${shortCode}</span>
                        </html>
                    `
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Password reset link'
      }
    }
  };

  return ses.sendEmail(params).promise();
};

// export const sendCategorySubscriptionMail = (email, data: any) => {
//   const params: SES.SendEmailRequest = {
//     Source: process.env.EMAIL_FROM,
//     Destination: {
//       ToAddresses: [email],
//     },
//     ReplyToAddresses: [process.env.EMAIL_FROM],
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data: `
//                         <html>
//                             <h1>New link published | </h1>
//                             <p>A new link titled <b>${
//                               data.title
//                             }</b> has been published in the following categories:</p>
//                             ${data.categories
//                               .map(({ name, image, slug }) => {
//                                 return `
//                                     <div>
//                                         <h2>${name}</h2>
//                                         <img src="${image.url}" alt="${name}" style="height: 50px;" />
//                                         <h3><a href="${process.env.CLIENT_URL}/links/${slug}">Check it out</a></h3>
//                                     </div>
//                                 `;
//                               })
//                               .join(`---------------------------`)}

//                             <p>Do not want to receive notifications?</p>
//                             <p>Turn off notification from your <b>dashboard</b> > <b>update profile</b> and <b>uncheck the categories</b></p>
//                             <p>${process.env.CLIENT_URL}/user/profile/update</p>
//                             </html>
//                     `,
//         },
//       },
//       Subject: {
//         Charset: 'UTF-8',
//         Data: 'New link published',
//       },
//     },
//   };

//   return ses.sendEmail(params).promise();
// };
