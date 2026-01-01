/* global Office */

// This function is the entry point for the "OnNewMessageCompose" and "OnNewAppointmentOrganizer" events.
function checkSignature(event) {
    setSignature('hebrew', event);
}

// Reusable function to set the signature based on type ('hebrew' or 'english')
async function setSignature(type, event) {
    // We use the absolute URL to the assets served by the add-in.
    // In production, this should be the hosting domain. 
    // For relative paths to work in fetch within the runtime, we need absolute URLs usually.
    const baseUrl = "https://localhost:3000/assets/";
    const fileName = type === 'hebrew' ? "signature-hebrew.html" : "signature-english.html";
    const url = baseUrl + fileName;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load signature file: ${response.statusText}`);
        }
        let signatureHtml = await response.text();

        // If we need to replace dynamic placeholders (like name/phone), we would do it here.
        // e.g. signatureHtml = signatureHtml.replace("{NAME}", userProfile.displayName);

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

    } catch (error) {
        console.error("Error fetching signature:", error);
        // Ensure event completes even on error to avoid blocking Outlook
        if (event) {
            event.completed({ allowEvent: true });
        }
    }
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
