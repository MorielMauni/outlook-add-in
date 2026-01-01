/* global Office */

// This function is the entry point for the "OnNewMessageCompose" and "OnNewAppointmentOrganizer" events.
function checkSignature(event) {
    setSignature('hebrew', event);
}

// Reusable function to set the signature based on type ('hebrew' or 'english')
function setSignature(type, event) {
    let signatureHtml = "";
    // In a real scenario, you might want to fetch these from a service or config.
    // We use the absolute URL to the assets served by the add-in.
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
        <p style="margin: 0; padding-bottom: 5px;"><strong>John Doe</strong><br>
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
            }

            // If triggered by an event, we must signal completion.
            if (event) {
                event.completed();
            }
        }
    );
}

// Expose functions to the global scope so they can be called by the event handler and task pane.
if (typeof self !== "undefined") {
    self.checkSignature = checkSignature;
    self.setSignature = setSignature;
}

// Register with Office.actions for modern event-based activation
Office.onReady(() => {
    if (Office.actions) {
        Office.actions.associate("checkSignature", checkSignature);
    }
});

module.exports = {
    checkSignature,
    setSignature
};
