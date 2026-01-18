/* global Office */
import { getHebrewSignature, getEnglishSignature } from './signatureTemplates';

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    const userProfile = Office.context.mailbox.userProfile;
    const user = {
      displayName: userProfile.displayName,
      emailAddress: userProfile.emailAddress,
      // Note: Outlook's basic userProfile doesn't provide JobTitle or Phone.
      // We would need to use Graph API for that, which is out of scope for now.
      jobTitle: '', 
      phone: ''
    };

    // Render previews
    const phoneToggle = document.getElementById("phone-toggle");
    
    // Load saved state
    const savedState = localStorage.getItem('hidePhone') === 'true';
    phoneToggle.checked = savedState;

    function updateSignatures() {
      const hidePhone = phoneToggle.checked;
      document.getElementById("hebrew-signature-container").innerHTML = getHebrewSignature(user, hidePhone);
      document.getElementById("english-signature-container").innerHTML = getEnglishSignature(user, hidePhone);
    }

    // Initial render
    updateSignatures();

    // Event listener for toggle
    phoneToggle.addEventListener('change', () => {
        localStorage.setItem('hidePhone', phoneToggle.checked);
        updateSignatures();
    });

    document.getElementById("btn-hebrew").onclick = () => {
        const hidePhone = phoneToggle.checked;
        setSignature(getHebrewSignature(user, hidePhone));
    };
    document.getElementById("btn-english").onclick = () => {
        const hidePhone = phoneToggle.checked;
        setSignature(getEnglishSignature(user, hidePhone));
    };
  }
});

function setSignature(signatureHtml) {
  Office.context.mailbox.item.body.setSignatureAsync(
    signatureHtml,
    { coercionType: Office.CoercionType.Html },
    function (asyncResult) {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error("Failed to set signature: " + asyncResult.error.message);
      } else {
        console.log("Signature set successfully");
      }
    }
  );
}
