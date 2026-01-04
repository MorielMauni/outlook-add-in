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
    document.getElementById("hebrew-signature-container").innerHTML = getHebrewSignature(user);
    document.getElementById("english-signature-container").innerHTML = getEnglishSignature(user);

    document.getElementById("btn-hebrew").onclick = () => setSignature(getHebrewSignature(user));
    document.getElementById("btn-english").onclick = () => setSignature(getEnglishSignature(user));
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
