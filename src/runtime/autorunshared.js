/* global Office */

// This function is the entry point for the "OnNewMessageCompose" and "OnNewAppointmentOrganizer" events.
function checkSignature(event) {
    setSignature(event);
}

// Function to fetch default signature and set it
async function setSignature(event) {
    try {
        const item = Office.context.mailbox.item;
        const userProfile = Office.context.mailbox.userProfile;
        const user = {
            displayName: userProfile.displayName,
            emailAddress: userProfile.emailAddress,
            jobTitle: '',
            phone: ''
        };

        // 1. Fetch default filename
        // Note: In production, consider caching this or handling network failures gracefully
        const defaultRes = await fetch('https://localhost:3000/admin/default');
        const defaultData = await defaultRes.json();
        const filename = defaultData.filename;

        if (!filename) {
            console.log("No default signature set.");
            if (event) event.completed();
            return;
        }

        // 2. Fetch file content
        const contentRes = await fetch('https://localhost:3000/admin/files/' + filename);
        let signatureHtml = await contentRes.text();

        // 3. Replace placeholders
        signatureHtml = signatureHtml.replace(/{NAME}/g, user.displayName)
                                     .replace(/{EMAIL}/g, user.emailAddress)
                                     .replace(/{ROLE}/g, user.jobTitle || 'Role') // Fallback if empty
                                     .replace(/{PHONE}/g, user.phone || 'Phone')
                                     .replace(/{FAX}/g, 'Fax'); // Static placeholder for now

        // 4. Set signature based on Item Type
        // setSignatureAsync is preferred for Messages (Classic, New, OWA)
        // setSelectedDataAsync is required for Appointments as setSignatureAsync is not supported there.

        if (item.itemType === Office.MailboxEnums.ItemType.Message) {
            item.body.setSignatureAsync(
                signatureHtml,
                { coercionType: Office.CoercionType.Html },
                function (asyncResult) {
                    processResult(asyncResult, event);
                }
            );
        } else if (item.itemType === Office.MailboxEnums.ItemType.Appointment) {
            // For appointments, append to the body/description
            item.body.setSelectedDataAsync(
                signatureHtml,
                { 
                    coercionType: Office.CoercionType.Html,
                    asyncContext: event 
                },
                function (asyncResult) {
                     processResult(asyncResult, event);
                }
            );
        } else {
            // Fallback or unknown item type
            console.warn("Unknown item type: " + item.itemType);
             if (event) event.completed();
        }

    } catch (error) {
        console.error("Error setting signature:", error);
        if (event) {
            event.completed({ allowEvent: true });
        }
    }
}

function processResult(asyncResult, event) {
    if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error("Failed to set signature: " + asyncResult.error.message);
    } else {
        console.log("Signature set successfully");
    }

    if (event) {
        event.completed();
    }
}

// Expose functions to the global scope
if (typeof self !== "undefined") {
    self.checkSignature = checkSignature;
    self.setSignature = setSignature;
}

// Register with Office.actions
Office.onReady(() => {
    if (Office.actions) {
        Office.actions.associate("checkSignature", checkSignature);
    }
});

module.exports = {
    checkSignature,
    setSignature
};
