/* global Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("btn-hebrew").onclick = () => setSignature("hebrew");
    document.getElementById("btn-english").onclick = () => setSignature("english");
  }
});

function setSignature(type) {
  let signatureHtml = "";
  const baseUrl = "https://localhost:3000/assets/";

  if (type === 'hebrew') {
    signatureHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; direction: rtl; text-align: right;">
        <p style="margin: 0; padding-bottom: 5px;">בברכה,</p>
        <p style="margin: 0; padding-bottom: 5px;"><strong>ישראל ישראלי</strong><br>
        מנהל פיתוח עסקי<br>
        חברת מ&ד<br>
        טלפון: 050-1234567</p>
        <img src="${baseUrl}signature-hebrew.png" alt="Hebrew Signature" width="300" style="display: block;" />
        <br>
        <img src="${baseUrl}logo.png" alt="Company Logo" width="50" style="margin-top: 10px; display: block;" />
      </div>
    `;
  } else {
    signatureHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; direction: ltr; text-align: left;">
        <p style="margin: 0; padding-bottom: 5px;">Best regards,</p>
        <p style="margin: 0; padding-bottom: 5px;"><strong>Israel Israeli</strong><br>
        Business Development Manager<br>
        M&D Company<br>
        Phone: +972-50-1234567</p>
        <img src="${baseUrl}signature-english.png" alt="English Signature" width="300" style="display: block;" />
        <br>
        <img src="${baseUrl}logo.png" alt="Company Logo" width="50" style="margin-top: 10px; display: block;" />
      </div>
    `;
  }

  Office.context.mailbox.item.body.setSignatureAsync(
    signatureHtml,
    { coercionType: Office.CoercionType.Html },
    function (asyncResult) {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error("Failed to set signature: " + asyncResult.error.message);
      } else {
        console.log("Signature set to " + type);
      }
    }
  );
}
