/* global Office */
import { getHebrewSignature, getEnglishSignature } from '../taskpane/signatureTemplates';

// This function is the entry point for the "OnNewMessageCompose" and "OnNewAppointmentOrganizer" events.
function checkSignature(event) {
    // Default to Hebrew signature for auto-run
    setSignature('hebrew', event);
}

// Reusable function to set the signature based on type ('hebrew' or 'english')
function setSignature(type, event) {
    try {
        const userProfile = Office.context.mailbox.userProfile;
        const user = {
            displayName: userProfile.displayName,
            emailAddress: userProfile.emailAddress,
            jobTitle: '',
            phone: ''
        };

        let signatureHtml;
        if (type === 'hebrew') {
            signatureHtml = getHebrewSignature(user);
        } else {
            signatureHtml = getEnglishSignature(user);
        }

        Office.context.mailbox.item.body.setSignatureAsync(
            signatureHtml,
            { coercionType: Office.CoercionType.Html },
            function (asyncResult) {
                if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                    console.error("Failed to set signature: " + asyncResult.error.message);
                } else {
                    console.log("Signature set successfully");
                }

                // If triggered by an event, we must signal completion.
                if (event) {
                    event.completed();
                }
            }
        );

    } catch (error) {
        console.error("Error setting signature:", error);
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
